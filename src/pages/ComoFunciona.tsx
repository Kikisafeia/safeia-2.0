import React from 'react';
import { Brain, Layout, Zap, Clock, RefreshCw, FileText, AlertTriangle, ClipboardCheck, ClipboardList, FileSearch, Coins } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function ComoFunciona() {
  const features = [
    {
      title: 'Sistema de Tokens',
      description: 'SAFEIA utiliza un sistema de tokens para gestionar el uso de las herramientas. Cada acción consume una cantidad específica de tokens, permitiéndote controlar y optimizar tu uso del servicio.',
      icon: Coins,
    },
    {
      title: 'Interfaz intuitiva',
      description: 'SAFEIA cuenta con una interfaz fácil de usar, diseñada para que cualquier usuario pueda utilizarla sin dificultades. No se requieren conocimientos técnicos avanzados.',
      icon: Layout,
    },
    {
      title: 'Generación automatizada',
      description: 'Al utilizar SAFEIA, los usuarios pueden generar documentos de prevención de riesgos laborales de forma automática. Solo necesitan ingresar la información relevante y la plataforma se encargará de crear el documento completo.',
      icon: Zap,
    },
    {
      title: 'Inteligencia Artificial',
      description: 'SAFEIA utiliza algoritmos de inteligencia artificial para procesar y analizar la información ingresada por los usuarios. Esto permite que la plataforma genere documentos precisos y adapte las recomendaciones a las necesidades específicas de cada usuario.',
      icon: Brain,
    },
    {
      title: 'Velocidad y eficiencia',
      description: 'La automatización de SAFEIA agiliza el proceso de creación de documentos, ahorrando tiempo y esfuerzo a los usuarios. En cuestión de minutos, se pueden obtener documentos completos y listos para su uso.',
      icon: Clock,
    },
    {
      title: 'Actualización constante',
      description: 'SAFEIA se mantiene actualizado con las últimas normativas y regulaciones en materia de prevención de riesgos laborales. Esto garantiza que los documentos generados estén alineados con los requisitos legales más recientes.',
      icon: RefreshCw,
    },
  ];

  const tokenUsage = [
    {
      title: '¿Qué son los tokens?',
      description: 'Los tokens son la unidad de medida que utilizamos para gestionar el uso de nuestras herramientas. Cada plan incluye una cantidad específica de tokens que se renuevan periódicamente.'
    },
    {
      title: '¿Cómo se consumen los tokens?',
      description: 'Cada vez que utilizas una herramienta o generas un documento, se consume una cantidad determinada de tokens. Por ejemplo, generar un ATS consume 100 tokens, mientras que una inspección puede consumir 50 tokens.'
    },
    {
      title: '¿Cómo obtengo más tokens?',
      description: 'Puedes obtener más tokens actualizando tu plan o esperando a la renovación mensual/trimestral de tu plan actual. Ofrecemos planes desde gratuitos hasta avanzados para adaptarnos a tus necesidades.'
    }
  ];

  const documents = [
    {
      title: 'Procedimientos de Trabajo Seguro',
      description: 'Documentos detallados que describen paso a paso cómo realizar tareas de manera segura.',
      icon: FileText,
      tokenCost: 100
    },
    {
      title: 'Obligación de Informar Riesgos Laborales',
      description: 'Documentación formal para informar a los trabajadores sobre los riesgos laborales específicos.',
      icon: AlertTriangle,
      tokenCost: 75
    },
    {
      title: 'Check List',
      description: 'Listas de verificación para asegurar el cumplimiento de normas y procedimientos de seguridad.',
      icon: ClipboardCheck,
      tokenCost: 50
    },
    {
      title: 'Análisis de Trabajo Seguro',
      description: 'Evaluación detallada de los riesgos asociados a una tarea específica.',
      icon: ClipboardList,
      tokenCost: 100
    },
    {
      title: 'Investigación de Accidentes',
      description: 'Herramienta para analizar y documentar incidentes y accidentes laborales.',
      icon: FileSearch,
      tokenCost: 150
    },
  ];

  return (
    <div className="bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            ¿Cómo funciona SAFEIA?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Descubre cómo SAFEIA puede ayudarte a gestionar la seguridad y salud laboral de manera eficiente
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Sistema de Tokens
          </h3>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {tokenUsage.map((item) => (
              <div key={item.title} className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">{item.title}</h4>
                <p className="text-base text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Documentos y Consumo de Tokens
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div key={doc.title} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <doc.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{doc.title}</h4>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">{doc.description}</p>
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    Consumo: {doc.tokenCost} tokens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/planes"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Ver planes y precios
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
