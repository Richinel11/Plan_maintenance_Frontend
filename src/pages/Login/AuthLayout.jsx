import React from 'react';
import './Login.css';

const AuthLayout = ({ title, subtitle, children }) => {
    return (
        <div className="login-page">
            <div className="login-left">
                <div className="branding-container">
                    <img src="/logo.svg" alt='EneoPlan' />
                </div>
                <div className="bottom-line-accent"></div>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <h2 className="card-title">{title}</h2>
                    <p className="card-subtitle">{subtitle}</p>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
