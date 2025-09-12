import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaWhatsapp, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';


const Header = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  if (user && user.tipo === 'cliente') return null;

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img 
            src="/nexar-logo.png" 
            alt="Nexar.ia Logo" 
            className="logo-image"
          />
          <span className="logo-text">Nexar.ia</span>
          <FaWhatsapp className="whatsapp-icon" />
        </div>
        <div className="header-actions">
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FaUser className="user-icon" />
              <span className="user-name">{user?.nome || 'Usuário'}</span>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/alterar-senha');
                  }}
                >
                  <FaCog className="dropdown-icon" />
                  Alterar Senha
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={() => { logout(); setTimeout(() => navigate('/login'), 100); }}>
                  <FaSignOutAlt className="dropdown-icon" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
