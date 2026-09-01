import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DDRView from '../../../components/shared/DDRView/DDRView';
import DDRContextAside from '../../../components/shared/DDRContextAside/DDRContextAside';
import {
  getDDR, completerDDR,
  ajouterChantierDDR, modifierChantierDDR, supprimerChantierDDR,
  ajouterRoleDDR, modifierRoleDDR, supprimerRoleDDR,
} from '../../../services/exploitationService';
import '../Consultation/ConsultationPage.css';
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
  const [ddr, setDdr] = useState(null);

  const isReadOnly = location.state?.readOnly === true;

  // Chargé en plus de DDRView (qui gère son propre fetch) pour connaître
  // le statut : une DDR refusée affiche le motif du CCR au-dessus du document.
  useEffect(() => {
    if (!ddrId) return;
    getDDR(ddrId)
      .then(res => setDdr(res.data))
      .catch(() => {});
  }, [ddrId]);

  const estRefusee = ddr?.statut === 'REFUSE';

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
    <div className="cp-layout">

      {/* Le contexte (statut, motif du refus, pièces jointes, métadonnées,
          planning lié) vit dans l'aside sticky : il reste sous les yeux pendant
          que le responsable fait défiler un formulaire long pour le corriger. */}
      <DDRContextAside
        ddr={ddr}
        titre={estRefusee ? 'CORRECTION DDR' : 'DDR'}
        retourLabel="Retour"
        onRetour={handleRetour}
      />

      <main className="cp-main">

        {/* La consigne accompagne le formulaire ; l'information, elle, est dans
            l'aside — on ne répète pas le motif à deux endroits. */}
        {estRefusee && !isReadOnly && (
          <div className="ddr-consigne no-print">
            <span className="material-symbols-outlined">edit_note</span>
            Corrigez les informations ci-dessous, puis resoumettez la DDR au CCR.
          </div>
        )}

        <div className="cp-print-zone">
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
                  {saving
                    ? 'Enregistrement...'
                    : estRefusee ? 'Corriger et resoumettre' : 'Valider'}
                </button>
              </div>
            </>
          )}

        </div>

      </main>

    </div>
  );
};

export default DDRDetailPage;
