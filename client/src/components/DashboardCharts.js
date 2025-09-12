import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const MensagensPorDiaChart = ({ data }) => (
  <div style={{ width: '100%', height: 250 }}>
    <h3 style={{marginBottom: 8}}>Mensagens por Dia</h3>
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dia" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="mensagens" stroke="#10a37f" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const RespostasIAPorDiaChart = ({ data }) => (
  <div style={{ width: '100%', height: 250 }}>
    <h3 style={{marginBottom: 8}}>Respostas da IA por Dia</h3>
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dia" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="respostasIA" fill="#ffc107" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const DistribuicaoRespostasChart = ({ data }) => {
  const COLORS = ['#10a37f', '#ffc107', '#bfc9da'];
  return (
    <div style={{ width: '100%', height: 250 }}>
      <h3 style={{marginBottom: 8}}>Distribuição de Respostas</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="valor" nameKey="tipo" cx="50%" cy="50%" outerRadius={70} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
