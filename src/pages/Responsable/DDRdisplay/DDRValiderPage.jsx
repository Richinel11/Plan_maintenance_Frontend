import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import DDRValider from '../../../components/shared/DDRValider/DDRValider';

const DDRValiderPage = () => {
  const { ddrId } = useParams();
  const navigate  = useNavigate();

  // La DDR a déjà été enregistrée et passée à COMPLETEE par DDRDetailPage :
  // cet écran est une confirmation, sans import de documents.
  const handleSoumettre = async () => {
    toast.success('DDR soumise avec succès.');
    navigate('/dashboard/Notifications');
  };

  return (
    <DDRValider
      ddrId={ddrId}
      onRetour={() => navigate(-1)}
      onSoumettre={handleSoumettre}
    />
  );
};

export default DDRValiderPage;
