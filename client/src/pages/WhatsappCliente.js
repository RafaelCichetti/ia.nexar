
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import WhatsAppConnect from '../components/WhatsAppConnect';

const WhatsappCliente = () => {
  const { user } = useAuth();
  if (!user?.client_id) {
    return <p>Usuário não autenticado.</p>;
  }
  return (
    <div className="whatsapp-cliente">
      <h2>Conexão WhatsApp</h2>
      <WhatsAppConnect clientId={user.client_id} clientName={user.nome || user.name || 'Cliente'} />
    </div>
  );
};

export default WhatsappCliente;
