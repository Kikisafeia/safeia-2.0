import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { generateChecklist } from '../services/openai';
import { Loader2, Download, Plus, X } from 'lucide-react';
import { saveAs } from 'file-saver';

interface ChecklistItem {
  categoria: string;
  items: {
    descripcion: string;
    criterios: string[];
    normativa?: string;
    riesgoAsociado?: string;
  }[];
}

export default function CheckList() {
  const [formData, setFormData] = useState({
    tipo: '',
    area: '',
    actividades: [] as string[],
    riesgosEspecificos: '',
    normativasAplicables: '',
  });

  const [currentActivity, setCurrentActivity] = useState('');
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addActivity = () => {
    if (currentActivity.trim() && !formData.actividades.includes(currentActivity.trim())) {
      setFormData(prev => ({
        ...prev,
        actividades: [...prev.actividades, currentActivity.trim()]
      }));
      setCurrentActivity('');
    }
  };

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addActivity();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await generateChecklist(formData);
      setChecklist(result.checklist);
    } catch (err) {
      setError('Error al generar la lista de verificación. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadChecklist = () => {
    if (!checklist.length) return;

    const content = `LISTA DE VERIFICACIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO

Tipo: ${formData.tipo}
Área: ${formData.area}
Fecha: ${new Date().toLocaleDateString()}

${checklist.map(categoria => `
CATEGORÍA: ${categoria.categoria}
${categoria.items.map((item, index) => `
${index + 1}. ${item.descripcion}
   Criterios de evaluación:
   ${item.criterios.map(criterio => `   • ${criterio}`).join('\n')}
   ${item.normativa ? `\n   Normativa aplicable: ${item.normativa}` : ''}
   ${item.riesgoAsociado ? `\n   Riesgo asociado: ${item.riesgoAsociado}` : ''}
`).join('\n')}`).join('\n')}

Evaluado por: _____________________
Fecha: _____________________
Firma: _____________________

Observaciones:
_____________________
_____________________
_____________________`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `checklist_${formData.tipo.toLowerCase().replace(/\s+/g, '_')}_${formData.area.toLowerCase().replace(/\s+/g, '_')}.txt`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generador de Listas de Verificación</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Lista de Verificación
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Seleccione un tipo</option>
                <option value="Inspección General">Inspección General</option>
                <option value="Equipos y Herramientas">Equipos y Herramientas</option>
                <option value="EPP">Elementos de Protección Personal</option>
                <option value="Orden y Limpieza">Orden y Limpieza</option>
                <option value="Ergonomía">Ergonomía</option>
                <option value="Riesgos Específicos">Riesgos Específicos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área o Proceso
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="Ej: Producción, Almacén, Oficinas"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actividades a Evaluar
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentActivity}
                onChange={(e) => setCurrentActivity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ingrese una actividad y presione Enter"
              />
              <button
                type="button"
                onClick={addActivity}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.actividades.map((actividad, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{actividad}</span>
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
              placeholder="Liste los riesgos específicos que desea evaluar"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Normativas Aplicables
            </label>
            <textarea
              name="normativasAplicables"
              value={formData.normativasAplicables}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Especifique las normativas o estándares aplicables"
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
                Generando lista de verificación...
              </>
            ) : (
              'Generar Lista de Verificación'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {checklist.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lista de Verificación Generada</h2>
              <button
                onClick={downloadChecklist}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar Lista
              </button>
            </div>

            <div className="space-y-8">
              {checklist.map((categoria, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {categoria.categoria}
                  </h3>
                  <div className="space-y-4">
                    {categoria.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.descripcion}</p>
                            <div className="mt-2 space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Criterios de evaluación:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {item.criterios.map((criterio, critIndex) => (
                                    <li key={critIndex}>{criterio}</li>
                                  ))}
                                </ul>
                              </div>
                              {item.normativa && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Normativa: </span>
                                  {item.normativa}
                                </p>
                              )}
                              {item.riesgoAsociado && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Riesgo asociado: </span>
                                  {item.riesgoAsociado}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
