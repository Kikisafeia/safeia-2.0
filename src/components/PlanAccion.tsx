import React, { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { saveAs } from 'file-saver';

interface ItemInspeccion {
  item: string;
  cumple: boolean;
  observaciones: string;
  accionCorrectiva?: string;
  responsable?: string;
  fechaLimite?: string;
  prioridad?: 'Alta' | 'Media' | 'Baja';
}

interface PlanAccionProps {
  itemsNoCumplen: ItemInspeccion[];
  onUpdateItems: (items: ItemInspeccion[]) => void;
}

export default function PlanAccion({ itemsNoCumplen, onUpdateItems }: PlanAccionProps) {
  const [items, setItems] = useState(itemsNoCumplen);

  const handleInputChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
    onUpdateItems(newItems);
  };

  const downloadPlanAccion = () => {
    const content = `
PLAN DE ACCIÓN - INSPECCIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO
Fecha: ${new Date().toLocaleDateString()}

ITEMS QUE REQUIEREN ACCIÓN:
${items.map((item, index) => `
${index + 1}. ${item.item}
   Observaciones: ${item.observaciones}
   Acción Correctiva: ${item.accionCorrectiva || 'No especificada'}
   Responsable: ${item.responsable || 'No asignado'}
   Fecha Límite: ${item.fechaLimite || 'No establecida'}
   Prioridad: ${item.prioridad || 'No establecida'}
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `plan_accion_${new Date().toISOString().split('T')[0]}.txt`);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Plan de Acción</h2>
        <button
          onClick={downloadPlanAccion}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Plan
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-medium text-lg text-red-600 mb-4">{item.item}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acción Correctiva
                </label>
                <textarea
                  value={item.accionCorrectiva || ''}
                  onChange={(e) => handleInputChange(index, 'accionCorrectiva', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe la acción correctiva necesaria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable
                </label>
                <input
                  type="text"
                  value={item.responsable || ''}
                  onChange={(e) => handleInputChange(index, 'responsable', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nombre del responsable"
                />

                <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={item.fechaLimite || ''}
                  onChange={(e) => handleInputChange(index, 'fechaLimite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />

                <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                  Prioridad
                </label>
                <select
                  value={item.prioridad || ''}
                  onChange={(e) => handleInputChange(index, 'prioridad', e.target.value as 'Alta' | 'Media' | 'Baja')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar prioridad</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
