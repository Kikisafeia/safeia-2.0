import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#caracteristicas", label: "Características" },
    { href: "#precios", label: "Precios" },
    { href: "#contacto", label: "Contacto" }
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg">
              <img 
                src="/SAFEIA LOGO.jpg" 
                alt="SAFEIA" 
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-safeia-black hover:text-safeia-yellow transition focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg px-2 py-1"
                role="menuitem"
              >
                {link.label}
              </a>
            ))}
            <button 
              className="bg-safeia-black text-white px-4 py-2 rounded-lg hover:bg-safeia-yellow hover:text-safeia-black transition duration-300 focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
              aria-label="Iniciar prueba gratuita"
            >
              Prueba Gratuita
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-safeia-yellow hover:bg-safeia-yellow-dark"
            >
              Iniciar sesión
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Menú principal"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4" role="menu">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 px-4 text-safeia-black hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 py-4">
              <button 
                className="w-full bg-safeia-black text-white px-4 py-2 rounded-lg hover:bg-safeia-yellow hover:text-safeia-black transition duration-300 focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
                onClick={() => setIsMenuOpen(false)}
              >
                Prueba Gratuita
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-safeia-yellow hover:bg-safeia-yellow-dark"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}