import React from 'react';
import AccidentInvestigation from '../components/AccidentInvestigation';

const InvestigacionAccidentes: React.FC = () => {
  const handleMethodSelect = (method: string) => {
    console.log('Método seleccionado:', method);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Herramientas de Investigación de Accidentes
        </h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 mb-8">
            Seleccione una metodología de investigación para acceder a su guía paso a paso 
            y mejores prácticas recomendadas.
          </p>

          <AccidentInvestigation onMethodSelect={handleMethodSelect} />
        </div>
      </div>
    </div>
  );
};

export default InvestigacionAccidentes;
