"use client"; // This component needs client-side interactivity

import { useState } from "react";
import { usePerplexity } from "@/app/context/PerplexityContext";
import { useRouter } from "next/navigation";
export default function IngredientFinderForm() {
  const router = useRouter();

  const { submitPerplexityPrompt, loading, error } = usePerplexity();

  const [productCategory, setProductCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [productFunction, setProductFunction] = useState("");
  const [includeClinicalStudies, setIncludeClinicalStudies] = useState(false);
  const [numIngredients, setNumIngredients] = useState(5);
  const [connectToMarketTrend, setConnectToMarketTrend] = useState(true); // Default to true for market focus

  const handleSubmit = async (e) => {
    e.preventDefault();

    let prompt = `Suggest ${numIngredients} key ingredients for a ${productType} ${productCategory} product.`;

    if (productFunction) {
      prompt += ` Its primary function should be to ${productFunction}.`;
    }

    if (includeClinicalStudies) {
      prompt += ` Please include scientific evidence or mention relevant clinical studies for each ingredient's benefits.`;
    }

    if (connectToMarketTrend) {
      prompt += `
      Additionally, focus exclusively on ingredients that are demonstrably **gaining significant popularity or showing viral potential** across key social media platforms: **TikTok, Instagram, and YouTube**.
      For each suggested ingredient, provide concrete evidence and analysis of its growth, including:
      - **Engagement Metrics/Statistics:** (e.g., number of related hashtags, video views, mentions, or growth rate of content over the past 6-12 months specifically on TikTok, Instagram, and YouTube). If exact numbers aren't available, describe the observed trend (e.g., "rapid increase in user-generated content," "frequently featured by beauty influencers," "emerging as a key topic").
      - **Trend Trajectory:** Explain *why* it's gaining popularity (e.g., efficacy, unique texture, celebrity endorsement, 'clean beauty' alignment).
      - **Future Outlook (8-month window):** Predict its sustainability and potential for continued growth, ensuring it will still be on an upward trend when a product might launch in the next 8 months. Prioritize ingredients that offer a genuine "ahead of the curve" advantage.
      `;
    }

    prompt += ` Explain the function and benefits of each suggested ingredient.`;

    try {
      await submitPerplexityPrompt(prompt, "finder");

      router.push("/reports");
    } catch (error) {
      console.error("form submission error", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white shadow-md rounded-lg"
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
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-700 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-700 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
          className="text-gray-700 mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {/* 4. Clinical Studies Checkbox */}
      <div className="flex items-center">
        <input
          id="includeClinicalStudies"
          type="checkbox"
          checked={includeClinicalStudies}
          onChange={(e) => setIncludeClinicalStudies(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="includeClinicalStudies"
          className="ml-2 block text-sm text-gray-900"
        >
          Include information from clinical studies
        </label>
      </div>

      {/* 5. Number of Ingredients */}
      <div>
        <label
          htmlFor="numIngredients"
          className="block text-sm font-medium text-gray-700"
        >
          Number of Ingredients to suggest:
        </label>
        <input
          type="number"
          id="numIngredients"
          value={numIngredients}
          onChange={(e) => setNumIngredients(parseInt(e.target.value))}
          min="1"
          max="10"
          className="text-gray-700 mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
        />
      </div>

      {/* 6. Connect to Current Market Trend/Popularity Checkbox */}
      <div className="flex items-center">
        <input
          id="connectToMarketTrend"
          type="checkbox"
          checked={connectToMarketTrend}
          onChange={(e) => setConnectToMarketTrend(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="connectToMarketTrend"
          className="ml-2 block text-sm text-gray-900"
        >
          Connect to current market trend/popularity
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Submitting..." : "Find Ingredients"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
