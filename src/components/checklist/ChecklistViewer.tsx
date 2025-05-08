import React, { memo } from 'react'; // Import memo
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion'; // Remove AnimatePresence
import { ChecklistCategory, ChecklistFormData } from '../../types/checklist'; // Import types

// Use ChecklistCategory from types
// interface ChecklistItem {
//   categoria: string;
//   items: {
//     descripcion: string;
//     criterios: string[];
//     normativa?: string;
//     riesgoAsociado?: string;
//   }[];
// }

// Corrected interface definition
interface ChecklistViewerProps {
  checklist: ChecklistCategory[]; // Use imported type
  formData: Pick<ChecklistFormData, 'tipo' | 'area'>; // Use Pick for relevant props
}

const ChecklistViewer: React.FC<ChecklistViewerProps> = ({ checklist, formData }) => {
  if (!checklist || checklist.length === 0) {
    return null;
  }

  const downloadChecklistText = () => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 // Stagger category appearance
      } 
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.05 // Stagger item appearance within category
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };


  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Lista de Verificación Generada</h2>
        <button
          onClick={downloadChecklistText}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Lista (TXT)
        </button>
      </div>

      <motion.div className="space-y-8" variants={containerVariants}>
        {checklist.map((categoria, index) => (
          <motion.div 
            key={index} 
            className="border-b border-gray-200 pb-6 last:border-b-0"
            variants={categoryVariants} // Apply category animation
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {categoria.categoria}
            </h3>
            <motion.div className="space-y-4" variants={categoryVariants}>
              {categoria.items.map((item, itemIndex) => (
                <motion.div 
                  key={itemIndex} 
                  className="bg-gray-50 p-4 rounded-lg"
                  variants={itemVariants} // Apply item animation
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      aria-label={`Marcar como completado: ${item.descripcion}`}
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
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default memo(ChecklistViewer); // Wrap with memo
