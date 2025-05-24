"use client";

import React from "react";
import IngredientFinderForm from "../components/IngredientFinderForm/IngredientFinderForm";
import { usePerplexity } from "../context/PerplexityContext";

function IngredientFinder() {
  const {
    ingredientFound,
    setIngredientFound,
    activeFiltersInfo,
    setActiveFiltersInfo,
    loading,
    error,
  } = usePerplexity();

  const hasIngredientBeenFound =
    ingredientFound && Object.keys(ingredientFound).length > 0;

  const handleClearIngredients = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ingredientFound");
    }

    setIngredientFound([]);
  };

  const nextStepsData = [
    {
      title: "Market Search, Trends, Growth, Search % Growth",
      description:
        "Consolidates crucial market data, saving users from manual research across various platforms.",
    },
    {
      title: "Sustainability Score",
      description:
        "Centralizes complex sustainability data into an easily digestible score. This saves immense time and effort that would otherwise be spent researching environmental impact, sourcing, etc.",
    },
    {
      title: "Claim Substantiation",
      description:
        "Providing information on how to substantiate claims (e.g., clinical studies, in-vitro tests, literature reviews) is incredibly helpful and saves legal/regulatory research time.",
    },
    {
      title: "Market Action and Opportunities Summaries",
      description: "This goes beyond raw data, providing actionable insights.",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 p-4">
      <div className="lg:w-2/3 lg:pr-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-950">
            Ingredient Finder
          </h1>
          <button
            className="bg-red-50 text-indigo-950 p-2 rounded-lg shadow-sm hover:bg-red-100 transition duration-150 ease-in-out border border-red-200"
            onClick={handleClearIngredients}
          >
            Clear Ingredient Search
          </button>
        </div>

        {loading && (
          <p className="text-center text-indigo-700 text-lg mt-4">
            Loading ingredient data...
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 text-lg mt-4 font-medium">
            Error: {error}
          </p>
        )}

        {hasIngredientBeenFound ? (
          <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-950 mb-6 border-b pb-3">
              Ingredient Search Results
            </h2>
            <section className="space-y-6">
              {ingredientFound.map((ingredient, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-700 text-indigo-950"
                >
                  <h3 className="text-xl font-bold mb-2">{ingredient.name}</h3>
                  <p className="text-gray-700 text-base">
                    {ingredient.function}
                  </p>
                </div>
              ))}
              {activeFiltersInfo.map((filter, i) => {
                const statusColorClass =
                  filter.status === true
                    ? "text-green-600"
                    : filter.status === false
                    ? "text-red-600"
                    : "text-yellow-600";
                const statusSymbol =
                  filter.status === true
                    ? "✔️"
                    : filter.status === false
                    ? "❌"
                    : "⚠️";

                return (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-700 text-indigo-950"
                  >
                    <div className="flex items-center mb-2">
                      <span className={`text-2xl mr-2 ${statusColorClass}`}>
                        {statusSymbol}
                      </span>
                      <h3 className="text-lg font-bold">{filter.name}</h3>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed">
                      {filter.explanation}
                    </p>
                  </div>
                );
              })}
            </section>
          </div>
        ) : (
          <IngredientFinderForm />
        )}
      </div>
    </div>
  );
}
export default IngredientFinder;
