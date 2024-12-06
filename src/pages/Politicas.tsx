import React, { useState } from 'react';
import { generatePolitica, generatePoliticaSuggestions } from '../services/azureOpenAI';
import { Wand2, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const tipoPoliticas = [
  { id: 'sst', nombre: 'Seguridad y Salud en el Trabajo' },
  { id: 'medioambiente', nombre: 'Medio Ambiente' },
  { id: 'calidad', nombre: 'Calidad' },
  { id: 'security', nombre: 'Seguridad de la Información' },
  { id: 'integrado', nombre: 'Sistema Integrado de Gestión' }
];

const Politicas: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipoPolitica: '',
    empresa: '',
    pais: '',
    sector: '',
    actividades: '',
    trabajadores: 0,
    alcance: '',
    objetivos: '',
  });
  const [resultado, setResultado] = useState<{
    titulo: string;
    introduccion: string;
    proposito: string;
    alcance: string;
    objetivos: string[];
    compromisos: string[];
    responsabilidades: {
      gerencia: string[];
      supervisores: string[];
      trabajadores: string[];
    };
    marco_legal: string[];
    revision_actualizacion: string;
    firma: {
      cargo: string;
      fecha: string;
    };
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'trabajadores' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const politica = await generatePolitica(formData);
      setResultado(politica);
    } catch (error) {
      console.error('Error al generar la política:', error);
      setError(error instanceof Error ? error.message : 'Error al generar la política');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async (field: 'actividades' | 'alcance' | 'objetivos') => {
    if (!formData.sector || !formData.pais || !formData.tipoPolitica) {
      setError('Por favor, selecciona el tipo de política, sector y país primero.');
      return;
    }

    setLoadingSuggestions(true);
    setError(null);

    try {
      const suggestions = await generatePoliticaSuggestions(
        formData.tipoPolitica,
        formData.sector,
        formData.pais
      );

      setFormData(prev => ({
        ...prev,
        [field]: suggestions[field]
      }));
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener sugerencias');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!resultado) return;

    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;

    // Título
    doc.setFontSize(16);
    doc.text(resultado.titulo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // Función helper para agregar texto con saltos de línea automáticos
    const addText = (text: string, fontSize: number = 12) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(lines, margin, yPosition);
      yPosition += lineHeight * lines.length;
      yPosition += lineHeight; // Espacio extra después del párrafo
    };

    // Función helper para agregar lista
    const addList = (items: string[], title: string) => {
      doc.setFontSize(14);
      doc.text(title, margin, yPosition);
      yPosition += lineHeight;
      doc.setFontSize(12);
      items.forEach(item => {
        const lines = doc.splitTextToSize('• ' + item, pageWidth - margin * 3);
        doc.text(lines, margin * 1.5, yPosition);
        yPosition += lineHeight * lines.length;
      });
      yPosition += lineHeight;
    };

    // Agregar contenido
    addText(resultado.introduccion);
    addText('Propósito', 14);
    addText(resultado.proposito);
    addText('Alcance', 14);
    addText(resultado.alcance);
    
    addList(resultado.objetivos, 'Objetivos');
    addList(resultado.compromisos, 'Compromisos');
    
    // Responsabilidades
    doc.setFontSize(14);
    doc.text('Responsabilidades', margin, yPosition);
    yPosition += lineHeight * 1.5;
    
    addList(resultado.responsabilidades.gerencia, 'Gerencia');
    addList(resultado.responsabilidades.supervisores, 'Supervisores');
    addList(resultado.responsabilidades.trabajadores, 'Trabajadores');
    
    addList(resultado.marco_legal, 'Marco Legal');
    
    addText('Revisión y Actualización', 14);
    addText(resultado.revision_actualizacion);
    
    // Firma
    yPosition += lineHeight * 2;
    doc.text(resultado.firma.cargo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight;
    doc.text(resultado.firma.fecha, pageWidth / 2, yPosition, { align: 'center' });

    doc.save('politica.pdf');
  };

  const handleDownloadWord = async () => {
    if (!resultado) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: resultado.titulo,
            heading: HeadingLevel.HEADING_1,
            alignment: 'center',
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: resultado.introduccion }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Propósito',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: resultado.proposito }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Alcance',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: resultado.alcance }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Objetivos',
            heading: HeadingLevel.HEADING_2,
          }),
          ...resultado.objetivos.map(
            obj => new Paragraph({
              text: '• ' + obj,
              spacing: { before: 200 },
            })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Compromisos',
            heading: HeadingLevel.HEADING_2,
          }),
          ...resultado.compromisos.map(
            comp => new Paragraph({
              text: '• ' + comp,
              spacing: { before: 200 },
            })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Responsabilidades',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: 'Gerencia',
            heading: HeadingLevel.HEADING_3,
          }),
          ...resultado.responsabilidades.gerencia.map(
            resp => new Paragraph({
              text: '• ' + resp,
              spacing: { before: 200 },
            })
          ),
          new Paragraph({
            text: 'Supervisores',
            heading: HeadingLevel.HEADING_3,
          }),
          ...resultado.responsabilidades.supervisores.map(
            resp => new Paragraph({
              text: '• ' + resp,
              spacing: { before: 200 },
            })
          ),
          new Paragraph({
            text: 'Trabajadores',
            heading: HeadingLevel.HEADING_3,
          }),
          ...resultado.responsabilidades.trabajadores.map(
            resp => new Paragraph({
              text: '• ' + resp,
              spacing: { before: 200 },
            })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Marco Legal',
            heading: HeadingLevel.HEADING_2,
          }),
          ...resultado.marco_legal.map(
            ley => new Paragraph({
              text: '• ' + ley,
              spacing: { before: 200 },
            })
          ),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Revisión y Actualización',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: resultado.revision_actualizacion }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: resultado.firma.cargo,
            alignment: 'center',
          }),
          new Paragraph({
            text: resultado.firma.fecha,
            alignment: 'center',
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'politica.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Generador de Políticas Empresariales
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-gray-600 mb-6">
            Esta herramienta te ayuda a crear diferentes tipos de políticas empresariales 
            que cumplen con los estándares internacionales y la legislación local.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Política
                </label>
                <select
                  name="tipoPolitica"
                  value={formData.tipoPolitica}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccionar tipo de política</option>
                  {tipoPoliticas.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Constructora XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <select
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccionar país</option>
                  <option value="Chile">Chile</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Perú">Perú</option>
                  <option value="Colombia">Colombia</option>
                  <option value="México">México</option>
                  <option value="España">España</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Panamá">Panamá</option>
                  <option value="República Dominicana">República Dominicana</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector Industrial
                </label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Construcción"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Trabajadores
                </label>
                <input
                  type="number"
                  name="trabajadores"
                  value={formData.trabajadores}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: 100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actividades Principales
                </label>
                <div className="relative">
                  <textarea
                    name="actividades"
                    value={formData.actividades}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md pr-12"
                    rows={3}
                    placeholder="Describe las principales actividades de la empresa..."
                  />
                  <button
                    type="button"
                    onClick={() => handleGetSuggestions('actividades')}
                    disabled={!formData.sector || !formData.pais || !formData.tipoPolitica || loadingSuggestions}
                    className="absolute right-2 top-2 p-2 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 z-10"
                    title="Obtener sugerencias con IA"
                  >
                    <Wand2 className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alcance de la Política
                </label>
                <div className="relative">
                  <textarea
                    name="alcance"
                    value={formData.alcance}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md pr-12"
                    rows={3}
                    placeholder="Define el alcance deseado de la política..."
                  />
                  <button
                    type="button"
                    onClick={() => handleGetSuggestions('alcance')}
                    disabled={!formData.sector || !formData.pais || !formData.tipoPolitica || loadingSuggestions}
                    className="absolute right-2 top-2 p-2 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 z-10"
                    title="Obtener sugerencias con IA"
                  >
                    <Wand2 className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objetivos Específicos
                </label>
                <div className="relative">
                  <textarea
                    name="objetivos"
                    value={formData.objetivos}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md pr-12"
                    rows={3}
                    placeholder="Define los objetivos específicos de la política..."
                  />
                  <button
                    type="button"
                    onClick={() => handleGetSuggestions('objetivos')}
                    disabled={!formData.sector || !formData.pais || !formData.tipoPolitica || loadingSuggestions}
                    className="absolute right-2 top-2 p-2 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 z-10"
                    title="Obtener sugerencias con IA"
                  >
                    {loadingSuggestions ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    ) : (
                      <Wand2 className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 text-white rounded-md ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Generando...' : 'Generar Política'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {resultado && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {resultado.titulo}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  title="Descargar PDF"
                >
                  <FileDown className="w-5 h-5" />
                  PDF
                </button>
                <button
                  onClick={handleDownloadWord}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  title="Descargar Word"
                >
                  <FileDown className="w-5 h-5" />
                  Word
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Introducción</h3>
                <p className="text-gray-700 whitespace-pre-line">{resultado.introduccion}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Propósito</h3>
                <p className="text-gray-700 whitespace-pre-line">{resultado.proposito}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Alcance</h3>
                <p className="text-gray-700 whitespace-pre-line">{resultado.alcance}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Objetivos</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {resultado.objetivos.map((objetivo, index) => (
                    <li key={index} className="text-gray-700">{objetivo}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Compromisos</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {resultado.compromisos.map((compromiso, index) => (
                    <li key={index} className="text-gray-700">{compromiso}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Responsabilidades</h3>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">Gerencia</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {resultado.responsabilidades.gerencia.map((resp, index) => (
                      <li key={index} className="text-gray-700">{resp}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">Supervisores</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {resultado.responsabilidades.supervisores.map((resp, index) => (
                      <li key={index} className="text-gray-700">{resp}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">Trabajadores</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {resultado.responsabilidades.trabajadores.map((resp, index) => (
                      <li key={index} className="text-gray-700">{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Marco Legal</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {resultado.marco_legal.map((ley, index) => (
                    <li key={index} className="text-gray-700">{ley}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Revisión y Actualización</h3>
                <p className="text-gray-700 whitespace-pre-line">{resultado.revision_actualizacion}</p>
              </div>

              <div className="mt-8 pt-8 border-t">
                <div className="text-right">
                  <p className="font-semibold">{resultado.firma.cargo}</p>
                  <p className="text-gray-600">{resultado.firma.fecha}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Politicas;
