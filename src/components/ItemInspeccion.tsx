import React from 'react';
import { Check, X } from 'lucide-react';

interface ItemInspeccionProps {
  categoria: string;
  items: {
    item: string;
    cumple: boolean;
    observaciones: string;
  }[];
  onUpdateItem: (categoriaIndex: number, itemIndex: number, cumple: boolean, observaciones: string) => void;
  categoriaIndex: number;
}

export default function ItemInspeccion({ 
  categoria, 
  items, 
  onUpdateItem,
  categoriaIndex 
}: ItemInspeccionProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{categoria}</h3>
      <div className="space-y-4">
        {items.map((item, itemIndex) => (
          <div key={itemIndex} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.item}</p>
                <textarea
                  value={item.observaciones}
                  onChange={(e) => onUpdateItem(categoriaIndex, itemIndex, item.cumple, e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Observaciones..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateItem(categoriaIndex, itemIndex, true, item.observaciones)}
                  className={`p-2 rounded-full ${
                    item.cumple
                      ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                  }`}
                  title="Cumple"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onUpdateItem(categoriaIndex, itemIndex, false, item.observaciones)}
                  className={`p-2 rounded-full ${
                    !item.cumple
                      ? 'bg-red-100 text-red-800 ring-2 ring-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                  }`}
                  title="No Cumple"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
