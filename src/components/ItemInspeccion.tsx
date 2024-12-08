import React from 'react';

interface ItemInspeccionProps {
  categoria: string;
  items: {
    descripcion: string;
    estado: string;
    observaciones: string;
  }[];
  onUpdateItem: (categoriaIndex: number, itemIndex: number, estado: string, observaciones: string) => void;
  categoriaIndex: number;
}

const ItemInspeccion = ({ categoria, items, onUpdateItem, categoriaIndex }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4 text-safeia-black">{categoria}</h3>
      <div className="space-y-4">
        {items.map((item, itemIndex) => (
          <div key={itemIndex} className="border-b pb-4">
            <p className="font-medium mb-2 text-safeia-black">{item.descripcion}</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`cumple-${categoriaIndex}-${itemIndex}`}
                  name={`estado-${categoriaIndex}-${itemIndex}`}
                  value="cumple"
                  checked={item.estado === 'cumple'}
                  onChange={(e) => onUpdateItem(categoriaIndex, itemIndex, e.target.value, item.observaciones)}
                  className="text-safeia-yellow focus:ring-safeia-yellow"
                />
                <label htmlFor={`cumple-${categoriaIndex}-${itemIndex}`} className="text-safeia-black">
                  Cumple
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`no-cumple-${categoriaIndex}-${itemIndex}`}
                  name={`estado-${categoriaIndex}-${itemIndex}`}
                  value="no-cumple"
                  checked={item.estado === 'no-cumple'}
                  onChange={(e) => onUpdateItem(categoriaIndex, itemIndex, e.target.value, item.observaciones)}
                  className="text-safeia-yellow focus:ring-safeia-yellow"
                />
                <label htmlFor={`no-cumple-${categoriaIndex}-${itemIndex}`} className="text-safeia-black">
                  No Cumple
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`na-${categoriaIndex}-${itemIndex}`}
                  name={`estado-${categoriaIndex}-${itemIndex}`}
                  value="na"
                  checked={item.estado === 'na'}
                  onChange={(e) => onUpdateItem(categoriaIndex, itemIndex, e.target.value, item.observaciones)}
                  className="text-safeia-yellow focus:ring-safeia-yellow"
                />
                <label htmlFor={`na-${categoriaIndex}-${itemIndex}`} className="text-safeia-black">
                  No Aplica
                </label>
              </div>
            </div>
            <div className="mt-2">
              <input
                type="text"
                value={item.observaciones || ''}
                onChange={(e) => onUpdateItem(categoriaIndex, itemIndex, item.estado, e.target.value)}
                placeholder="Observaciones..."
                className="w-full px-3 py-2 border-safeia-yellow rounded-md focus:ring-safeia-yellow text-safeia-black"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemInspeccion;
