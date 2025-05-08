import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';

// Define a more specific type for form data
type FormData = Record<string, string | number | boolean>;

interface ToolGeneratorProps<TResult> { // Added generic type TResult
  title: string;
  description: string;
  formFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    required: boolean;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
  }>;
  generateFunction: (formData: FormData) => Promise<TResult>; // Use FormData and TResult
  suggestionFunctions?: Record<string, (formData: FormData) => Promise<string>>; // Use FormData
  resultTemplate: (result: TResult) => React.ReactNode; // Use TResult
}

const ToolGenerator = <TResult,>({ // Apply generic type TResult
  title,
  description,
  formFields,
  generateFunction,
  suggestionFunctions = {},
  resultTemplate
}: ToolGeneratorProps<TResult>): React.ReactElement => { // Add explicit prop types and return type
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({}); // Use FormData type
  const [result, setResult] = useState<TResult | null>(null); // Use TResult type

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const generatedResult = await generateFunction(formData);
      setResult(generatedResult);
    } catch (error) {
      console.error('Error generating result:', error);
      setError(error instanceof Error ? error.message : 'Error generating result');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestion = async (fieldName: string) => {
    // Check if the function exists for the fieldName
    if (suggestionFunctions && suggestionFunctions[fieldName]) {
      setLoadingSuggestions(true);
      setError(null);
      try {
        // Call the function safely
        const suggestion = await suggestionFunctions[fieldName](formData);
        setFormData(prev => ({
          ...prev,
          [fieldName]: suggestion
        }));
      } catch (error) {
        console.error('Error getting suggestion:', error);
        setError(error instanceof Error ? error.message : 'Error getting suggestion');
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      console.warn(`No suggestion function found for field: ${fieldName}`);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    // Implementación genérica de PDF basada en la estructura del resultado
    doc.text(JSON.stringify(result, null, 2), 10, 10);
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadWord = async () => {
    if (!result) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: 'center',
          }),
          new Paragraph({ text: JSON.stringify(result, null, 2) })
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.map((field: ToolGeneratorProps<TResult>['formFields'][number]) => ( // Explicitly type 'field'
                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={String(formData[field.name] ?? '')} // Convert to string
                      onChange={handleInputChange}
                      required={field.required}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Seleccionar...</option>
                      {field.options?.map((option: { value: string; label: string }) => ( // Explicitly type 'option'
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <div className="relative">
                      <textarea
                        name={field.name}
                        value={String(formData[field.name] ?? '')} // Convert to string
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full px-3 py-2 border rounded-md pr-12"
                        rows={3}
                        placeholder={field.placeholder}
                      />
                      {suggestionFunctions[field.name] && (
                        <button
                          type="button"
                          onClick={() => handleGetSuggestion(field.name)}
                          disabled={loadingSuggestions}
                          className="absolute right-2 top-2 p-2 bg-blue-50 rounded-md text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 z-10"
                          title="Obtener sugerencias"
                        >
                          {loadingSuggestions ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                          ) : (
                            <span>✨</span>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={String(formData[field.name] ?? '')} // Convert to string
                      onChange={handleInputChange}
                      required={field.required}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
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
                {loading ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Resultado
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  title="Descargar PDF"
                >
                  PDF
                </button>
                <button
                  onClick={handleDownloadWord}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  title="Descargar Word"
                >
                  Word
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              {resultTemplate(result)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolGenerator;
