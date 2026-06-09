import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import DDRValider from '../../../components/shared/DDRValider/DDRValider';

const DDRValiderPage = () => {
  const { ddrId } = useParams();
  const navigate  = useNavigate();

  const handleSoumettre = async ({ files }) => {
    // TODO : appeler l'endpoint d'upload de documents quand il sera disponible
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
