"use client";

import React from "react";
import IngredientFinderForm from "../components/IngredientFinderForm/IngredientFinderForm";
import { usePerplexity } from "../context/PerplexityContext";

function IngredientFinder() {
  const { ingredientFound, setIngredientFound, loading, error } =
    usePerplexity();

  const hasIngredientBeenFound =
    ingredientFound && Object.keys(ingredientFound).length > 0;

  const handleClearIngredients = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ingredientFound");
    }

    setIngredientFound([]);
  };

  return (
    <div>
      <div>
        <button
          className="bg-yellow-50 text-indigo-950 p-2 rounded"
          onClick={handleClearIngredients}
        >
          Clear ingredient search
        </button>
      </div>
      <h1>Ingredient Finder</h1>
      {loading && <p>Loading ingredient data...</p>}
      {error && <p className="error">Error: {error}</p>}

      {hasIngredientBeenFound ? (
        <div>
          <h2>Ingredient Found!</h2>
          <div>
            {ingredientFound.map((ingredient, i) => {
              return (
                <div>
                  <p>{ingredient.name}</p>
                  <p>{ingredient.function}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <IngredientFinderForm />
      )}
    </div>
  );
}

export default IngredientFinder;
