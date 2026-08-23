import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { deciderDDR, ajouterPieceJointeDDR } from '../../../services/exploitationService';
import DDRValider from '../../../components/shared/DDRValider/DDRValider';

const CcrDDRRefusPage = () => {
  const { ddrId } = useParams();
  const navigate  = useNavigate();

  const handleSoumettre = async ({ files, motif }) => {
    // 1. La décision d'abord : si elle échoue, aucun document n'est envoyé.
    try {
      await deciderDDR(ddrId, { decision: 'REFUSE', motif });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors du refus de la DDR.');
      throw err;
    }

    // 2. Les documents justificatifs sont facultatifs : un échec d'upload
    //    ne remet pas en cause le refus, déjà enregistré.
    const echecs = [];
    for (const file of files) {
      try {
        await ajouterPieceJointeDDR(ddrId, file);
      } catch (err) {
        echecs.push(err?.response?.data?.error || file.name);
      }
    }

    if (echecs.length > 0) {
      toast.warning(
        `DDR refusée, mais ${echecs.length} document(s) n'ont pas pu être joints : ${echecs.join(' — ')}`
      );
    } else {
      toast.success('DDR refusée avec succès.');
    }
    navigate('/dashboard/traitement-ddr');
  };

  return (
    <DDRValider
      ddrId={ddrId}
      titre="Refus de DDR"
      submitLabel="CONFIRMER LE REFUS"
      showMotif={true}
      showDocuments={true}
      onRetour={() => navigate(-1)}
      onSoumettre={handleSoumettre}
    />
  );
};

export default CcrDDRRefusPage;
