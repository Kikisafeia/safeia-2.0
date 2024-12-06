import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardNavbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-safeia-black">
                SAFEIA
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/mi-cuenta"
                className="border-transparent text-gray-500 hover:border-safeia-yellow hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Mi Cuenta
              </Link>
              <Link
                to="/herramientas-sst"
                className="border-transparent text-gray-500 hover:border-safeia-yellow hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Herramientas SST con IA
              </Link>
              <Link
                to="/como-funciona"
                className="border-transparent text-gray-500 hover:border-safeia-yellow hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                ¿Cómo funciona?
              </Link>
              <Link
                to="/agentes-especializados"
                className="border-transparent text-gray-500 hover:border-safeia-yellow hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Agentes Especializados
              </Link>
              <Link
                to="/blog"
                className="border-transparent text-gray-500 hover:border-safeia-yellow hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Blog
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              className="bg-safeia-yellow hover:bg-safeia-yellow-dark text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
