import React, { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, userSubscription } = useAuth();

  const navLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#caracteristicas", label: "Características" },
    { href: "#precios", label: "Precios" },
    { href: "#contacto", label: "Contacto" }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isHomePage = location.pathname === '/';

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
            {isHomePage && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-safeia-black hover:text-safeia-yellow transition focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg px-2 py-1"
                role="menuitem"
              >
                {link.label}
              </a>
            ))}
            
            {!currentUser ? (
              <>
                <Link 
                  to="/login"
                  className="text-safeia-black hover:text-safeia-yellow transition focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg px-2 py-1"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/login"
                  className="bg-safeia-black text-white px-4 py-2 rounded-lg hover:bg-safeia-yellow hover:text-safeia-black transition duration-300 focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
                >
                  Prueba Gratuita
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-safeia-black hover:text-safeia-yellow transition focus:outline-none focus:ring-2 focus:ring-safeia-yellow rounded-lg px-2 py-1"
                >
                  <User className="h-5 w-5" />
                  <span>{currentUser.email}</span>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700">
                        Plan: {userSubscription || 'Free'}
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-safeia-yellow"
            >
              <span className="sr-only">Abrir menú</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isHomePage && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {link.label}
              </a>
            ))}
            
            {!currentUser ? (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Prueba Gratuita
                </Link>
              </>
            ) : (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-500">
                  {currentUser.email}
                </div>
                <div className="px-3 py-2 text-sm font-medium text-gray-500">
                  Plan: {userSubscription || 'Free'}
                </div>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}