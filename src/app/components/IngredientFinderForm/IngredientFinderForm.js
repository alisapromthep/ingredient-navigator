"use client"; // This component needs client-side interactivity

import { useState, useCallback } from "react";
import { usePerplexity } from "@/app/context/PerplexityContext";
import { ingredientFilters } from "@/lib/ingredientFilters";

export default function IngredientFinderForm() {
  const { submitPerplexityIngredientSearch, loading, error } = usePerplexity();

  const [productCategory, setProductCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [productFunction, setProductFunction] = useState("");
  const [numIngredients, setNumIngredients] = useState(2);
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleFilterChange = useCallback((category, filter) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [category]: {
        ...prevFilters[category],
        [filter]: !prevFilters[category]?.[filter], // Toggle the boolean state
      },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      let prompt = `Suggest ${numIngredients} key ingredients for a ${productType} ${productCategory} product.`;

      if (productFunction) {
        prompt += ` Its primary function should be to ${productFunction}.`;
      }

      const activeFilters = [];
      for (const category in selectedFilters) {
        for (const filter in selectedFilters[category]) {
          if (selectedFilters[category][filter]) {
            activeFilters.push(filter);
          }
        }
      }

      // Add filters to the prompt, with a specific instruction for JSON confirmation
      if (activeFilters.length > 0) {
        prompt += `\n\nEnsure each suggested ingredient strictly adheres to the following criteria: ${activeFilters.join(
          ", "
        )}.`;
      }

      prompt += ` Explain the function and benefits of each suggested ingredient within 2-4 sentences, without going into details about each of the specific criteria`;

      try {
        await submitPerplexityIngredientSearch(prompt, "finder", activeFilters);
      } catch (error) {
        console.error("form submission error", error);
      }
    },
    [
      numIngredients,
      productType,
      productCategory,
      productFunction,
      selectedFilters,
      submitPerplexityIngredientSearch,
    ]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-indigo-100 shadow-md rounded-lg"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Ingredient Finder
      </h2>

      {/* 1. Product Categories */}
      <div>
        <label
          htmlFor="productCategory"
          className="block text-sm font-medium text-gray-700"
        >
          Product Category:
        </label>
        <select
          id="productCategory"
          value={productCategory}
          onChange={(e) => setProductCategory(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-base text-gray-700 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a category</option>
          <option value="hair">Hair</option>
          <option value="skin">Skin</option>
          <option value="scalp">Scalp</option>
          <option value="body">Body</option>
          {/* Add more categories as needed */}
        </select>
      </div>

      {/* 2. Type (water-based, waterless) */}
      <div>
        <label
          htmlFor="productType"
          className="block text-sm font-medium text-gray-700"
        >
          Product Type:
        </label>
        <select
          id="productType"
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-base text-gray-700 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select type</option>
          <option value="water-based">Water-based</option>
          <option value="waterless">Waterless</option>
          {/* Add more types as needed, e.g., oil-based, emulsion */}
        </select>
      </div>

      {/* 3. Function */}
      <div>
        <label
          htmlFor="productFunction"
          className="block text-sm font-medium text-gray-700"
        >
          Desired Function (e.g., hydrating, anti-aging, volumizing):
        </label>
        <input
          type="text"
          id="productFunction"
          value={productFunction}
          onChange={(e) => setProductFunction(e.target.value)}
          placeholder="e.g., provide deep hydration"
          className="text-gray-700 bg-white mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>
      {/* 4. Filters & specifications  */}
      {Object.entries(ingredientFilters).map(([category, filters]) => (
        <div
          key={category}
          className="mb-5 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
        >
          <h4 className="text-lg font-bold text-gray-700 mb-3">{category}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filters.map((filter) => (
              <label
                key={filter}
                className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={!!selectedFilters[category]?.[filter]} // Use !! to convert to boolean
                  onChange={() => handleFilterChange(category, filter)}
                />
                <span>{filter}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* 5. Number of Ingredients */}
      <div>
        <label
          htmlFor="numIngredients"
          className="block text-sm font-medium text-gray-700"
        >
          Number of Ingredients to suggest: (Maximum of 5)
        </label>
        <input
          type="number"
          id="numIngredients"
          value={numIngredients}
          onChange={(e) => setNumIngredients(parseInt(e.target.value))}
          min="1"
          max="5"
          className="text-gray-700 bg-white mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white p-2 rounded"
      >
        {loading ? "Submitting..." : "Find Ingredients"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
