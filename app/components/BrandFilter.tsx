import React from 'react';
import { parentBrands, getSubBrands } from '../../src/config/brandConfig';

interface BrandFilterProps {
  selectedBrand: string | null;
  onChange: (brand: string | null) => void;
}

export const BrandFilter = ({ selectedBrand, onChange }: BrandFilterProps) => {
  // Get all parent brands
  const brands = parentBrands;
  
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
                const matchedBrand = brands.find((brand: string) => 
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
        
        {/* Parent Brand Buttons */}
        {brands.map((brand: string) => {
          const subBrands = getSubBrands(brand);
          const isParentSelected = selectedBrand === brand;
          const isSubBrandSelected = subBrands.includes(selectedBrand || '');
          
          return (
            <div key={brand} className="inline-flex gap-1">
              {/* Parent Brand Button */}
              <button
                className={`px-4 py-2 rounded-l-full text-sm font-medium shadow-sm ${
                  isParentSelected
                    ? 'bg-blue-600 text-white border border-blue-700'
                    : isSubBrandSelected
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-300 text-gray-800 border border-gray-400 hover:bg-gray-400'
                }`}
                onClick={() => onChange(brand)}
              >
                {brand}
              </button>
              
              {/* Sub-brand Dropdown */}
              {subBrands.length > 0 && (
                <div className="relative inline-block">
                  <button
                    className={`px-3 py-2 rounded-r-full text-sm font-medium shadow-sm border-l-0 ${
                      isParentSelected || isSubBrandSelected
                        ? 'bg-blue-500 text-white border border-blue-700'
                        : 'bg-gray-300 text-gray-800 border border-gray-400 hover:bg-gray-400'
                    }`}
                    onClick={(e) => {
                      const target = e.currentTarget as HTMLButtonElement;
                      target.nextElementSibling?.classList.toggle('hidden');
                    }}
                  >
                    ▼
                  </button>
                  <div className="hidden absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu">
                      {subBrands.map((subBrand: string) => (
                        <button
                          key={subBrand}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            selectedBrand === subBrand
                              ? 'bg-blue-100 text-blue-900'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={(e) => {
                            onChange(subBrand);
                            // Hide dropdown
                            const target = e.currentTarget as HTMLButtonElement;
                            target.closest('.relative')?.querySelector('.hidden')?.classList.add('hidden');
                          }}
                        >
                          {subBrand}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 