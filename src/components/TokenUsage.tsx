import { useTokens } from '../hooks/useTokens';

export default function TokenUsage() {
  const { tokens, loading, error } = useTokens();

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (tokens === null) {
    return null;
  }

  // Assuming a total limit for display purposes. This should be dynamic.
  const tokenLimit = 50000; 
  const usagePercentage = ((tokens / tokenLimit) * 100).toFixed(1);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Uso de Tokens
      </h3>
      
      <div className="space-y-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-safeia-yellow">
                {usagePercentage}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-safeia-yellow/10">
            <div
              style={{ width: `${usagePercentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-safeia-yellow"
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tokens Disponibles</p>
            <p className="font-semibold text-gray-900">{tokens}</p>
          </div>
          <div>
            <p className="text-gray-500">Límite Total</p>
            <p className="font-semibold text-gray-900">{tokenLimit}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
