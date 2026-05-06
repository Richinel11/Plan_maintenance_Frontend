import React from 'react';

const DashboardHome = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Dynamic Breadcrumb placeholder just specifically for this view as per mockup */}
            {/* <div style={{ marginBottom: '20px', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
               Ac
            </div> */}

            <div style={{ 
                flex: 1, 
                // backgroundColor: '#ffffff', 
                // borderRadius: '8px', 
                // border: '1px solid #e2e8f0',
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#1B75BB', marginBottom: '20px' }}>
                    waving_hand
                </span>
                <h2 style={{ color: '#1a202c', fontWeight: '800', fontSize: '2rem', marginBottom: '10px' }}>
                    Bienvenue sur ENEOPLAN
                </h2>
                <p style={{ color: '#64748b', fontSize: '1rem', textAlign: 'center', maxWidth: '400px' }}>
                    Votre espace de travail est prêt. Le contenu spécifique à votre rôle s'affichera ici.
                </p>
            </div>
        </div>
    );
};

export default DashboardHome;
