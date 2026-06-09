import React from 'react';
import { useNavigate } from 'react-router-dom';
import Historique from '../../Responsable/Historique/Historique';

const TraitementDDR = () => {
  const navigate = useNavigate();

  const handleRowClick = (item) => {
    if (item.type === 'DDR' && item.statut === 'EN_ATTENTE') {
      navigate(`/dashboard/ccr/ddr/${item.id}`);
    } else if (item.type === 'DDR') {
      navigate(`/dashboard/consultation/ddr/${item.id}`);
    } else {
      navigate(`/dashboard/consultation/napt/${item.id}`);
    }
  };

  return <Historique ddrOnly onRowClick={handleRowClick} />;
};

export default TraitementDDR;
