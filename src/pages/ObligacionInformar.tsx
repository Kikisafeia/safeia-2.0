import React from 'react';
import DerechoASaber from '../components/DerechoASaber';

const ObligacionInformar: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Obligación de Informar (Derecho a Saber)
      </h1>
      <p className="text-gray-600 mb-8">
        La Obligación de Informar, también conocida como Derecho a Saber (DAS), es un requerimiento legal que establece 
        que todo empleador debe informar a sus trabajadores sobre los riesgos laborales a los que están expuestos, 
        las medidas preventivas y los métodos de trabajo correctos.
      </p>
      <DerechoASaber />
    </div>
  );
};

export default ObligacionInformar;