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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generador de Charlas de Seguridad</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema de la Charla
              </label>
              <input
                type="text"
                name="tema"
                value={formData.tema}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="Ej: Trabajo en Altura"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos)
              </label>
              <select
                name="duracion"
                value={formData.duracion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estilo de la Charla
              </label>
              <select
                name="estilo"
                value={formData.estilo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audiencia
              </label>
              <input
                type="text"
                name="audiencia"
                value={formData.audiencia}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="Ej: Operarios de construcción"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industria
              </label>
              <input
                type="text"
                name="industria"
                value={formData.industria}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="Ej: Construcción"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivos Específicos
            </label>
            <textarea
              name="objetivosEspecificos"
              value={formData.objetivosEspecificos}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Describe los objetivos específicos de la charla"
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Riesgos Específicos a Abordar
            </label>
            <textarea
              name="riesgosEspecificos"
              value={formData.riesgosEspecificos}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Lista los riesgos específicos que quieres abordar"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Generando charla...
              </>
            ) : (
              'Generar Charla de Seguridad'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {charla && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{charla.titulo}</h2>
              <button
                onClick={downloadCharla}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Charla
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Objetivos</h3>
                <ul className="list-disc list-inside space-y-1">
                  {charla.objetivos.map((objetivo, index) => (
                    <li key={index} className="text-gray-600">{objetivo}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Introducción</h3>
                <p className="text-gray-600">{charla.introduccion}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Contenido</h3>
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

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Actividades</h3>
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

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Conclusiones</h3>
                <ul className="list-disc list-inside space-y-1">
                  {charla.conclusiones.map((conclusion, index) => (
                    <li key={index} className="text-gray-600">{conclusion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Evaluación</h3>
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
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Recursos Adicionales</h3>
                <ul className="list-disc list-inside space-y-1">
                  {charla.recursos.map((recurso, index) => (
                    <li key={index} className="text-gray-600">{recurso}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
