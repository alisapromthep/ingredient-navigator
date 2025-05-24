"use client";

import React, { useState, useCallback } from "react";
import { usePerplexity } from "@/app/context/PerplexityContext";

export default function IngredientAnalysis() {
  // Remove 'ingredients' prop
  const { ingredientFound } = usePerplexity(); // Get ingredientFound from context

  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);

  const analysisOptions = [
    {
      id: "marketSearch",
      name: "Market Search, Trends, Growth, Search % Growth",
      description:
        "Consolidates crucial market data, saving users from manual research across various platforms. Social media searches for viral trends, and growing ingredient trends.",
      apiEndpoint: "/api/analysis/market", // Placeholder API endpoint
    },
    {
      id: "sustainabilityScore",
      name: "Sustainability Score",
      description:
        "Centralizes complex sustainability data into an easily digestible score. This saves immense time and effort that would otherwise be spent researching environmental impact, sourcing, etc.",
      apiEndpoint: "/api/analysis/sustainability", // Placeholder API endpoint
    },
    {
      id: "claimSubstantiation",
      name: "Claim Substantiation",
      description:
        "Providing information on how to substantiate claims (e.g., clinical studies, in-vitro tests, literature reviews) is incredibly helpful and saves legal/regulatory research time.",
      apiEndpoint: "/api/analysis/claims", // Placeholder API endpoint
    },
    {
      id: "marketActionOpportunities",
      name: "Market Action and Opportunities Summaries",
      description: "This goes beyond raw data, providing actionable insights.",
      apiEndpoint: "/api/analysis/opportunities", // Placeholder API endpoint
    },
  ];

  const handleIngredientSelect = useCallback((ingredientName) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredientName)
        ? prev.filter((name) => name !== ingredientName)
        : [...prev, ingredientName]
    );
  }, []);

  const handleSelectAllIngredients = useCallback(() => {
    // Safely check ingredientFound before mapping
    const allIngredientNames = ingredientFound
      ? ingredientFound.map((ing) => ing.name)
      : [];
    if (selectedIngredients.length === allIngredientNames.length) {
      setSelectedIngredients([]); // Deselect all
    } else {
      setSelectedIngredients(allIngredientNames); // Select all
    }
  }, [ingredientFound, selectedIngredients.length]); // Add ingredientFound to dependency array

  const handleAnalysisSelect = useCallback((analysisId) => {
    setSelectedAnalyses((prev) =>
      prev.includes(analysisId)
        ? prev.filter((id) => id !== analysisId)
        : [...prev, analysisId]
    );
  }, []);

  const handleSelectAllAnalyses = useCallback(() => {
    if (selectedAnalyses.length === analysisOptions.length) {
      setSelectedAnalyses([]); // Deselect all
    } else {
      setSelectedAnalyses(analysisOptions.map((opt) => opt.id)); // Select all
    }
  }, [analysisOptions, selectedAnalyses.length]);

  const handleGetAnalysis = useCallback(() => {
    if (selectedIngredients.length === 0 || selectedAnalyses.length === 0) {
      alert("Please select at least one ingredient and one analysis option.");
      return;
    }
    console.log("Selected Ingredients for Analysis:", selectedIngredients);
    console.log("Selected Analyses to Perform:", selectedAnalyses);

    selectedAnalyses.forEach((analysisId) => {
      const option = analysisOptions.find((opt) => opt.id === analysisId);
      if (option) {
        console.log(
          `Making API call to: ${option.apiEndpoint} for ingredients:`,
          selectedIngredients
        );
      }
    });
  }, [selectedIngredients, selectedAnalyses, analysisOptions]);

  // Handle case where ingredientFound might not be an array or is null/undefined
  const ingredientsToDisplay = Array.isArray(ingredientFound)
    ? ingredientFound
    : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold text-indigo-950 mb-6 border-b pb-3">
        Advanced Ingredient Analysis
      </h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-950 mb-3">
          Select Ingredients for Analysis:
        </h3>
        {ingredientsToDisplay.length > 0 ? (
          <>
            <button
              onClick={handleSelectAllIngredients}
              className="mb-3 px-4 py-2 bg-indigo-50 text-indigo-950 rounded-md hover:bg-indigo-100 transition duration-150 ease-in-out text-sm"
            >
              {selectedIngredients.length === ingredientsToDisplay.length
                ? "Deselect All"
                : "Select All Ingredients"}
            </button>
            <div className="space-y-2">
              {ingredientsToDisplay.map((ingredient) => (
                <label
                  key={ingredient.name}
                  className="flex items-center text-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 rounded mr-2"
                    checked={selectedIngredients.includes(ingredient.name)}
                    onChange={() => handleIngredientSelect(ingredient.name)}
                  />
                  <span>{ingredient.name}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-600">
            No ingredients found from the previous search to select for
            analysis.
          </p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-950 mb-3">
          Choose Analysis Options:
        </h3>
        <button
          onClick={handleSelectAllAnalyses}
          className="mb-3 px-4 py-2 bg-indigo-50 text-indigo-950 rounded-md hover:bg-indigo-100 transition duration-150 ease-in-out text-sm"
        >
          {selectedAnalyses.length === analysisOptions.length
            ? "Deselect All"
            : "Select All Analyses"}
        </button>
        <div className="space-y-4">
          {analysisOptions.map((option) => (
            <label key={option.id} className="block cursor-pointer">
              <div className="flex items-center mb-1">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded mr-2"
                  checked={selectedAnalyses.includes(option.id)}
                  onChange={() => handleAnalysisSelect(option.id)}
                />
                <span className="font-medium text-gray-800">{option.name}</span>
              </div>
              <p className="text-gray-600 text-sm ml-6">{option.description}</p>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleGetAnalysis}
        disabled={
          selectedIngredients.length === 0 || selectedAnalyses.length === 0
        }
        className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Get Advanced Analysis
      </button>
    </div>
  );
}
