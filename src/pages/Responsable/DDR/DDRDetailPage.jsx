import React, { useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DDRView from '../../../components/shared/DDRView/DDRView';
import {
  completerDDR,
  ajouterChantierDDR, modifierChantierDDR, supprimerChantierDDR,
  ajouterRoleDDR, modifierRoleDDR, supprimerRoleDDR,
} from '../../../services/exploitationService';
import './DDRDetailPage.css';

const isNew = (id) => String(id).startsWith('new_');

const anneeValide = (isoStr) => {
  if (!isoStr) return true;
  const annee = parseInt(isoStr.substring(0, 4), 10);
  return annee >= 2000 && annee <= 2100;
};

const DDRDetailPage = () => {
  const navigate        = useNavigate();
  const { ddrId }       = useParams();
  const location        = useLocation();
  const ddrRef          = useRef();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const isReadOnly = location.state?.readOnly === true;

  const handleRetour   = () => navigate(-1);
  const handleImprimer = () => window.print();

  const handleValider = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const { fields, roles, chantiers, originalChantiers, originalRoles } = ddrRef.current.getFormData();

      // Validation des dates avant envoi
      if (fields.debutConsignationDate && !anneeValide(fields.debutConsignationDate)) {
        setSaveError('La date de début de consignation est invalide — vérifiez l\'année (ex : 2026).');
        setSaving(false); return;
      }
      if (fields.retourExploitationDate && !anneeValide(fields.retourExploitationDate)) {
        setSaveError('La date de retour à l\'exploitation est invalide — vérifiez l\'année (ex : 2026).');
        setSaving(false); return;
      }
      if (fields.dateReceptionDemande && !anneeValide(fields.dateReceptionDemande)) {
        setSaveError('La date de réception de la demande est invalide — vérifiez l\'année (ex : 2026).');
        setSaving(false); return;
      }

      // 1. Champs principaux
      const debutConsignation = fields.debutConsignationDate && fields.debutConsignationHeure
        ? `${fields.debutConsignationDate}T${fields.debutConsignationHeure}:00`
        : null;

      await completerDDR(ddrId, {
        numero_fiche_probleme:     fields.numFicheProbleme,
        date_reception_demande:    fields.dateReceptionDemande  || null,
        debut_consignation:        debutConsignation,
        retour_exploitation:       fields.retourExploitationDate || null,
        delai_restitution_urgence: fields.delaiRestitution,
        observations_generales:    fields.observations,
        point_separation:          fields.securite,
      });

      // 2. Sync chantiers
      const originalChantierIds = new Set(originalChantiers.map(c => c.id));
      const currentRealIds      = new Set(chantiers.filter(c => !isNew(c.id)).map(c => c.id));
      const originalChantierMap = Object.fromEntries(originalChantiers.map(c => [c.id, c]));

      // Supprimer les chantiers retirés
      await Promise.all(
        originalChantiers
          .filter(c => !currentRealIds.has(c.id))
          .map(c => supprimerChantierDDR(ddrId, c.id))
      );

      // Mettre à jour les chantiers modifiés
      await Promise.all(
        chantiers
          .filter(c => !isNew(c.id) && originalChantierIds.has(c.id) && c.consistance !== (originalChantierMap[c.id]?.consistance || ''))
          .map(c => modifierChantierDDR(ddrId, c.id, { consistance: c.consistance }))
      );

      // Créer les nouveaux chantiers — on garde le mapping tempId → realId pour les rôles
      const tempToRealChantier = {};
      await Promise.all(
        chantiers
          .filter(c => isNew(c.id))
          .map(async c => {
            const res = await ajouterChantierDDR(ddrId, { numero: c.numero, consistance: c.consistance });
            tempToRealChantier[c.id] = res.data.id;
          })
      );

      const resolveChantier = (id) => (id ? (tempToRealChantier[id] ?? id) : null);

      // 3. Sync rôles
      const originalRoleIds = new Set(originalRoles.map(r => r.id));
      const currentRealRoleIds = new Set(roles.filter(r => !isNew(r.id)).map(r => r.id));
      const originalRoleMap = Object.fromEntries(originalRoles.map(r => [r.id, r]));

      // Supprimer les rôles retirés
      await Promise.all(
        originalRoles
          .filter(r => !currentRealRoleIds.has(r.id))
          .map(r => supprimerRoleDDR(ddrId, r.id))
      );

      // Mettre à jour les rôles modifiés
      await Promise.all(
        roles
          .filter(r => !isNew(r.id) && originalRoleIds.has(r.id))
          .map(r => {
            const orig = originalRoleMap[r.id];
            const chantierResolu = resolveChantier(r.chantier);
            if (
              r.role      !== orig.role      ||
              r.personne  !== orig.personne  ||
              r.unite     !== orig.unite     ||
              r.telephone !== orig.telephone ||
              chantierResolu !== orig.chantier
            ) {
              return modifierRoleDDR(ddrId, r.id, {
                role:      r.role,
                personne:  r.personne,
                unite:     r.unite,
                telephone: r.telephone,
                chantier:  chantierResolu,
              });
            }
          })
      );

      // Créer les nouveaux rôles
      await Promise.all(
        roles
          .filter(r => isNew(r.id))
          .map(r => ajouterRoleDDR(ddrId, {
            role:      r.role,
            personne:  r.personne,
            unite:     r.unite,
            telephone: r.telephone,
            chantier:  resolveChantier(r.chantier),
          }))
      );

      navigate(`/dashboard/ddr/${ddrId}/valider`);
    } catch (err) {
      console.error('Erreur sauvegarde DDR :', err);
      setSaveError('Erreur lors de la sauvegarde. Vérifiez les champs et réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ddr-page">

      <div className="ddr-page-body">
        <DDRView ref={ddrRef} ddrId={ddrId} readOnly={isReadOnly} />
      </div>

      {saveError && (
        <div className="ddr-save-error no-print">{saveError}</div>
      )}

      <div className="ddr-footer no-print">

        {isReadOnly ? (
          <>
            <button className="ddr-btn-annuler" onClick={handleRetour}>
              ← Retour
            </button>
            <div className="ddr-footer-right">
              <button className="ddr-btn-annuler" onClick={handleImprimer}>
                🖨 Imprimer
              </button>
              <button className="ddr-btn-annuler" onClick={handleImprimer}>
                ⬇ Exporter
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="ddr-btn-annuler" onClick={handleRetour} disabled={saving}>
              Annuler
            </button>
            <div className="ddr-footer-right">
              <button className="ddr-btn-valider" onClick={handleValider} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Valider'}
              </button>
            </div>
          </>
        )}

      </div>

    </div>
  );
};

export default DDRDetailPage;
