import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { generateSafetyTalk } from '../services/openai';
import { Loader2, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

interface CharlaSeguridad {
  titulo: string;
  duracion: string;
  objetivos: string[];
  introduccion: string;
  contenido: {
    tema: string;
    puntosClave: string[];
    ejemplos: string[];
  }[];
  actividades: {
    descripcion: string;
    duracion: string;
    materiales?: string[];
  }[];
  conclusiones: string[];
  evaluacion: {
    preguntas: string[];
    respuestasEsperadas: string[];
  };
  recursos: string[];
}

export default function CharlaSeguridadGenerator() {
  const [formData, setFormData] = useState({
    tema: '',
    duracion: '15',
    estilo: 'profesional',
    audiencia: '',
    industria: '',
    objetivosEspecificos: '',
    riesgosEspecificos: ''
  });

  const [loading, setLoading] = useState(false);
  const [charla, setCharla] = useState<CharlaSeguridad | null>(null);
  const [error, setError] = useState<string | null>(null);

  const estilosCharla = [
    { value: 'profesional', label: 'Profesional', descripcion: 'Enfoque formal y técnico, ideal para audiencias especializadas' },
    { value: 'didactico', label: 'Didáctico', descripcion: 'Enfoque educativo con ejemplos prácticos y actividades interactivas' },
    { value: 'motivacional', label: 'Motivacional', descripcion: 'Enfoque inspirador que promueve el compromiso con la seguridad' },
    { value: 'practico', label: 'Práctico', descripcion: 'Enfoque directo con demostraciones y ejercicios prácticos' },
    { value: 'participativo', label: 'Participativo', descripcion: 'Enfoque interactivo que fomenta la participación del grupo' },
    { value: 'narrativo', label: 'Narrativo', descripcion: 'Enfoque basado en historias y casos reales para mayor impacto' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await generateSafetyTalk(formData);
      setCharla(result);
    } catch (err) {
      setError('Error al generar la charla de seguridad. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCharla = () => {
    if (!charla) return;

    const content = `
CHARLA DE SEGURIDAD: ${charla.titulo}
Duración: ${charla.duracion}
Estilo: ${estilosCharla.find(e => e.value === formData.estilo)?.label || formData.estilo}

OBJETIVOS:
${charla.objetivos.map(obj => `• ${obj}`).join('\n')}

INTRODUCCIÓN:
${charla.introduccion}

CONTENIDO:
${charla.contenido.map(cont => `
${cont.tema}
Puntos Clave:
${cont.puntosClave.map(punto => `• ${punto}`).join('\n')}
Ejemplos:
${cont.ejemplos.map(ejemplo => `• ${ejemplo}`).join('\n')}
`).join('\n')}

ACTIVIDADES:
${charla.actividades.map(act => `
• ${act.descripcion}
  Duración: ${act.duracion}
  ${act.materiales ? `Materiales: ${act.materiales.join(', ')}` : ''}
`).join('\n')}

CONCLUSIONES:
${charla.conclusiones.map(conc => `• ${conc}`).join('\n')}

EVALUACIÓN:
${charla.evaluacion.preguntas.map((pregunta, index) => `
${index + 1}. ${pregunta}
   R: ${charla.evaluacion.respuestasEsperadas[index]}
`).join('\n')}

RECURSOS ADICIONALES:
${charla.recursos.map(rec => `• ${rec}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `charla_seguridad_${formData.tema.toLowerCase().replace(/\s+/g, '_')}.txt`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-safeia-black mb-6">Generador de Charlas de Seguridad</h1>
        <p className="text-safeia-black mb-8">
          Genera charlas de seguridad personalizadas para tu equipo de trabajo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="tema" className="block text-sm font-medium text-safeia-black">
              Tema de la Charla
            </label>
            <input
              type="text"
              id="tema"
              name="tema"
              value={formData.tema}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              required
              placeholder="Ej: Trabajo en Altura"
            />
          </div>

          <div>
            <label htmlFor="duracion" className="block text-sm font-medium text-safeia-black">
              Duración Estimada (minutos)
            </label>
            <select
              id="duracion"
              name="duracion"
              value={formData.duracion}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              required
            >
              <option value="5">5 minutos</option>
              <option value="10">10 minutos</option>
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
            </select>
          </div>

          <div>
            <label htmlFor="estilo" className="block text-sm font-medium text-safeia-black">
              Estilo de la Charla
            </label>
            <select
              id="estilo"
              name="estilo"
              value={formData.estilo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              required
            >
              {estilosCharla.map(estilo => (
                <option key={estilo.value} value={estilo.value}>{estilo.label}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {estilosCharla.find(e => e.value === formData.estilo)?.descripcion}
            </p>
          </div>

          <div>
            <label htmlFor="audiencia" className="block text-sm font-medium text-safeia-black">
              Audiencia Objetivo
            </label>
            <input
              type="text"
              id="audiencia"
              name="audiencia"
              value={formData.audiencia}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              required
              placeholder="Ej: Operarios de construcción"
            />
          </div>

          <div>
            <label htmlFor="industria" className="block text-sm font-medium text-safeia-black">
              Industria
            </label>
            <input
              type="text"
              id="industria"
              name="industria"
              value={formData.industria}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              required
              placeholder="Ej: Construcción"
            />
          </div>

          <div>
            <label htmlFor="objetivosEspecificos" className="block text-sm font-medium text-safeia-black">
              Objetivos Específicos
            </label>
            <textarea
              id="objetivosEspecificos"
              name="objetivosEspecificos"
              value={formData.objetivosEspecificos}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              rows={3}
              placeholder="Describe los objetivos específicos de la charla"
            />
          </div>

          <div>
            <label htmlFor="riesgosEspecificos" className="block text-sm font-medium text-safeia-black">
              Riesgos Específicos a Abordar
            </label>
            <textarea
              id="riesgosEspecificos"
              name="riesgosEspecificos"
              value={formData.riesgosEspecificos}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              rows={3}
              placeholder="Lista los riesgos específicos que quieres abordar"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Generando...
              </span>
            ) : (
              'Generar Charla de Seguridad'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {charla && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-safeia-black">{charla.titulo}</h2>
            <div className="prose max-w-none">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Objetivos</h3>
                <ul className="list-disc pl-5 text-safeia-black">
                  {charla.objetivos.map((objetivo, index) => (
                    <li key={index}>{objetivo}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Contenido Principal</h3>
                <div className="text-safeia-black whitespace-pre-line">{charla.introduccion}</div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Contenido</h3>
                {charla.contenido.map((seccion, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">{seccion.tema}</h4>
                    <div className="ml-4">
                      <h5 className="font-medium text-gray-700 mb-1">Puntos Clave:</h5>
                      <ul className="list-disc list-inside mb-2">
                        {seccion.puntosClave.map((punto, idx) => (
                          <li key={idx} className="text-gray-600">{punto}</li>
                        ))}
                      </ul>
                      <h5 className="font-medium text-gray-700 mb-1">Ejemplos:</h5>
                      <ul className="list-disc list-inside">
                        {seccion.ejemplos.map((ejemplo, idx) => (
                          <li key={idx} className="text-gray-600">{ejemplo}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Actividades</h3>
                {charla.actividades.map((actividad, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-medium text-gray-800">{actividad.descripcion}</p>
                    <p className="text-sm text-gray-600">Duración: {actividad.duracion}</p>
                    {actividad.materiales && (
                      <p className="text-sm text-gray-600">
                        Materiales: {actividad.materiales.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Conclusiones</h3>
                <ul className="list-disc pl-5 text-safeia-black">
                  {charla.conclusiones.map((conclusion, index) => (
                    <li key={index}>{conclusion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Evaluación</h3>
                <div className="space-y-4">
                  {charla.evaluacion.preguntas.map((pregunta, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-800 mb-2">P: {pregunta}</p>
                      <p className="text-gray-600">R: {charla.evaluacion.respuestasEsperadas[index]}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Recursos Adicionales</h3>
                <ul className="list-disc pl-5 text-safeia-black">
                  {charla.recursos.map((recurso, index) => (
                    <li key={index}>{recurso}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={downloadCharla}
                className="px-4 py-2 bg-safeia-black text-white rounded-md hover:bg-safeia-yellow hover:text-safeia-black transition duration-300"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
