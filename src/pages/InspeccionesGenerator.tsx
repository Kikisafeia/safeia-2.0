import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { generateInspection } from '../services/openai';
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
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generador de Formatos de Inspección</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área a Inspeccionar
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="Ej: Almacén, Producción, Oficinas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Inspección
              </label>
              <select
                name="tipoInspeccion"
                value={formData.tipoInspeccion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {tiposInspeccion.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {tiposInspeccion.find(t => t.value === formData.tipoInspeccion)?.descripcion}
              </p>
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
                placeholder="Ej: Manufactura, Construcción"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enfoque de la Inspección
              </label>
              <input
                type="text"
                name="enfoque"
                value={formData.enfoque}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ej: Seguridad eléctrica, EPP, Orden y limpieza"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Riesgos Específicos
            </label>
            <textarea
              name="riesgosEspecificos"
              value={formData.riesgosEspecificos}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Lista los riesgos específicos que se deben evaluar"
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Normativa Aplicable
            </label>
            <textarea
              name="normativaAplicable"
              value={formData.normativaAplicable}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Menciona las normas o regulaciones aplicables"
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
                Generando formato...
              </>
            ) : (
              'Generar Formato de Inspección'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {inspeccion && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{inspeccion.titulo}</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setMostrarPlanAccion(!mostrarPlanAccion)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {mostrarPlanAccion ? 'Ver Inspección' : 'Ver Plan de Acción'}
                </button>
                <button
                  onClick={downloadInspeccion}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Formato
                </button>
              </div>
            </div>

            {!mostrarPlanAccion ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{inspeccion.fecha}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Área</p>
                    <p className="font-medium">{inspeccion.area}</p>
                  </div>
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

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Conclusiones</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {inspeccion.conclusiones.map((conclusion, index) => (
                      <li key={index} className="text-gray-600">{conclusion}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Recomendaciones</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {inspeccion.recomendaciones.map((recomendacion, index) => (
                      <li key={index} className="text-gray-600">{recomendacion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
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
