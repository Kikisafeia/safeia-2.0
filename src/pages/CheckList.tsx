import { useState } from 'react'; // Remove React import
import { generateChecklist } from '../services/openai';
import ChecklistForm from '../components/checklist/ChecklistForm';
import ChecklistViewer from '../components/checklist/ChecklistViewer';
// import DashboardNavbar from '../components/DashboardNavbar'; // Si se necesita de nuevo

interface ChecklistItem {
  categoria: string;
  items: {
    descripcion: string;
    criterios: string[];
    normativa?: string;
    riesgoAsociado?: string;
  }[];
}

// Esta interfaz debe coincidir con la de ChecklistForm
interface ChecklistFormData {
  tipo: string;
  area: string;
  pais: string;
  actividades: string[];
  riesgosEspecificos: string;
  normativasAplicables: string;
}

export default function CheckList() {
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Guardar los datos del formulario que generó la checklist actual, para el visor
  const [submittedFormData, setSubmittedFormData] = useState<ChecklistFormData | null>(null);

  const handleSubmit = async (formData: ChecklistFormData) => {
    setLoading(true);
    setError(null);
    setChecklist([]); // Limpiar checklist anterior
    setSubmittedFormData(null);

    try {
      const result = await generateChecklist(formData);
      setChecklist(result.checklist);
      setSubmittedFormData(formData); // Guardar los datos del formulario que generó esta checklist
    } catch (err) {
      setError('Error al generar la lista de verificación. Por favor, intente nuevamente.');
      console.error('Error:', err);
      // Considerar si se debe limpiar la checklist aquí también o mantener la anterior si la hubo
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* <DashboardNavbar /> */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generador de Listas de Verificación</h1>

        <ChecklistForm onSubmit={handleSubmit} isGenerating={loading} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8" role="alert">
            {error}
          </div>
        )}

        {checklist.length > 0 && submittedFormData && (
          <ChecklistViewer checklist={checklist} formData={submittedFormData} />
        )}
      </div>
    </div>
  );
}
