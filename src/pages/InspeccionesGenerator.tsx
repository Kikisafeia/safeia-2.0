import React, { useState } from 'react';
import { generateInspection } from '../services/aiService'; // Updated import path
import { Loader2, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import ItemInspeccion from '../components/ItemInspeccion';
import PlanAccion from '../components/PlanAccion';

interface Inspeccion {
  titulo: string;
  fecha: string;
  area: string;
  tipoInspeccion: string;
  criteriosEvaluacion: {
    categoria: string;
    items: {
      item: string;
      cumple: boolean;
      observaciones: string;
      accionCorrectiva?: string;
      responsable?: string;
      fechaLimite?: string;
      prioridad?: 'Alta' | 'Media' | 'Baja';
    }[];
  }[];
  conclusiones: string[];
  recomendaciones: string[];
}

export default function InspeccionesGenerator() {
  const [formData, setFormData] = useState({
    area: '',
    tipoInspeccion: 'general',
    enfoque: '',
    industria: '',
    riesgosEspecificos: '',
    normativaAplicable: ''
  });

  const [loading, setLoading] = useState(false);
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostrarPlanAccion, setMostrarPlanAccion] = useState(false);

  const tiposInspeccion = [
    { value: 'general', label: 'General', descripcion: 'Evaluación completa de todas las áreas y aspectos de seguridad' },
    { value: 'especifica', label: 'Específica', descripcion: 'Centrada en un área o proceso particular' },
    { value: 'planificada', label: 'Planificada', descripcion: 'Inspección programada regularmente' },
    { value: 'noplanificada', label: 'No Planificada', descripcion: 'Inspección sorpresa o por evento específico' },
    { value: 'preoperacional', label: 'Pre-operacional', descripcion: 'Antes de iniciar operaciones o usar equipos' },
    { value: 'correctiva', label: 'Correctiva', descripcion: 'Seguimiento de acciones correctivas previas' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMostrarPlanAccion(false);

    try {
      const result = await generateInspection(formData);
      setInspeccion(result);
    } catch (err) {
      setError('Error al generar la inspección. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (categoriaIndex: number, itemIndex: number, cumple: boolean, observaciones: string) => {
    if (!inspeccion) return;

    const newInspeccion = { ...inspeccion };
    newInspeccion.criteriosEvaluacion[categoriaIndex].items[itemIndex] = {
      ...newInspeccion.criteriosEvaluacion[categoriaIndex].items[itemIndex],
      cumple,
      observaciones
    };
    setInspeccion(newInspeccion);
  };

  const handleUpdatePlanAccion = (itemsActualizados: any[]) => {
    if (!inspeccion) return;

    const newInspeccion = { ...inspeccion };
    // Actualizar los items no conformes con las acciones correctivas
    itemsActualizados.forEach(itemActualizado => {
      newInspeccion.criteriosEvaluacion.forEach(categoria => {
        categoria.items.forEach(item => {
          if (item.item === itemActualizado.item) {
            Object.assign(item, itemActualizado);
          }
        });
      });
    });
    setInspeccion(newInspeccion);
  };

  const getItemsNoCumplen = () => {
    if (!inspeccion) return [];
    
    const items: any[] = [];
    inspeccion.criteriosEvaluacion.forEach(categoria => {
      categoria.items.forEach(item => {
        if (!item.cumple) {
          items.push(item);
        }
      });
    });
    return items;
  };

  const downloadInspeccion = () => {
    if (!inspeccion) return;

    const content = `
FORMATO DE INSPECCIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO

${inspeccion.titulo}
Fecha: ${inspeccion.fecha}
Área: ${inspeccion.area}
Tipo de Inspección: ${tiposInspeccion.find(t => t.value === formData.tipoInspeccion)?.label || formData.tipoInspeccion}

CRITERIOS DE EVALUACIÓN:
${inspeccion.criteriosEvaluacion.map(categoria => `
${categoria.categoria}
${categoria.items.map(item => `
• ${item.item}
  Cumple: ${item.cumple ? 'Sí' : 'No'}
  Observaciones: ${item.observaciones}
  ${item.accionCorrectiva ? `Acción Correctiva: ${item.accionCorrectiva}` : ''}
  ${item.responsable ? `Responsable: ${item.responsable}` : ''}
  ${item.fechaLimite ? `Fecha Límite: ${item.fechaLimite}` : ''}
  ${item.prioridad ? `Prioridad: ${item.prioridad}` : ''}
`).join('\n')}
`).join('\n')}

CONCLUSIONES:
${inspeccion.conclusiones.map(conc => `• ${conc}`).join('\n')}

RECOMENDACIONES:
${inspeccion.recomendaciones.map(rec => `• ${rec}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `inspeccion_${formData.area.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`);
  };

  return (
    <div className="min-h-screen bg-safeia-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-safeia-black mb-6">Generador de Formatos de Inspección</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-safeia-black">
              Área a Inspeccionar
            </label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              placeholder="Ej: Almacén, Producción, Oficinas"
              required
            />
          </div>
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-safeia-black">
              Tipo de Inspección
            </label>
            <select
              id="tipo"
              name="tipoInspeccion"
              value={formData.tipoInspeccion}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              required
            >
              {tiposInspeccion.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-safeia-black">
              {tiposInspeccion.find(t => t.value === formData.tipoInspeccion)?.descripcion}
            </p>
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
              placeholder="Ej: Manufactura, Construcción"
              required
            />
          </div>
          <div>
            <label htmlFor="enfoque" className="block text-sm font-medium text-safeia-black">
              Enfoque de la Inspección
            </label>
            <input
              type="text"
              id="enfoque"
              name="enfoque"
              value={formData.enfoque}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              placeholder="Ej: Seguridad eléctrica, EPP, Orden y limpieza"
            />
          </div>
          <div>
            <label htmlFor="riesgosEspecificos" className="block text-sm font-medium text-safeia-black">
              Riesgos Específicos
            </label>
            <textarea
              id="riesgosEspecificos"
              name="riesgosEspecificos"
              value={formData.riesgosEspecificos}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              placeholder="Lista los riesgos específicos que se deben evaluar"
            />
          </div>
          <div>
            <label htmlFor="normativaAplicable" className="block text-sm font-medium text-safeia-black">
              Normativa Aplicable
            </label>
            <textarea
              id="normativaAplicable"
              name="normativaAplicable"
              value={formData.normativaAplicable}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
              placeholder="Menciona las normas o regulaciones aplicables"
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
              'Generar Formato de Inspección'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {inspeccion && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-safeia-black">
              Inspección de Seguridad - {inspeccion.area}
            </h2>

            <div className="prose max-w-none">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Información General</h3>
                <ul className="list-none space-y-2 text-safeia-black">
                  <li><strong>Área:</strong> {inspeccion.area}</li>
                  <li><strong>Tipo:</strong> {inspeccion.tipoInspeccion}</li>
                  <li><strong>Fecha:</strong> {inspeccion.fecha}</li>
                </ul>
              </div>

              {inspeccion.criteriosEvaluacion.map((categoria, index) => (
                <ItemInspeccion
                  key={index}
                  categoria={categoria.categoria}
                  items={categoria.items}
                  onUpdateItem={handleUpdateItem}
                  categoriaIndex={index}
                />
              ))}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Conclusiones</h3>
                <ul className="list-disc list-inside space-y-1 text-safeia-black">
                  {inspeccion.conclusiones.map((conclusion, index) => (
                    <li key={index}>{conclusion}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-safeia-black">Recomendaciones</h3>
                <ul className="list-disc list-inside space-y-1 text-safeia-black">
                  {inspeccion.recomendaciones.map((recomendacion, index) => (
                    <li key={index}>{recomendacion}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setMostrarPlanAccion(!mostrarPlanAccion)}
                className="px-4 py-2 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark transition duration-300"
              >
                {mostrarPlanAccion ? 'Ver Inspección' : 'Ver Plan de Acción'}
              </button>
              <button
                onClick={downloadInspeccion}
                className="px-4 py-2 bg-safeia-black text-white rounded-md hover:bg-safeia-yellow hover:text-safeia-black transition duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Formato
              </button>
            </div>

            {mostrarPlanAccion && (
              <PlanAccion
                itemsNoCumplen={getItemsNoCumplen()}
                onUpdateItems={handleUpdatePlanAccion}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
