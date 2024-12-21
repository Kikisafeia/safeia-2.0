import React from 'react';

export default function CommunitySection() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-black text-white mb-8">
          ¿Deseas formar parte de la comunidad SAFEIA?
        </h2>
        <p className="text-white text-xl mb-12 max-w-3xl mx-auto">
          En SAFEIA, no solo ofrecemos una herramienta, sino una comunidad comprometida con la seguridad y el
          bienestar de tus empleados. Al unirte a nosotros, te unes a una red de profesionales preocupados por la
          prevención de riesgos laborales y la inteligencia artificial.
        </p>
        <button
          className="bg-safeia-yellow hover:bg-safeia-yellow/90 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
          onClick={() => window.location.href = 'https://nas.io/es-mx/comunidadsafeia'}
        >
          REGISTRATE AQUI
        </button>
      </div>
    </section>
  );
}
