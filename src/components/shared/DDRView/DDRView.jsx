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

const isPreset = (role) => ROLES_PRESET.includes(role);

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const DDRView = forwardRef(({ ddrId, readOnly = false }, ref) => {
  const [ddr, setDdr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const [fields, setFields] = useState({
    dateModification: '',
    numFicheProbleme: '',
    dateReceptionDemande: '',
    debutConsignationDate: '',
    debutConsignationHeure: '',
    retourExploitationDate: '',
    retourExploitationHeure: '',
    delaiRestitution: '',
    observations: '',
    securite: SECURITE_DEFAULT,
  });

  const [roles, setRoles] = useState([
    { id: 1, role: 'Chargé de conduite', chantier: 'Chantier 1', personne: '', unite: '', telephone: '', locked: false },
    { id: 2, role: 'Chargé de travaux',  chantier: 'Chantier 1', personne: '', unite: '', telephone: '', locked: true  },
  ]);

  useEffect(() => {
    if (!ddrId) return;
    getDDR(ddrId)
      .then(res => {
        const data = res.data;
        setDdr(data);
        const cc = data.travail?.charge_consignation;
        if (cc) {
          setRoles(prev => prev.map(r =>
            r.role === 'Chargé de travaux'
              ? { ...r, personne: [cc.first_name, cc.last_name].filter(Boolean).join(' '), unite: data.travail?.unite_demanderesse?.nom || '' }
              : r
          ));
        }
      })
      .catch(() => setError('Impossible de charger la DDR.'))
      .finally(() => setLoading(false));
  }, [ddrId]);

  useImperativeHandle(ref, () => ({
    getFormData: () => ({ ...fields, roles }),
  }));

  const setField = (key, val) => setFields(prev => ({ ...prev, [key]: val }));
  const addRole  = () => setRoles(prev => [...prev, { id: Date.now(), role: 'Chargé de conduite', chantier: 'Chantier 1', personne: '', unite: '', telephone: '', locked: false }]);
  const removeRole = (id) => setRoles(prev => prev.filter(r => r.id !== id));
  const updateRole = (id, key, val) => setRoles(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));

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

  const EditField = ({ fieldKey, type = 'text', placeholder = '', className = '' }) =>
    readOnly
      ? <span className="ddr-ro">{fields[fieldKey] || '—'}</span>
      : <input className={`ddr-input ${className}`} type={type} value={fields[fieldKey]} onChange={e => setField(fieldKey, e.target.value)} placeholder={placeholder} />;

  return (
    <div className={`ddr-doc${readOnly ? ' ddr-doc--readonly' : ''}`}>

      {/* ── EN-TÊTE ─────────────────────────────────────────────── */}
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
            <tr>
              <td>Date de modification</td>
              <td><EditField fieldKey="dateModification" type="date" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── TITRE ───────────────────────────────────────────────── */}
      <div className="ddr-title-bar">
        <h2 className="ddr-title">DEMANDE DE RETRAIT</h2>
      </div>

      {/* ── SECTION DEMANDEUR ───────────────────────────────────── */}
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
            <EditField fieldKey="numFicheProbleme" placeholder="Numéro" />
          </div>
          <div className="ddr-field-group">
            <span className="ddr-label">Date réception demande :</span>
            <EditField fieldKey="dateReceptionDemande" type="date" />
          </div>
        </div>
      </div>

      {/* ── INSTALLATION ────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-section-label">Installation / Ouvrage à retirer de la conduite du réseau :</div>
        <div className="ddr-installation">
          {nomOuvrage}
        </div>
      </div>

      {/* ── CONSISTANCE ─────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-section-label">Consistance des travaux :</div>
        <div className="ddr-consistance">{t?.consistance_travaux || '—'}</div>
      </div>

      {/* ── PLANNING ────────────────────────────────────────────── */}
      <div className="ddr-section">
        <div className="ddr-planning-2col">

          {/* Ligne 1 */}
          <div className="ddr-pfield">
            <span className="ddr-plabel">Début de la consignation le :</span>
            <div className="ddr-pvalue">
              <EditField fieldKey="debutConsignationDate" type="date" />
              <span className="ddr-label-a">à</span>
              <EditField fieldKey="debutConsignationHeure" type="time" />
            </div>
          </div>
          <div className="ddr-pfield">
            <span className="ddr-plabel">Retour à l'exploitation le :</span>
            <div className="ddr-pvalue">
              <EditField fieldKey="retourExploitationDate" type="date" />
              <span className="ddr-label-a">à</span>
              <EditField fieldKey="retourExploitationHeure" type="time" />
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
              <EditField fieldKey="delaiRestitution" placeholder="Ex : 2H00" />
            </div>
          </div>

        </div>
      </div>

      {/* ── TABLEAU DES RÔLES ───────────────────────────────────── */}
      <div className="ddr-section">
        <table className="ddr-roles-table">
          <thead>
            <tr>
              <th>Affectations / Rôles</th>
              <th>Chantier</th>
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
                <td>
                  {readOnly ? (r.chantier || '—') : (
                    <input className="ddr-input-sm" value={r.chantier} onChange={e => updateRole(r.id, 'chantier', e.target.value)} />
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
                    {!r.locked && (
                      <button className="ddr-btn-remove" onClick={() => removeRole(r.id)} title="Supprimer">✕</button>
                    )}
                  </td>
                )}

              </tr>
            ))}
          </tbody>
        </table>

        {!readOnly && (
          <button className="ddr-btn-add" onClick={addRole}>+ Ajouter un rôle</button>
        )}
      </div>

      {/* ── OBSERVATIONS ────────────────────────────────────────── */}
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

      {/* ── MESURES DE SÉCURITÉ ─────────────────────────────────── */}
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

      {/* ── SIGNATURE ───────────────────────────────────────────── */}
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
