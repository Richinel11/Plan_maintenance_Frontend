import React from 'react';
import { useNavigate } from 'react-router-dom';
import Historique from '../../Responsable/Historique/Historique';

const CcrHistorique = () => {
  const navigate = useNavigate();

  const handleRowClick = (item) => {
    if (item.type === 'DDR' && item.statut === 'COMPLETEE') {
      navigate(`/dashboard/ccr/ddr/${item.id}`);
    } else if (item.type === 'DDR') {
      navigate(`/dashboard/consultation/ddr/${item.id}`);
    } else if (item.type === 'NAPT' && item.statut === 'GENEREE') {
      navigate(`/dashboard/ccr/napt/${item.id}`);
    } else {
      navigate(`/dashboard/consultation/napt/${item.id}`);
    }
  };

  return <Historique ddrExcludeStatut="EN_ATTENTE" onRowClick={handleRowClick} />;
};

export default CcrHistorique;
