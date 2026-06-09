import React from 'react';
import { useNavigate } from 'react-router-dom';
import Historique from '../../Responsable/Historique/Historique';

const CommNAPTPage = () => {
  const navigate = useNavigate();

  const handleRowClick = (item) => {
    navigate(`/dashboard/consultation/napt/${item.id}`);
  };

  return (
    <Historique
      naptOnly
      naptStatut="DIFFUSEE"
      onRowClick={handleRowClick}
    />
  );
};

export default CommNAPTPage;
