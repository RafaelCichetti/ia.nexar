import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaWhatsapp, FaCalendarAlt } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import './SidebarCliente.css';

const SidebarCliente = () => {
  const location = useLocation();
  return (
    <aside className="sidebar-cliente">
      <nav>
        <ul>
          <li className={location.pathname === '/cliente' ? 'active' : ''}>
            <Link to="/cliente"><FaHome /> Dashboard</Link>
          </li>
          <li className={location.pathname === '/cliente/whatsapp' ? 'active' : ''}>
            <Link to="/cliente/whatsapp"><FaWhatsapp /> WhatsApp</Link>
          </li>
          <li className={location.pathname === '/cliente/calendario' ? 'active' : ''}>
            <Link to="/cliente/calendario"><FaCalendarAlt /> Calendário</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarCliente;
