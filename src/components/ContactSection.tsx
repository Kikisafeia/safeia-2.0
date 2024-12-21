import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactSection = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-safeia-black mb-4">
            Contáctanos
          </h2>
          <p className="text-lg text-safeia-gray max-w-2xl mx-auto">
            Estamos aquí para ayudarte a transformar la gestión de seguridad de tu empresa 
            con soluciones innovadoras impulsadas por IA.
          </p>
        </div>

        {/* Grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Contact Info */}
          <div className="bg-white rounded-3xl shadow-xl p-10 transform hover:scale-105 transition-transform duration-300">
            <div className="space-y-8">
              <div>
                <img 
                  src="/SAFEIA LOGO.jpg"
                  alt="SAFEIA Logo" 
                  className="h-20 w-auto"
                />
              </div>
              
              <div className="space-y-6">
                <p className="text-lg text-safeia-gray">
                  Descubre cómo nuestra plataforma puede revolucionar la seguridad 
                  en tu empresa. Contáctanos para una demostración personalizada.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 group">
                    <div className="bg-safeia-yellow/10 p-4 rounded-2xl group-hover:bg-safeia-yellow/20 transition-colors">
                      <Mail className="h-7 w-7 text-safeia-yellow" />
                    </div>
                    <div>
                      <p className="text-safeia-black font-medium mb-1">Email</p>
                      <a href="mailto:contacto@safeia.com" 
                         className="text-safeia-gray hover:text-safeia-yellow transition-colors">
                        contacto@safeia.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 group">
                    <div className="bg-safeia-yellow/10 p-4 rounded-2xl group-hover:bg-safeia-yellow/20 transition-colors">
                      <Phone className="h-7 w-7 text-safeia-yellow" />
                    </div>
                    <div>
                      <p className="text-safeia-black font-medium mb-1">Teléfono</p>
                      <a href="tel:+56912345678" 
                         className="text-safeia-gray hover:text-safeia-yellow transition-colors">
                        +56 9 1234 5678
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 group">
                    <div className="bg-safeia-yellow/10 p-4 rounded-2xl group-hover:bg-safeia-yellow/20 transition-colors">
                      <MapPin className="h-7 w-7 text-safeia-yellow" />
                    </div>
                    <div>
                      <p className="text-safeia-black font-medium mb-1">Ubicación</p>
                      <p className="text-safeia-gray">
                        Santiago, Chile
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <form className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-safeia-black mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="block w-full rounded-xl border-gray-300 shadow-sm 
                             focus:border-safeia-yellow focus:ring-safeia-yellow 
                             transition-colors py-3"
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-safeia-black mb-2">
                    Email Profesional
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="block w-full rounded-xl border-gray-300 shadow-sm 
                             focus:border-safeia-yellow focus:ring-safeia-yellow 
                             transition-colors py-3"
                    placeholder="tu@empresa.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-safeia-black mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="block w-full rounded-xl border-gray-300 shadow-sm 
                             focus:border-safeia-yellow focus:ring-safeia-yellow 
                             transition-colors py-3"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-safeia-black mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="block w-full rounded-xl border-gray-300 shadow-sm 
                             focus:border-safeia-yellow focus:ring-safeia-yellow 
                             transition-colors"
                    placeholder="¿Cómo podemos ayudarte?"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full bg-safeia-yellow text-white py-3 px-6 rounded-xl
                           hover:bg-safeia-yellow/90 transform hover:scale-105
                           transition-all duration-300 font-medium text-lg
                           shadow-lg hover:shadow-xl"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
