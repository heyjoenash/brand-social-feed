import React from 'react';

interface BrandFilterProps {
  brands: string[];
  selectedBrand: string | null;
  onChange: (brand: string | null) => void;
}

export const BrandFilter = ({ brands, selectedBrand, onChange }: BrandFilterProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 mr-4 mb-2 sm:mb-0">Filter by Brand</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search brands..."
            className="px-4 py-2 border border-gray-400 rounded-lg w-full sm:w-64 shadow-sm"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              if (searchTerm === '') {
                onChange(null); // Clear filter
              } else {
                // Find first brand that matches the search term
                const matchedBrand = brands.find(brand => 
                  brand.toLowerCase().includes(searchTerm)
                );
                if (matchedBrand) {
                  onChange(matchedBrand);
                }
              }
            }}
          />
        </div>
        {selectedBrand && (
          <button
            className="ml-2 px-3 py-1 bg-gray-300 border border-gray-400 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-400 transition-colors shadow-sm"
            onClick={() => onChange(null)}
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
            selectedBrand === null
              ? 'bg-blue-600 text-white border border-blue-700'
              : 'bg-gray-300 text-gray-800 border border-gray-400 hover:bg-gray-400'
          }`}
          onClick={() => onChange(null)}
        >
          All
        </button>
        
        {brands.map(brand => (
          <button
            key={brand}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
              selectedBrand === brand
                ? 'bg-blue-600 text-white border border-blue-700'
                : 'bg-gray-300 text-gray-800 border border-gray-400 hover:bg-gray-400'
            }`}
            onClick={() => onChange(brand)}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}; 