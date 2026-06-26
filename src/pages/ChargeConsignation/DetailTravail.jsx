import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getTravailById } from '../../services/planningService';
import { getNAPTList } from '../../services/exploitationService';
import RecapPlanning from '../op_saisie/Creer_Travail/Recap/recap';

const getRefItem = (travail, typeNom) => {
  const items = travail.reference?.items;
  if (!Array.isArray(items)) return '';
  const item = items.find(i => i.type?.nom === typeNom);
  return item?.valeur || '';
};

const mapTravailToFormData = (travail) => ({
  Reference:                    travail.reference?.valeur || '',
  Segments:                     getRefItem(travail, 'Segment') || travail.segment || '',
  Ouvrages:                     getRefItem(travail, 'Ouvrage') || '',
  Poste:                        getRefItem(travail, 'Poste') || '',
  Departs:                      getRefItem(travail, 'Départ') || '',
  Unite_demanderesse:           travail.unite_demanderesse?.nom || '',
  Type_de_travaux:              travail.type_travaux?.libelle || '',
  Types_de_reseau:              travail.type_reseau || '',
  Consistances_Des_Travaux:     travail.consistance_travaux || '',
  Charges_de_consignation_label: travail.charge_consignation
    ? `${travail.charge_consignation.first_name || ''} ${travail.charge_consignation.last_name || ''}`.trim()
    : '',
  Debut_planifiee:              travail.heure_debut_planifie
    ? new Date(travail.heure_debut_planifie).toLocaleDateString('fr-FR') : '',
  Duree:                        travail.duree != null ? String(travail.duree) : '',
  Fin_planifiee:                travail.heure_fin_planifie
    ? new Date(travail.heure_fin_planifie).toLocaleDateString('fr-FR') : '',
  Date_programmee:              travail.date_programmee || '',
  Jour_avant_travaux:           travail.nombre_jours_avant_travaux != null
    ? String(travail.nombre_jours_avant_travaux) : '',
  Prevision_puissance_sollicite: travail.prevision_puissance_sollicitee != null
    ? String(travail.prevision_puissance_sollicitee) : '',
  Prevision_puissance_interrompue: travail.prevision_puissance_interrompue != null
    ? String(travail.prevision_puissance_interrompue) : '',
  Prevision_ENF:                travail.prevision_enf_mwh != null ? String(travail.prevision_enf_mwh) : '',
  Disponibilite_mecanique:      travail.disponibilite_mecanique_mw != null
    ? String(travail.disponibilite_mecanique_mw) : '',
  Troncons:                     travail.troncons_consignes || '',
  Localites_impactees:          travail.localites_impactees || '',
  Moyens_mis_en_oeuvre:         travail.moyens_mis_en_oeuvre || '',
  Centrale_thermique:           travail.centrale_thermique_sollicitee?.valeur || '',
  Qte_de_fuel:                  travail.qte_fuel_sollicitee != null ? String(travail.qte_fuel_sollicitee) : '',
  Observations:                 travail.observations || '',
});

const getFieldsBySegment = (segment) => {
  switch ((segment || '').toLowerCase()) {
    case 'transport': return [
      'Reference', 'Segments', 'Ouvrages', 'Poste', 'Type_de_travaux',
      'Unite_demanderesse', 'Consistances_Des_Travaux', 'Charges_de_consignation',
      'Debut_planifiee', 'Duree', 'Fin_planifiee', 'Date_programmee',
      'Jour_avant_travaux', 'Prevision_puissance_sollicite',
      'Prevision_puissance_interrompue', 'Prevision_ENF',
      'Centrale_thermique', 'Qte_de_fuel', 'Observations',
    ];
    case 'production': return [
      'Reference', 'Segments', 'Ouvrages', 'Poste', 'Type_de_travaux',
      'Unite_demanderesse', 'Consistances_Des_Travaux', 'Disponibilite_mecanique',
      'Debut_planifiee', 'Duree', 'Fin_planifiee', 'Date_programmee',
      'Jour_avant_travaux', 'Observations',
    ];
    case 'distribution': return [
      'Reference', 'Segments', 'Ouvrages', 'Poste', 'Departs',
      'Unite_demanderesse', 'Type_de_travaux', 'Types_de_reseau',
      'Troncons', 'Consistances_Des_Travaux', 'Localites_impactees',
      'Moyens_mis_en_oeuvre', 'Charges_de_consignation',
      'Debut_planifiee', 'Duree', 'Fin_planifiee', 'Date_programmee',
      'Jour_avant_travaux', 'Observations',
    ];
    default: return [];
  }
};

export default function DetailTravail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [travail, setTravail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [naptLoading, setNaptLoading] = useState(false);

  useEffect(() => {
    getTravailById(id)
      .then(res => setTravail(res.data))
      .catch(() => toast.error('Impossible de charger le travail.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVoirNapt = async () => {
    setNaptLoading(true);
    try {
      const res = await getNAPTList();
      const napts = res.data?.results || res.data || [];
      const napt = napts.find(n => n.travail?.id === id || n.travail === id);
      if (napt) {
        navigate(`/dashboard/consultation/napt/${napt.id}`);
      } else {
        toast.info('Aucune NAPT disponible pour ce travail.');
      }
    } catch {
      toast.error('Erreur lors de la recherche de la NAPT.');
    } finally {
      setNaptLoading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Chargement...</div>
  );
  if (!travail) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Travail introuvable.</div>
  );

  const formData = mapTravailToFormData(travail);
  const fields   = getFieldsBySegment(travail.segment);
  const hasNapt  = !!travail.demande_retrait;

  return (
    <div style={{ padding: '24px 40px' }}>

      {/* Barre de navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={() => navigate('/dashboard/charge-consig/travaux')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            color: '#64748B', fontSize: 14, fontWeight: 500,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Retour à mes travaux
        </button>

        {hasNapt && (
          <button
            onClick={handleVoirNapt}
            disabled={naptLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#1B75BB', color: 'white',
              border: 'none', borderRadius: 8,
              padding: '10px 20px', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              opacity: naptLoading ? 0.7 : 1,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>description</span>
            {naptLoading ? 'Chargement...' : 'Voir la NAPT'}
          </button>
        )}
      </div>

      {/* Récap du travail */}
      <RecapPlanning formData={formData} fields={fields} />
    </div>
  );
}
