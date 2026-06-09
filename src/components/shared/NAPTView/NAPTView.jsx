import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { toast } from 'sonner';
import { getNAPT } from '../../../services/exploitationService';
import '../DDRView/DDRView.css';
import './NAPTView.css';

/* ── Infos société par segment ───────────────────────────────── */
const getCompany = (segment) => {
  if (segment === 'TRANSPORT') return {
    logo:      '/logosonarel.png',
    alt:       'SONATREL',
    direction: "DIRECTION DE L'EXPLOITATION DES SYSTÈMES ÉLECTRIQUES\nSOUS-DIRECTION CONDUITE EN TEMPS RÉEL",
    signature: 'Le Sous Directeur Conduite en Temps Réel',
  };
  return {
    logo:      '/eneo.png',
    alt:       'ENEO',
    direction: 'DIRECTION RÉGIONALE / CENTRE CONDUITE RÉSEAU HTA',
    signature: 'Responsable du CCR',
  };
};

/* ── Rôles par défaut ────────────────────────────────────────── */
const ROLES_DIST = [
  'Chargé de conduite',
  'Chargé de manœuvres',
  'Chargé de consignation',
  'Chargé de travaux',
  'Contrôleur des travaux',
];

const ROLES_TRANSPORT = [
  'Chargé de conduite',
  'Chargé de manœuvres',
  'Chargé de consignation',
  'Chargé des travaux',
  'Surveillant de sécurité',
  'Supervision travaux',
  'Coordination',
];

const makeRole = (role, extra = {}) => ({
  id: `${Date.now()}-${Math.random()}`,
  role, personne: '', unite: '', entreprise: '', telephone: '',
  ...extra,
});

const makeChantier = (num, ccNom = '') => ({
  id: `${Date.now()}-${Math.random()}`,
  label: `Chantier ${num}`,
  consistance: '',
  roles: ROLES_TRANSPORT.map(r =>
    makeRole(r, { personne: r === 'Chargé de consignation' ? ccNom : '' })
  ),
});

const SECURITE_DEFAULT =
`Aux points de séparation :
1. Séparation des ouvrages de toute source de tension.
2. Condamnation des appareils de sectionnement en position ouverte.

Sur le lieu de travail :
3. Identification des ouvrages retirés de l'exploitation.
4. Vérification d'absence de tension suivie de la pose des DMT & CC sur les trois phases des ouvrages objets des travaux.

* À la diligence du Chargé de consignation :
- Effectuer les manœuvres de consignation
- Vérifier la perche à néon après chaque test d'absence de tension
- Vérifier l'absence de tension en amont et en aval de l'installation consignée et dans la zone de travail
- Poser les DMT et en CC au Chantier

* À la diligence du Chargé de Travaux :
- Baliser la zone de travail
- Veiller au port des EPI par tous les agents au chantier
- Veiller au respect des normes de sécurité
- Vérifier l'absence de tension avant le début des travaux

* Les chargés de travaux prendront toutes autres dispositions nécessaires, pour assurer la sécurité de leur personnel pendant les travaux et veiller au non-accès dans la zone de travail par des personnes non autorisées.`;

/* ── Helpers ─────────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const fmtTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/* ════════════════════════════════════════════════════════════════
   NAPTView
   ════════════════════════════════════════════════════════════════ */
const NAPTView = forwardRef(({ naptId, readOnly = false }, ref) => {
  const [napt,    setNapt]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  /* ── champs éditables (local state — utilisés pour impression/export) */
  const [fields, setFields] = useState({
    dateReceptionDemande:    '',
    nomDemandeur:            '',
    debutConsignationDate:   '',
    debutConsignationHeure:  '',
    retourExploitationDate:  '',
    retourExploitationHeure: '',
    delaiRestitution:        '',
    observations:            '',
    securite:                SECURITE_DEFAULT,
    nomSignataire:           '',
    /* Transport */
    previsionConsignation:    '',
    previsionRealisation:     '',
    previsionDeconsignation:  '',
    /* Distribution */
    zonesImpactees:           '',
    previsionEnfMwh:          '',
    previsionEnfPct:          '',
  });

  /* ── rôles : flat (Dist/Prod) ou par chantier (Transport) */
  const [rolesFlat, setRolesFlat] = useState([]);
  const [chantiers, setChantiers] = useState([]);

  useEffect(() => {
    if (!naptId) return;
    getNAPT(naptId)
      .then(res => {
        const data = res.data;
        setNapt(data);
        const seg   = data.travail?.segment;
        const ccNom = data.charge_consignation_nom || '';

        if (seg === 'TRANSPORT') {
          setChantiers([makeChantier(1, ccNom)]);
        } else {
          setRolesFlat(ROLES_DIST.map(r =>
            makeRole(r, { personne: r === 'Chargé de consignation' ? ccNom : '' })
          ));
        }
        setFields(prev => ({ ...prev, nomDemandeur: data.genere_par_nom || '' }));
      })
      .catch(() => { toast.error('Impossible de charger la NAPT.'); setError(true); })
      .finally(() => setLoading(false));
  }, [naptId]);

  useImperativeHandle(ref, () => ({ getFormData: () => ({ ...fields, rolesFlat, chantiers }) }));

  const setField = (k, v) => setFields(prev => ({ ...prev, [k]: v }));

  if (loading) return <div className="ddr-state">Chargement de la NAPT...</div>;
  if (error)   return <div className="ddr-state ddr-state-error">Impossible de charger la NAPT.</div>;
  if (!napt)   return null;

  const t           = napt.travail;
  const segment     = t?.segment;
  const isTransport = segment === 'TRANSPORT';
  const isProduction = segment === 'PRODUCTION';
  const company     = getCompany(segment);
  const ddrRef      = napt.reference ? napt.reference.replace('NAPT-', 'DDR-') : '—';
  const nomOuvrage  = t?.reference?.items?.find(it => it.type?.nom?.toLowerCase() === 'ouvrage')?.valeur || '—';

  /* helper input éditable */
  const EditField = ({ fieldKey, type = 'text', placeholder = '', className = '' }) =>
    readOnly
      ? <span className="ddr-ro">{fields[fieldKey] || '—'}</span>
      : <input className={`ddr-input ${className}`} type={type}
          value={fields[fieldKey]} onChange={e => setField(fieldKey, e.target.value)}
          placeholder={placeholder} />;

  /* ── Rôles flat (Distribution / Production) ── */
  const addRoleFlat    = ()           => setRolesFlat(p => [...p, makeRole('Chargé de conduite')]);
  const removeRoleFlat = (id)         => setRolesFlat(p => p.filter(r => r.id !== id));
  const updateRoleFlat = (id, k, v)   => setRolesFlat(p => p.map(r => r.id === id ? { ...r, [k]: v } : r));

  /* ── Chantiers (Transport) ── */
  const addChantier          = ()              => setChantiers(p => [...p, makeChantier(p.length + 1)]);
  const removeChantier       = (cid)           => setChantiers(p => p.filter(c => c.id !== cid));
  const updateChantierLabel  = (cid, v)        => setChantiers(p => p.map(c => c.id === cid ? { ...c, label: v } : c));
  const updateChantierConsis = (cid, v)        => setChantiers(p => p.map(c => c.id === cid ? { ...c, consistance: v } : c));
  const addRoleChantier      = (cid)           => setChantiers(p => p.map(c => c.id === cid ? { ...c, roles: [...c.roles, makeRole('Chargé de conduite')] } : c));
  const removeRoleChantier   = (cid, rid)      => setChantiers(p => p.map(c => c.id === cid ? { ...c, roles: c.roles.filter(r => r.id !== rid) } : c));
  const updateRoleChantier   = (cid, rid, k, v) => setChantiers(p => p.map(c => c.id === cid ? { ...c, roles: c.roles.map(r => r.id === rid ? { ...r, [k]: v } : r) } : c));

  const totalEnf = [fields.previsionConsignation, fields.previsionRealisation, fields.previsionDeconsignation]
    .map(v => parseFloat(v) || 0).reduce((a, b) => a + b, 0);

  return (
    <div className={`ddr-doc${readOnly ? ' ddr-doc--readonly' : ''}`}>

      {/* ════════ EN-TÊTE ════════ */}
      <div className="ddr-header">
        <div className="ddr-header-brand">
          <img src={company.logo} alt={company.alt} className="ddr-logo-img" />
          <div className="ddr-header-org" style={{ whiteSpace: 'pre-line' }}>{company.direction}</div>
        </div>
        <table className="ddr-meta">
          <tbody>
            <tr>
              <td>N° Note d'Arrêt</td>
              <td><strong>{napt.reference || `NAPT-${String(napt.id).substring(0, 8).toUpperCase()}`}</strong></td>
            </tr>
            <tr>
              <td>Date d'émission</td>
              <td>{fmtDate(napt.date_diffusion || t?.heure_debut_planifie)}</td>
            </tr>
            <tr>
              <td>N° DDR lié</td>
              <td><strong>{ddrRef}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ════════ TITRE ════════ */}
      <div className="ddr-title-bar">
        <h2 className="ddr-title">NOTE D'ARRÊT POUR TRAVAUX</h2>
      </div>

      {/* ════════ IDENTIFICATION ════════ */}
      <div className="ddr-section">
        <div className="ddr-2col-grid">
          <div className="ddr-field-group">
            <span className="ddr-label">Unité demanderesse :</span>
            <span className="ddr-ro ddr-value-strong">{t?.unite_demanderesse?.nom || '—'}</span>
          </div>
          <div className="ddr-field-group">
            <span className="ddr-label">Date réception demande :</span>
            <EditField fieldKey="dateReceptionDemande" type="date" />
          </div>
          <div className="ddr-field-group">
            <span className="ddr-label">Nom du demandeur :</span>
            <EditField fieldKey="nomDemandeur" placeholder="Nom complet" />
          </div>
        </div>
      </div>

      {/* ════════ INSTALLATION ════════ */}
      <div className="ddr-section">
        <div className="ddr-section-label">Installations / Ouvrages à retirer de la conduite du réseau :</div>
        <div className="ddr-installation">
          {nomOuvrage}
        </div>
      </div>

      {/* ════════ CONSISTANCE (Distribution / Production seulement — Transport : par chantier) ════════ */}
      {!isTransport && (
        <div className="ddr-section">
          <div className="ddr-section-label">Consistance des travaux :</div>
          <div className="ddr-consistance">{t?.consistance_travaux || '—'}</div>
        </div>
      )}

      {/* ════════ PLANNING ════════ */}
      <div className="ddr-section">
        <div className="ddr-planning-2col">

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

          <div className="ddr-pfield ddr-pfield-full">
            <span className="ddr-plabel">Délai de restitution d'urgence :</span>
            <div className="ddr-pvalue">
              <EditField fieldKey="delaiRestitution" placeholder="Ex : 01H00" />
            </div>
          </div>

        </div>
      </div>

      {/* ════════ RÔLES — Distribution / Production ════════ */}
      {!isTransport && (
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
              {rolesFlat.map(r => (
                <tr key={r.id}>
                  <td className="ddr-td-role">
                    {readOnly ? r.role : <input className="ddr-input-sm" value={r.role} onChange={e => updateRoleFlat(r.id, 'role', e.target.value)} />}
                  </td>
                  <td>{readOnly ? (r.chantier || '—') : <input className="ddr-input-sm" value={r.chantier || ''} onChange={e => updateRoleFlat(r.id, 'chantier', e.target.value)} placeholder="Chantier 1" />}</td>
                  <td>{readOnly ? (r.personne || '—') : <input className="ddr-input-sm" value={r.personne} onChange={e => updateRoleFlat(r.id, 'personne', e.target.value)} />}</td>
                  <td>{readOnly ? (r.unite || '—') : <input className="ddr-input-sm" value={r.unite} onChange={e => updateRoleFlat(r.id, 'unite', e.target.value)} />}</td>
                  <td>{readOnly ? (r.telephone || '—') : <input className="ddr-input-sm" value={r.telephone} onChange={e => updateRoleFlat(r.id, 'telephone', e.target.value)} />}</td>
                  {!readOnly && (
                    <td className="ddr-td-action">
                      <button className="ddr-btn-remove" onClick={() => removeRoleFlat(r.id)}>✕</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && <button className="ddr-btn-add" onClick={addRoleFlat}>+ Ajouter un rôle</button>}

          <div className="napt-zones-row">
            <span className="ddr-label">Zones impactées / dans le noir :</span>
            {readOnly
              ? <span className="ddr-ro">{fields.zonesImpactees || '—'}</span>
              : <input className="ddr-input napt-zones-input" value={fields.zonesImpactees}
                  onChange={e => setField('zonesImpactees', e.target.value)}
                  placeholder="Ex : NKOMBASSI ET ENVIRONS" />
            }
          </div>

          <div className="napt-enf-global">
            <span className="ddr-label">Prévision ENF :</span>
            {readOnly
              ? <><span className="ddr-ro">{fields.previsionEnfMwh || '—'}</span><span className="ddr-label">MWh</span>
                  <span className="ddr-ro">{fields.previsionEnfPct || '—'}</span><span className="ddr-label">%</span></>
              : <><input className="ddr-input napt-input-narrow" value={fields.previsionEnfMwh}
                    onChange={e => setField('previsionEnfMwh', e.target.value)} placeholder="0" />
                  <span className="ddr-label">MWh</span>
                  <input className="ddr-input napt-input-narrow" value={fields.previsionEnfPct}
                    onChange={e => setField('previsionEnfPct', e.target.value)} placeholder="0" />
                  <span className="ddr-label">%</span></>
            }
          </div>
        </div>
      )}

      {/* ════════ CHANTIERS + RÔLES — Transport ════════ */}
      {isTransport && (
        <div className="ddr-section">
          {chantiers.map((c) => (
            <div key={c.id} className="napt-chantier-block">

              <div className="napt-chantier-header">
                {readOnly
                  ? <span className="napt-chantier-label">{c.label}</span>
                  : <input className="ddr-input napt-chantier-input" value={c.label}
                      onChange={e => updateChantierLabel(c.id, e.target.value)} />
                }
                {!readOnly && chantiers.length > 1 && (
                  <button className="ddr-btn-remove" onClick={() => removeChantier(c.id)}>✕ Supprimer</button>
                )}
              </div>

              <div className="napt-chantier-consistance">
                <span className="ddr-section-label">Consistance :</span>
                {readOnly
                  ? <div className="ddr-consistance">{c.consistance || '—'}</div>
                  : <textarea className="ddr-textarea" rows={2} value={c.consistance}
                      onChange={e => updateChantierConsis(c.id, e.target.value)}
                      placeholder="Décrire les travaux de ce chantier..." />
                }
              </div>

              <table className="ddr-roles-table">
                <thead>
                  <tr>
                    <th>Affectations / Rôles</th>
                    <th>Personne désignée</th>
                    <th>Unité</th>
                    <th>Entreprise</th>
                    <th>Téléphone</th>
                    {!readOnly && <th className="ddr-th-action" />}
                  </tr>
                </thead>
                <tbody>
                  {c.roles.map(r => (
                    <tr key={r.id}>
                      <td className="ddr-td-role">
                        {readOnly ? r.role : <input className="ddr-input-sm" value={r.role} onChange={e => updateRoleChantier(c.id, r.id, 'role', e.target.value)} />}
                      </td>
                      <td>{readOnly ? (r.personne || '—') : <input className="ddr-input-sm" value={r.personne} onChange={e => updateRoleChantier(c.id, r.id, 'personne', e.target.value)} />}</td>
                      <td>{readOnly ? (r.unite || '—') : <input className="ddr-input-sm" value={r.unite} onChange={e => updateRoleChantier(c.id, r.id, 'unite', e.target.value)} />}</td>
                      <td>{readOnly ? (r.entreprise || '—') : <input className="ddr-input-sm" value={r.entreprise} onChange={e => updateRoleChantier(c.id, r.id, 'entreprise', e.target.value)} />}</td>
                      <td>{readOnly ? (r.telephone || '—') : <input className="ddr-input-sm" value={r.telephone} onChange={e => updateRoleChantier(c.id, r.id, 'telephone', e.target.value)} />}</td>
                      {!readOnly && (
                        <td className="ddr-td-action">
                          <button className="ddr-btn-remove" onClick={() => removeRoleChantier(c.id, r.id)}>✕</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!readOnly && <button className="ddr-btn-add" onClick={() => addRoleChantier(c.id)}>+ Ajouter un rôle</button>}

            </div>
          ))}

          {!readOnly && (
            <button className="ddr-btn-add napt-btn-add-chantier" onClick={addChantier}>
              + Ajouter un chantier
            </button>
          )}

          {/* ── Prévisions ENF ── */}
          <div className="napt-previsions">
            <div className="ddr-section-label">Prévisions ENF</div>
            <table className="ddr-roles-table napt-prev-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Production Thermique (MWh)</th>
                  <th>ENF (MWh)</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Consignation',       'previsionConsignation'],
                  ['Réalisation travaux', 'previsionRealisation'],
                  ['Déconsignation',     'previsionDeconsignation'],
                ].map(([label, key]) => (
                  <tr key={key}>
                    <td>{label}</td>
                    <td className="napt-td-center">—</td>
                    <td>
                      {readOnly
                        ? <span className="ddr-ro">{fields[key] || '—'}</span>
                        : <input className="ddr-input-sm napt-input-narrow" value={fields[key]}
                            onChange={e => setField(key, e.target.value)} placeholder="0" />
                      }
                    </td>
                    <td className="napt-td-center">—</td>
                  </tr>
                ))}
                <tr className="napt-prev-total">
                  <td><strong>TOTAL</strong></td>
                  <td className="napt-td-center">—</td>
                  <td><strong>{totalEnf > 0 ? totalEnf : '—'}</strong></td>
                  <td className="napt-td-center">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════ INDICATEURS PRODUCTION ════════ */}
      {isProduction && (
        <div className="ddr-section">
          <div className="ddr-section-label">Indicateurs de Production</div>
          <div className="ddr-2col-grid">
            <div className="ddr-field-group">
              <span className="ddr-label">Disponibilité mécanique :</span>
              <span className="ddr-ro">{t?.disponibilite_mecanique_mw != null ? `${t.disponibilite_mecanique_mw} MW` : '—'}</span>
            </div>
            <div className="ddr-field-group">
              <span className="ddr-label">Puissance interrompue :</span>
              <span className="ddr-ro">{t?.prevision_puissance_interrompue != null ? `${t.prevision_puissance_interrompue} MW` : '—'}</span>
            </div>
            <div className="ddr-field-group">
              <span className="ddr-label">ENF prévu :</span>
              <span className="ddr-ro">{t?.prevision_enf_mwh != null ? `${t.prevision_enf_mwh} MWh` : '—'}</span>
            </div>
            {t?.centrale_thermique_sollicitee && (
              <div className="ddr-field-group">
                <span className="ddr-label">Centrale thermique sollicitée :</span>
                <span className="ddr-ro">{t.centrale_thermique_sollicitee?.nom || '—'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ OBSERVATIONS ════════ */}
      <div className="ddr-section">
        <div className="ddr-section-label">Observations générales :</div>
        {readOnly
          ? <div className="ddr-obs-content">{fields.observations || '—'}</div>
          : <textarea className="ddr-textarea" rows={4} value={fields.observations}
              onChange={e => setField('observations', e.target.value)}
              placeholder="Observations, impacts réseau, consignes particulières..." />
        }
      </div>

      {/* ════════ MESURES DE SÉCURITÉ ════════ */}
      <div className="ddr-section ddr-securite">
        <div className="ddr-securite-title">Indications sur les Manœuvres et Consignations à Effectuer</div>
        {readOnly
          ? <div className="ddr-securite-content">{fields.securite}</div>
          : <textarea className="ddr-textarea ddr-securite-textarea" rows={20}
              value={fields.securite} onChange={e => setField('securite', e.target.value)} />
        }
      </div>

      {/* ════════ SIGNATURE ════════ */}
      <div className="ddr-signature-bar napt-signature-bar">
        <div className="ddr-signature-block">
          <div className="ddr-signature-title">{company.signature}</div>
          {!readOnly && (
            <input className="ddr-input napt-signataire-input" value={fields.nomSignataire}
              onChange={e => setField('nomSignataire', e.target.value)}
              placeholder="Nom et prénom du signataire" />
          )}
          {readOnly && (
            <div className="napt-signataire-name">{fields.nomSignataire || '—'}</div>
          )}
          <div className="ddr-signature-line" />
        </div>
      </div>

    </div>
  );
});

NAPTView.displayName = 'NAPTView';
export default NAPTView;
