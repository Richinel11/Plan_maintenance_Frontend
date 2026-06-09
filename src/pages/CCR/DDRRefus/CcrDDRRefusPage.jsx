import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { deciderDDR } from '../../../services/exploitationService';
import DDRValider from '../../../components/shared/DDRValider/DDRValider';

const CcrDDRRefusPage = () => {
  const { ddrId } = useParams();
  const navigate  = useNavigate();

  const handleSoumettre = async ({ files, motif }) => {
    try {
      await deciderDDR(ddrId, { decision: 'REFUSE', motif });
      toast.success('DDR refusée avec succès.');
      navigate('/dashboard/traitement-ddr');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors du refus de la DDR.');
      throw err;
    }
  };

  return (
    <DDRValider
      ddrId={ddrId}
      titre="Refus de DDR"
      submitLabel="CONFIRMER LE REFUS"
      showMotif={true}
      onRetour={() => navigate(-1)}
      onSoumettre={handleSoumettre}
    />
  );
};

export default CcrDDRRefusPage;
