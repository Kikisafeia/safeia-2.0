import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-8 col-span-2">
            <img
              className="h-16 w-auto"
              src="/SAFEIA LOGO.jpg"
              alt="SAFEIA"
            />
            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              Transformando la seguridad laboral a través de la inteligencia artificial. 
              Innovación y excelencia para un futuro más seguro.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-safeia-yellow" />
                <a href="mailto:contacto@safeia.online" className="text-gray-600 hover:text-safeia-yellow transition-colors">
                  contacto@safeia.online
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-safeia-yellow" />
                <a href="tel:+56912345678" className="text-gray-600 hover:text-safeia-yellow transition-colors">
                  +56 9 1234 5678
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-safeia-yellow" />
                <span className="text-gray-600">Santiago, Chile</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Soluciones
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/herramientas-sst" className="text-gray-600 hover:text-safeia-yellow transition-colors">
                  Herramientas SST
                </Link>
              </li>
              <li>
                <Link to="/matriz-riesgo" className="text-gray-600 hover:text-safeia-yellow transition-colors">
                  Matriz de Riesgo
                </Link>
              </li>
              <li>
                <Link to="/inspecciones" className="text-gray-600 hover:text-safeia-yellow transition-colors">
                  Inspecciones
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacidad" className="text-gray-600 hover:text-safeia-yellow transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-gray-600 hover:text-safeia-yellow transition-colors">
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col items-center justify-center space-y-4">
            <img
              src="/SAFEIA LOGO.jpg"
              alt="SAFEIA Footer"
              className="h-12 w-auto object-contain"
            />
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} SAFEIA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
