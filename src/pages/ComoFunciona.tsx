import React from 'react';
import { Brain, Layout, Zap, Clock, RefreshCw, FileText, AlertTriangle, ClipboardCheck, ClipboardList, FileSearch } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ComoFunciona() {
  const features = [
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

  const documents = [
    {
      title: 'Procedimientos de Trabajo Seguro',
      description: 'Documentos detallados que describen paso a paso cómo realizar tareas de manera segura.',
      icon: FileText,
    },
    {
      title: 'Obligación de Informar Riesgos Laborales',
      description: 'Documentación formal para informar a los trabajadores sobre los riesgos laborales específicos.',
      icon: AlertTriangle,
    },
    {
      title: 'Check List',
      description: 'Listas de verificación para asegurar el cumplimiento de normas y procedimientos de seguridad.',
      icon: ClipboardCheck,
    },
    {
      title: 'Análisis de Trabajo Seguro (AST o ART)',
      description: 'Evaluaciones detalladas de los riesgos asociados a tareas específicas.',
      icon: ClipboardList,
    },
    {
      title: 'Investigación de Accidentes',
      description: 'Plantillas y guías para la investigación y documentación de accidentes laborales.',
      icon: FileSearch,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-safeia-yellow/10">
      <Navbar />
      
      <main className="py-16">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-black text-safeia-black sm:text-5xl md:text-6xl tracking-wide">
              ¿Cómo Funciona?
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 sm:mt-4">
              SAFEIA es una plataforma impulsada por inteligencia artificial que facilita la creación de documentos 
              de prevención de riesgos laborales de manera rápida y precisa.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-safeia-yellow text-safeia-black">
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-safeia-black">{feature.title}</h3>
                </div>
                <p className="mt-4 text-base text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-safeia-yellow/10 to-safeia-yellow/20 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-safeia-black mb-4">En resumen</h2>
            <p className="text-lg text-gray-700">
              SAFEIA es una plataforma que combina la inteligencia artificial y la automatización para 
              simplificar y agilizar la creación de documentos de prevención de riesgos laborales, 
              brindando resultados precisos y confiables.
            </p>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-safeia-black">Documentos PRL</h2>
            <p className="mt-4 text-xl text-gray-600">
              A continuación te damos algunos ejemplos de documentos y plantillas con los que SAFEIA puede trabajar:
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.title}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-safeia-yellow/20 text-safeia-yellow-dark">
                      <doc.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-safeia-black">{doc.title}</h3>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {doc.description}
                </p>
              </div>
            ))}
            <div className="bg-gradient-to-br from-safeia-yellow/10 to-safeia-yellow/20 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-safeia-yellow/30 flex items-center justify-center">
              <p className="text-lg text-safeia-black font-medium">...y muchos más</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
