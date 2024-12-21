import React, { useState } from 'react';
import { generateSafetyTalk, generateSuggestions, generateSafetyImage } from '../services/openai';
import { Loader2, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  const handleSuggestions = async () => {
    if (!formData.tema || !formData.industria) {
      setError('Por favor, ingrese el tema y la industria para obtener sugerencias.');
      return;
    }

    setLoadingSuggestions(true);
    setError(null);

    try {
      const suggestions = await generateSuggestions(formData.tema, formData.industria);
      setFormData(prev => ({
        ...prev,
        objetivosEspecificos: suggestions.objetivos.join('\n'),
        riesgosEspecificos: suggestions.riesgos.join('\n')
      }));
    } catch (err) {
      setError('Error al generar sugerencias. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const [charlaResult, imageUrlResult] = await Promise.all([
        generateSafetyTalk(formData),
        generateSafetyImage(formData.tema, formData.estilo)
      ]);
      
      setCharla(charlaResult);
      setImageUrl(imageUrlResult);
    } catch (err) {
      setError('Error al generar la charla de seguridad. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCharla = async () => {
    if (!charla) return;

    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    // Función auxiliar para agregar texto con salto de línea automático
    const addWrappedText = (text: string, y: number, fontSize = 12) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, y);
      return y + (lines.length * lineHeight);
    };

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText(charla.titulo.toUpperCase(), yPos, 16);
    yPos += 5;

    // Información básica
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    yPos = addWrappedText(`Duración: ${charla.duracion}`, yPos);
    yPos = addWrappedText(`Estilo: ${formData.estilo}`, yPos);
    yPos += 5;

    // Si hay una imagen, agregarla
    if (imageUrl) {
      try {
        // Crear un elemento imagen temporal
        const img = new Image();
        img.crossOrigin = "Anonymous";  // Importante para imágenes de URLs externas
        
        // Esperar a que la imagen se cargue
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Calcular dimensiones para mantener la proporción
        const imgWidth = 170;  // Ancho deseado en el PDF
        const imgHeight = (img.height * imgWidth) / img.width;
        
        // Centrar la imagen
        const xPos = (pageWidth - imgWidth) / 2;
        
        // Agregar la imagen
        doc.addImage(img, 'JPEG', xPos, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      } catch (error) {
        console.error('Error al agregar la imagen al PDF:', error);
      }
    }

    // Objetivos
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('OBJETIVOS:', yPos);
    doc.setFont('helvetica', 'normal');
    charla.objetivos.forEach(obj => {
      yPos = addWrappedText(`• ${obj}`, yPos);
    });
    yPos += 5;

    // Introducción
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('INTRODUCCIÓN:', yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(charla.introduccion, yPos);
    yPos += 5;

    // Contenido
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('CONTENIDO:', yPos);
    doc.setFont('helvetica', 'normal');
    charla.contenido.forEach(cont => {
      // Verificar si necesitamos una nueva página
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
      }

      yPos = addWrappedText(cont.tema, yPos);
      yPos += 3;
      
      doc.setFont('helvetica', 'bold');
      yPos = addWrappedText('Puntos Clave:', yPos);
      doc.setFont('helvetica', 'normal');
      cont.puntosClave.forEach(punto => {
        yPos = addWrappedText(`• ${punto}`, yPos);
      });
      
      doc.setFont('helvetica', 'bold');
      yPos = addWrappedText('Ejemplos:', yPos);
      doc.setFont('helvetica', 'normal');
      cont.ejemplos.forEach(ejemplo => {
        yPos = addWrappedText(`• ${ejemplo}`, yPos);
      });
      yPos += 5;
    });

    // Actividades
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('ACTIVIDADES:', yPos);
    doc.setFont('helvetica', 'normal');
    charla.actividades.forEach(act => {
      yPos = addWrappedText(`• ${act.descripcion}`, yPos);
      yPos = addWrappedText(`  Duración: ${act.duracion}`, yPos);
      if (act.materiales) {
        yPos = addWrappedText(`  Materiales: ${act.materiales.join(', ')}`, yPos);
      }
      yPos += 3;
    });

    // Conclusiones
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('CONCLUSIONES:', yPos);
    doc.setFont('helvetica', 'normal');
    charla.conclusiones.forEach(conc => {
      yPos = addWrappedText(`• ${conc}`, yPos);
    });

    // Evaluación
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('EVALUACIÓN:', yPos);
    doc.setFont('helvetica', 'normal');
    charla.evaluacion.preguntas.forEach((pregunta, index) => {
      yPos = addWrappedText(`${index + 1}. ${pregunta}`, yPos);
      yPos = addWrappedText(`   R: ${charla.evaluacion.respuestasEsperadas[index]}`, yPos);
      yPos += 3;
    });

    // Recursos
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont('helvetica', 'bold');
    yPos = addWrappedText('RECURSOS:', yPos);
    doc.setFont('helvetica', 'normal');
    charla.recursos.forEach(recurso => {
      yPos = addWrappedText(`• ${recurso}`, yPos);
    });

    // Guardar el PDF
    doc.save(`Charla_de_Seguridad_${charla.titulo.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

          <div className="space-y-4">
            <div>
              <label htmlFor="objetivosEspecificos" className="block text-sm font-medium text-gray-700">
                Objetivos Específicos
              </label>
              <div className="mt-1 relative">
                <textarea
                  id="objetivosEspecificos"
                  name="objetivosEspecificos"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.objetivosEspecificos}
                  onChange={handleInputChange}
                  placeholder="Ingrese los objetivos específicos de la charla"
                />
              </div>
            </div>

            <div>
              <label htmlFor="riesgosEspecificos" className="block text-sm font-medium text-gray-700">
                Riesgos Específicos a Abordar
              </label>
              <div className="mt-1 relative">
                <textarea
                  id="riesgosEspecificos"
                  name="riesgosEspecificos"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.riesgosEspecificos}
                  onChange={handleInputChange}
                  placeholder="Ingrese los riesgos específicos a abordar"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSuggestions}
              disabled={loadingSuggestions || !formData.tema || !formData.industria}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loadingSuggestions ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Generando sugerencias...
                </>
              ) : (
                'Generar sugerencias con IA'
              )}
            </button>
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

            {imageUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Imagen representativa</h3>
                <div className="mt-2">
                  <img
                    src={imageUrl}
                    alt="Imagen representativa de la charla de seguridad"
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}

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
