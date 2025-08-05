
import React from 'react';
import type { RoomDimensions } from '../types';

interface DimensionsInputProps {
  dimensions: RoomDimensions;
  onDimensionsChange: (dims: RoomDimensions) => void;
}

export const DimensionsInput: React.FC<DimensionsInputProps> = ({ dimensions, onDimensionsChange }) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDimensionsChange({ ...dimensions, [e.target.name]: e.target.value });
  };

  const handleUnitChange = (unit: 'ft' | 'm') => {
    onDimensionsChange({ ...dimensions, unit });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full">
      <h3 className="text-xl font-semibold text-slate-700 mb-4 text-center">3. Add Dimensions (Optional)</h3>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label htmlFor="width" className="block text-sm font-medium text-slate-600 mb-1">Width</label>
          <input
            type="number"
            name="width"
            id="width"
            value={dimensions.width}
            onChange={handleInputChange}
            placeholder="e.g., 12"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="length" className="block text-sm font-medium text-slate-600 mb-1">Length</label>
          <input
            type="number"
            name="length"
            id="length"
            value={dimensions.length}
            onChange={handleInputChange}
            placeholder="e.g., 15"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
        <div className="flex flex-col items-start pt-5">
           <div className="flex rounded-md border border-slate-300">
                <button
                    onClick={() => handleUnitChange('ft')}
                    className={`px-3 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 ${
                    dimensions.unit === 'ft' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    ft
                </button>
                <button
                    onClick={() => handleUnitChange('m')}
                    className={`px-3 py-2 text-sm font-medium rounded-r-md transition-colors duration-200 ${
                    dimensions.unit === 'm' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    m
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
