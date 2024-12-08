import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-8">
            <img
              className="h-10"
              src="/SAFEIA LOGO.jpg"
              alt="SAFEIA"
            />
            <p className="text-gray-500 text-sm">
              Innovación y seguridad trabajando juntos para un futuro más seguro.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Soluciones
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/tools" className="text-base text-gray-500 hover:text-gray-900">
                  Herramientas SST
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacidad" className="text-base text-gray-500 hover:text-gray-900">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-base text-gray-500 hover:text-gray-900">
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} SAFEIA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
