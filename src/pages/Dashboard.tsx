import React from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Agentes Especializados",
      description: "Accede a nuestros agentes de IA especializados en seguridad y salud ocupacional",
      action: () => navigate('/agentes-especializados'),
      color: "bg-safeia-yellow",
      textColor: "text-safeia-black"
    },
    // Aquí puedes agregar más elementos del menú
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-safeia-black mb-8">
            Dashboard SAFEIA
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden shadow-sm rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-300"
                onClick={item.action}
              >
                <div className="p-6">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                    <span className={`text-2xl ${item.textColor}`}>AI</span>
                  </div>
                  <h3 className="text-lg font-semibold text-safeia-black mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
