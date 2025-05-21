"use client"; // This component needs client-side interactivity

import { useState } from "react";

export default function IngredientDeepSearchForm({ onSubmitPrompt }) {
  const [ingredientName, setIngredientName] = useState("");
  const [extraDetails, setExtraDetails] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let prompt = `Provide a comprehensive deep search analysis for the cosmetic ingredient "${ingredientName}".`;

    if (extraDetails) {
      prompt += ` Specifically address: ${extraDetails}.`;
    } else {
      prompt += ` Include its primary functions, benefits, typical usage concentrations, potential side effects, regulatory status (e.g., FDA, EU), and if available, key suppliers or trending applications.`;
    }

    onSubmitPrompt(prompt); // Pass the constructed prompt to the parent component
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white shadow-md rounded-lg"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Ingredient Deep Search
      </h2>

      {/* 1. Input Ingredient Name */}
      <div>
        <label
          htmlFor="ingredientName"
          className="block text-sm font-medium text-gray-700"
        >
          Ingredient Name:
        </label>
        <input
          type="text"
          id="ingredientName"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          required
          placeholder="e.g., Hyaluronic Acid, Niacinamide"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {/* Extra Information for Best Prompt */}
      <div>
        <label
          htmlFor="extraDetails"
          className="block text-sm font-medium text-gray-700"
        >
          Extra Information/Specific Areas of Focus (Optional):
        </label>
        <textarea
          id="extraDetails"
          value={extraDetails}
          onChange={(e) => setExtraDetails(e.target.value)}
          rows="3"
          placeholder="e.g., 'its stability in emulsions and typical pH range', 'its interaction with Vitamin C', 'its sustainability aspects'"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">
          Provide specific details you want to know about the ingredient for a
          more targeted search.
        </p>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Deep Search
      </button>
    </form>
  );
}
