import React from 'react';

interface TokenUsageDisplayProps {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export default function TokenUsageDisplay({ inputTokens, outputTokens, totalCost }: TokenUsageDisplayProps) {
  return (
    <div className="bg-gray-100 p-3 rounded-md text-sm mt-2">
      <div className="font-semibold mb-1">Uso de Tokens:</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-gray-600">Entrada:</span> {inputTokens} tokens
        </div>
        <div>
          <span className="text-gray-600">Salida:</span> {outputTokens} tokens
        </div>
        <div className="col-span-2">
          <span className="text-gray-600">Total:</span> {totalCost} tokens
        </div>
      </div>
    </div>
  );
}
