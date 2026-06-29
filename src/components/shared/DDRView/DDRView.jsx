import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getDDR } from '../../../services/exploitationService';
import './DDRView.css';

const ROLES_PRESET = [
  'Chargé de conduite',
  'Chargé de manœuvres',
  'Chargé de consignation',
  'Chargé de travaux',
  'Surveillant de Sécurité',
  'Coordination des travaux',
];

// Rôles affichés par défaut à la création (le responsable ajoute les autres)
const ROLES_DEFAULT = ['Chargé de consignation', 'Chargé de travaux', 'Chargé de manœuvres'];

const isPreset = (role) => ROLES_PRESET.includes(role);

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const SECURITE_DEFAULT =
`Aux points de séparation :
1. Séparation des départs de toute source de tension.
2. Condamnation des sectionneurs de terre des départs en position fermeture.

Sur le lieu de travail :
3. Identification des travées départs retirées de l'exploitation.
4. Vérification d'absence de tension suivie de la mise à la terre et en court-circuit sur les trois phases.

* À la diligence du Chargé de consignation :
- Effectuer les manœuvres de consignation
- Vérifier la perche à néon après chaque test d'absence de tension
- Vérifier l'absence de tension en amont et en aval de l'installation consignée
- Poser les DMT et en CC au Chantier

* À la diligence du Chargé de Travaux :
- Baliser la zone de travail
- Veiller au port des EPI par tous les agents au chantier
- Veiller au respect des normes de sécurité
- Vérifier l'absence de tension avant le début des travaux

Le chargé de travaux prendra toute autre disposition nécessaire pour assurer la sécurité de son personnel pendant les travaux et veiller au non-accès dans la zone de travail par des personnes non autorisées.`;


const DDRView = forwardRef(({ ddrId, readOnly = false }, ref) => {
  const [ddr, setDdr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fields, setFields] = useState({
    numFicheProbleme: '',
    dateReceptionDemande: '',
    debutConsignationDate: '',
    debutConsignationHeure: '',
    retourExploitationDate: '',
    delaiRestitution: '',
    observations: '',
    securite: SECURITE_DEFAULT,
  });

  const [roles, setRoles] = useState([]);
  const [chantiersLocal, setChantiersLocal] = useState([]);
  const [fieldsVersion, setFieldsVersion] = useState(0);

  useEffect(() => {
    if (!ddrId) return;
    getDDR(ddrId)
      .then(res => {
        const data = res.data;
        setDdr(data);

        // Pré-remplissage des champs éditables depuis l'API
        const debutCons = data.debut_consignation ? new Date(data.debut_consignation) : null;
        setFields({
          numFicheProbleme:       data.numero_fiche_probleme     || '',
          dateReceptionDemande:   data.date_reception_demande    || '',
          debutConsignationDate:  debutCons ? debutCons.toISOString().split('T')[0] : '',
          debutConsignationHeure: debutCons ? debutCons.toTimeString().slice(0, 5)   : '',
          retourExploitationDate: data.retour_exploitation       || '',
          delaiRestitution:       data.delai_restitution_urgence || '',
          observations:           data.observations_generales    || '',
          securite:               data.point_separation          || SECURITE_DEFAULT,
        });

        // Rôles depuis RoleDDR ; si aucun, 6 lignes présets avec chargé de consignation pré-rempli
        const chantiersList   = data.chantiers || [];
        const firstChantierId = chantiersList[0]?.id || null;
        if (data.roles && data.roles.length > 0) {
          setRoles(data.roles.map(r => ({
            id:        r.id,
            role:      r.role      || '',
            chantier:  r.chantier  || null,
            personne:  r.personne  || '',
            unite:     r.unite     || '',
            telephone: r.telephone || '',
          })));
        } else {
          setRoles(ROLES_DEFAULT.map((role, i) => ({
            id:        `new_${Date.now()}_${i}`,
            role,
            chantier:  firstChantierId,
            personne:  role === 'Chargé de consignation' ? (data.charge_consignation_nom       || '') : '',
            unite:     '',
            telephone: role === 'Chargé de consignation' ? (data.charge_consignation_telephone || '') : '',
          })));
        }

        // Chantiers depuis la table ChantierDDR
        setChantiersLocal(data.chantiers || []);
        setFieldsVersion(v => v + 1);
      })
      .catch(() => setError('Impossible de charger la DDR.'))
      .finally(() => setLoading(false));
  }, [ddrId]);

  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      fields,
      roles,
      chantiers:          chantiersLocal,
      originalChantiers:  ddr?.chantiers || [],
      originalRoles:      ddr?.roles     || [],
    }),
  }));

  const setField = (key, val) => setFields(prev => ({ ...prev, [key]: val }));

  // ── Rôles ─────────────────────────────────────────────────────────────────
  const addRole    = () => setRoles(prev => [...prev, { id: `new_${Date.now()}`, role: 'Chargé de conduite', chantier: chantiersLocal[0]?.id || null, personne: '', unite: '', telephone: '' }]);
  const removeRole = (id) => setRoles(prev => prev.filter(r => r.id !== id));
  const updateRole = (id, key, val) => setRoles(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

  // ── Chantiers ──────────────────────────────────────────────────────────────
  const addChantier    = () => setChantiersLocal(prev => [...prev, { id: `new_${Date.now()}`, numero: prev.length + 1, consistance: '' }]);
  const removeChantier = (id) => setChantiersLocal(prev => prev.filter(c => c.id !== id));
  const updateChantier = (id, val) => setChantiersLocal(prev => prev.map(c => c.id === id ? { ...c, consistance: val } : c));

  if (loading) return <div className="ddr-state">Chargement de la DDR...</div>;
  if (error)   return <div className="ddr-state ddr-state-error">{error}</div>;
  if (!ddr)    return null;

  const t = ddr.travail;
  const nomOuvrage = t?.reference?.items?.find(it => it.type?.nom?.toLowerCase() === 'ouvrage')?.valeur || '—';
  const isTransport = t?.segment === 'TRANSPORT';
  const companyLogo = isTransport ? '/logosonarel.png' : '/socadel.jpg';
  const companyAlt  = isTransport ? 'SONATREL' : 'SOCADEL';
  const orgLabel    = isTransport
    ? "DIRECTION DE L'EXPLOITATION DES SYSTÈMES ÉLECTRIQUES\nSOUS-DIRECTION CONDUITE EN TEMPS RÉEL"
    : "Direction de l'Exploitation et de la Maintenance Réseaux";

  const EditField = ({ fieldKey, type = 'text', placeholder = '', className = '' }) => {
    if (readOnly) return <span className="ddr-ro">{fields[fieldKey] || '—'}</span>;
    if (type === 'date' || type === 'time') {
      return (
        <input
          key={`${fieldKey}-${fieldsVersion}`}
          className={`ddr-input ${className}`}
          type={type}
          defaultValue={fields[fieldKey] || ''}
          onChange={e => { if (e.target.value) setField(fieldKey, e.target.value); }}
          onBlur={e => setField(fieldKey, e.target.value)}
        />
      );
    }
    return (
      <input
        className={`ddr-input ${className}`}
        type={type}
        value={fields[fieldKey]}
        onChange={e => setField(fieldKey, e.target.value)}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div className={`ddr-doc${readOnly ? ' ddr-doc--readonly' : ''}`}>

      {/* ── EN-TÊTE ─────────────────────────────────────────────────────── */}
      <div className="ddr-header">
        <div className="ddr-header-brand">
          <img src={companyLogo} alt={companyAlt} className="ddr-logo-img" />
          <div className="ddr-header-org" style={{ whiteSpace: 'pre-line' }}>{orgLabel}</div>
        </div>
        <table className="ddr-meta">
          <tbody>
            <tr>
              <td>N° demande de retrait</td>
              <td><strong>{ddr.reference || `DDR-${String(ddr.id).substring(0, 8).toUpperCase()}`}</strong></td>
            </tr>
            <tr>
              <td>Date d'émission</td>
              <td>{fmtDate(ddr.date_emission)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── TITRE ───────────────────────────────────────────────────────── */}
      <div className="ddr-title-bar">
        <h2 className="ddr-title">DEMANDE DE RETRAIT</h2>
      </div>

      {/* ── SECTION DEMANDEUR ───────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-2col-grid">
          <div className="ddr-field-group">
            <span className="ddr-label">Unité demanderesse :</span>
            <span className="ddr-ro ddr-value-strong">{t?.unite_demanderesse?.nom || '—'}</span>
          </div>
          <div className="ddr-field-group">
            <span className="ddr-label">Nom du demandeur :</span>
            <span className="ddr-ro ddr-value-strong">{ddr.emis_par_nom || '—'}</span>
          </div>
          <div className="ddr-field-group">
            <span className="ddr-label">N° Fiche problème :</span>
            {EditField({ fieldKey: "numFicheProbleme", placeholder: "Numéro" })}
          </div>
          <div className="ddr-field-group">
            <span className="ddr-label">Date réception demande :</span>
            {EditField({ fieldKey: "dateReceptionDemande", type: "date" })}
          </div>
        </div>
      </div>

      {/* ── INSTALLATION ────────────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-section-label">Installation / Ouvrage à retirer de la conduite du réseau :</div>
        <div className="ddr-installation">
          {nomOuvrage}
        </div>
      </div>

      {/* ── CHANTIERS ───────────────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-section-label">Consistance des travaux :</div>
        <div className="ddr-table-wrap ddr-chantiers-wrap">
        <table className="ddr-chantiers-table">
          <thead>
            <tr>
              <th className="ddr-chantier-num-col">N°</th>
              <th>Consistance des travaux</th>
              {!readOnly && <th className="ddr-th-action" />}
            </tr>
          </thead>
          <tbody>
            {chantiersLocal.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 2 : 3} className="ddr-chantiers-empty">
                  {readOnly ? '—' : 'Aucun chantier. Cliquez sur « + Ajouter un chantier » ci-dessous.'}
                </td>
              </tr>
            ) : (
              chantiersLocal.map((c) => (
                <tr key={c.id}>
                  <td className="ddr-chantier-num-col">Chantier {c.numero}</td>
                  <td>
                    {readOnly ? (
                      <span className="ddr-ro">{c.consistance || '—'}</span>
                    ) : (
                      <textarea
                        className="ddr-chantier-textarea"
                        value={c.consistance}
                        onChange={e => updateChantier(c.id, e.target.value)}
                        placeholder="Décrire la consistance des travaux..."
                      />
                    )}
                  </td>
                  {!readOnly && (
                    <td className="ddr-td-action">
                      <button className="ddr-btn-remove" onClick={() => removeChantier(c.id)} title="Supprimer">✕</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        {!readOnly && (
          <button className="ddr-btn-add" onClick={addChantier}>+ Ajouter un chantier</button>
        )}
      </div>

      {/* ── PLANNING ────────────────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-planning-2col">

          {/* Ligne 1 */}
          <div className="ddr-pfield">
            <span className="ddr-plabel">Début de la consignation le :</span>
            <div className="ddr-pvalue">
              {EditField({ fieldKey: "debutConsignationDate", type: "date" })}
              <span className="ddr-label-a">à</span>
              {EditField({ fieldKey: "debutConsignationHeure", type: "time" })}
            </div>
          </div>
          <div className="ddr-pfield">
            <span className="ddr-plabel">Retour à l'exploitation le :</span>
            <div className="ddr-pvalue">
              {EditField({ fieldKey: "retourExploitationDate", type: "date" })}
            </div>
          </div>

          {/* Ligne 2 */}
          <div className="ddr-pfield">
            <span className="ddr-plabel">Début des travaux le :</span>
            <div className="ddr-pvalue">
              <span className="ddr-ro">{fmtDate(t?.heure_debut_planifie)}</span>
              <span className="ddr-label-a">à</span>
              <span className="ddr-ro">{fmtTime(t?.heure_debut_planifie)}</span>
            </div>
          </div>
          <div className="ddr-pfield">
            <span className="ddr-plabel">Fin des travaux le :</span>
            <div className="ddr-pvalue">
              <span className="ddr-ro">{fmtDate(t?.heure_fin_planifie)}</span>
              <span className="ddr-label-a">à</span>
              <span className="ddr-ro">{fmtTime(t?.heure_fin_planifie)}</span>
            </div>
          </div>

          {/* Ligne 3 — pleine largeur */}
          <div className="ddr-pfield ddr-pfield-full">
            <span className="ddr-plabel">Délai de restitution d'urgence :</span>
            <div className="ddr-pvalue">
              {EditField({ fieldKey: "delaiRestitution", placeholder: "Ex : 2H00" })}
            </div>
          </div>

        </div>
      </div>

      {/* ── TABLEAU DES RÔLES ───────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-table-wrap">
        <table className="ddr-roles-table">
          <thead>
            <tr>
              <th>Affectations / Rôles</th>
              <th className="ddr-col-chantier">Chantier</th>
              <th>Personne désignée</th>
              <th>Unité</th>
              <th>Téléphone</th>
              {!readOnly && <th className="ddr-th-action" />}
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.id}>

                {/* Rôle */}
                <td className="ddr-td-role">
                  {readOnly ? (
                    r.role || '—'
                  ) : isPreset(r.role) ? (
                    <select
                      className="ddr-select"
                      value={r.role}
                      onChange={e => updateRole(r.id, 'role', e.target.value === '__autre__' ? '' : e.target.value)}
                    >
                      {ROLES_PRESET.map(rp => <option key={rp} value={rp}>{rp}</option>)}
                      <option value="__autre__">Autre...</option>
                    </select>
                  ) : (
                    <div className="ddr-role-custom-wrap">
                      <input
                        className="ddr-input-sm"
                        value={r.role}
                        onChange={e => updateRole(r.id, 'role', e.target.value)}
                        placeholder="Préciser le rôle..."
                        autoFocus
                      />
                      <button className="ddr-btn-back" onClick={() => updateRole(r.id, 'role', ROLES_PRESET[0])} title="Revenir à la liste">↩</button>
                    </div>
                  )}
                </td>

                {/* Chantier */}
                <td className="ddr-col-chantier">
                  {readOnly ? (
                    chantiersLocal.find(c => c.id === r.chantier)
                      ? `Chantier ${chantiersLocal.find(c => c.id === r.chantier).numero}`
                      : '—'
                  ) : (
                    <select
                      className="ddr-select ddr-select-sm"
                      value={r.chantier || ''}
                      onChange={e => updateRole(r.id, 'chantier', e.target.value || null)}
                    >
                      <option value="">—</option>
                      {chantiersLocal.map(c => (
                        <option key={c.id} value={c.id}>Chantier {c.numero}</option>
                      ))}
                    </select>
                  )}
                </td>

                {/* Personne */}
                <td>
                  {readOnly ? (r.personne || '—') : (
                    <input className="ddr-input-sm" value={r.personne} onChange={e => updateRole(r.id, 'personne', e.target.value)} />
                  )}
                </td>

                {/* Unité */}
                <td>
                  {readOnly ? (r.unite || '—') : (
                    <input className="ddr-input-sm" value={r.unite} onChange={e => updateRole(r.id, 'unite', e.target.value)} />
                  )}
                </td>

                {/* Téléphone */}
                <td>
                  {readOnly ? (r.telephone || '—') : (
                    <input className="ddr-input-sm" value={r.telephone} onChange={e => updateRole(r.id, 'telephone', e.target.value)} />
                  )}
                </td>

                {/* Supprimer */}
                {!readOnly && (
                  <td className="ddr-td-action">
                    <button className="ddr-btn-remove" onClick={() => removeRole(r.id)} title="Supprimer">✕</button>
                  </td>
                )}

              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {!readOnly && (
          <button className="ddr-btn-add" onClick={addRole}>+ Ajouter un rôle</button>
        )}
      </div>

      {/* ── OBSERVATIONS ────────────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-section-label">Observations générales :</div>
        {readOnly ? (
          <div className="ddr-obs-content">{fields.observations || '—'}</div>
        ) : (
          <textarea
            className="ddr-textarea"
            rows={4}
            value={fields.observations}
            onChange={e => setField('observations', e.target.value)}
            placeholder="Saisir vos observations..."
          />
        )}
      </div>

      {/* ── MESURES DE SÉCURITÉ ─────────────────────────────────────────── */}
      <div className="ddr-section ddr-securite">
        <div className="ddr-securite-title">Mesures de Sécurité</div>
        {readOnly ? (
          <div className="ddr-securite-content">{fields.securite}</div>
        ) : (
          <textarea
            className="ddr-textarea ddr-securite-textarea"
            rows={20}
            value={fields.securite}
            onChange={e => setField('securite', e.target.value)}
          />
        )}
      </div>

      {/* ── SIGNATURE ───────────────────────────────────────────────────── */}
      <div className="ddr-signature-bar">
        <div className="ddr-signature-block">
          <div className="ddr-signature-title">Le Chef d'Exploitation</div>
          <div className="ddr-signature-line" />
        </div>
      </div>

    </div>
  );
});

DDRView.displayName = 'DDRView';
export default DDRView;
