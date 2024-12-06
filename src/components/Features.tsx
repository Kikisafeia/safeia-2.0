import React from 'react';
import { Clock, Shield, Globe, Laptop } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Clock,
      title: "Ahorra Tiempo y Recursos",
      description: "Optimiza las tareas de gestión de riesgos con automatización impulsada por IA."
    },
    {
      icon: Shield,
      title: "Cumplimiento Legal",
      description: "Asegura el cumplimiento con las regulaciones y estándares de la industria."
    },
    {
      icon: Globe,
      title: "Accesibilidad",
      description: "Acceso seguro desde cualquier parte del mundo, en cualquier momento."
    },
    {
      icon: Laptop,
      title: "Fácil de Usar",
      description: "Diseño intuitivo que requiere mínima capacitación para dominar."
    }
  ];

  return (
    <section id="caracteristicas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-safeia-black mb-4">¿Por qué elegir SAFEIA?</h2>
          <p className="text-xl text-gray-600">Descubre cómo nuestra plataforma con IA transforma la gestión de riesgos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-xl bg-gray-50 hover:bg-safeia-yellow/10 transition group">
              <feature.icon className="h-12 w-12 text-safeia-black group-hover:text-safeia-yellow transition-colors mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}