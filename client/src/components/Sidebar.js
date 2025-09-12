import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaRobot, 
  FaUserShield
} from 'react-icons/fa';
import './Sidebar.css';

import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  if (user && user.tipo === 'cliente') return null;
  const menuItems = [
    {
      path: '/',
      icon: FaHome,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/clients',
      icon: FaUsers,
      label: 'Clientes'
    },
    {
      path: '/admins',
      icon: FaUserShield,
      label: 'Administradores'
    },
    {
      path: '/admin/register',
      icon: FaRobot,
      label: 'Novo Admin'
    }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            end={item.exact}
          >
            <item.icon className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
