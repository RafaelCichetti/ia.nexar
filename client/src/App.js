import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

// Componentes
import Header from './components/Header';
import HeaderCliente from './components/HeaderCliente';
import Sidebar from './components/Sidebar';



import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import IAConfig from './pages/IAConfig';
import TestChat from './pages/TestChat';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import AdminRegister from './pages/AdminRegister';
import AdminList from './pages/AdminList';
import DashboardCliente from './pages/DashboardCliente';
import SidebarCliente from './pages/SidebarCliente';
import WhatsappCliente from './pages/WhatsappCliente';
import CalendarioCliente from './pages/CalendarioCliente';
import AgendaCliente from './pages/AgendaCliente';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';

import './App.css';


// Componente para proteger rotas privadas

function PrivateRoute({ children, onlyAdmin, onlyCliente }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (onlyAdmin && user.tipo !== 'admin') return <Navigate to="/cliente" replace />;
  if (onlyCliente && user.tipo !== 'cliente') return <Navigate to="/" replace />;
  return children;
}

// Componente para impedir acesso à tela de login se já estiver logado

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
  if (user.tipo === 'admin') return <Navigate to="/dashboard" replace />;
    if (user.tipo === 'cliente') return <Navigate to="/cliente" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}


function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const isLogin = location.pathname === '/login';
  const isLanding = location.pathname === '/landing';
  const isCliente = user && user.tipo === 'cliente';

  return (
    <div className={`app ${isLanding ? 'landing' : ''}`}>
      {!isLogin && !isLanding && !isCliente && <Header />}
      {isCliente && <HeaderCliente />}
      <div className="app-body">
        {!isLogin && !isLanding && !isCliente && <Sidebar />}
  {isCliente && <SidebarCliente />}
  <main className={`main-content ${isLanding ? 'landing' : ''}`}>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />

            {/* Rotas admin */}
            <Route path="/dashboard" element={
              <PrivateRoute onlyAdmin>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/clients" element={
              <PrivateRoute onlyAdmin>
                <ClientList />
              </PrivateRoute>
            } />
            <Route path="/client/:id" element={
              <PrivateRoute onlyAdmin>
                <ClientDetail />
              </PrivateRoute>
            } />
            <Route path="/client/:id/ia" element={
              <PrivateRoute onlyAdmin>
                <IAConfig />
              </PrivateRoute>
            } />
            <Route path="/client/:id/test" element={
              <PrivateRoute onlyAdmin>
                <TestChat />
              </PrivateRoute>
            } />
            <Route path="/admin/register" element={
              <PrivateRoute onlyAdmin>
                <AdminRegister />
              </PrivateRoute>
            } />
            <Route path="/admins" element={
              <PrivateRoute onlyAdmin>
                <AdminList />
              </PrivateRoute>
            } />
            <Route path="/alterar-senha" element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            } />

            {/* Rotas cliente */}
            <Route path="/cliente" element={
              <PrivateRoute onlyCliente>
                <DashboardCliente />
              </PrivateRoute>
            } />
            <Route path="/cliente/whatsapp" element={
              <PrivateRoute onlyCliente>
                <WhatsappCliente />
              </PrivateRoute>
            } />
            <Route path="/cliente/calendario" element={
              <PrivateRoute onlyCliente>
                <CalendarioCliente />
              </PrivateRoute>
            } />
            <Route path="/cliente/agenda" element={
              <PrivateRoute onlyCliente>
                <AgendaCliente />
              </PrivateRoute>
            } />
            {/** Rota de configuração do Google removida **/}
          </Routes>
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
