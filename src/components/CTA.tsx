import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 bg-safeia-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-black mb-4">Experimenta el Futuro de la Prevención de Riesgos Hoy</h2>
        <p className="text-xl mb-8 opacity-90">
          SAFEIA combina IA de vanguardia con herramientas fáciles de usar para una gestión de riesgos sin igual
        </p>
        <button className="bg-safeia-yellow text-safeia-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white transition duration-300 group">
          Prueba SAFEIA Hoy
          <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition" />
        </button>
      </div>
    </section>
  );
}