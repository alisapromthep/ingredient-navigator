"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { transformAppliedFiltersToArray } from "@/utils/dataTransformer";

const PerplexityContext = createContext(undefined);

export function usePerplexity() {
  const context = useContext(PerplexityContext);
  if (context === undefined) {
    throw new Error("usePerplexity must be used within a PerplexityProvider");
  }
  return context;
}

export function PerplexityProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [ingredientFound, setIngredientFound] = useState([]);
  const [activeFiltersInfo, setActiveFiltersInfo] = useState([]);

  const [actionableSummary, setActionableSummary] = useState(null);
  const [marketTrend, setMarketTrend] = useState(null);
  const [sustainabilityScore, setSustainabilityScore] = useState(null);
  const [claimSubstantiation, setClaimSubstantiation] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedPrompt = localStorage.getItem("submittedPrompt");
        const storedSearchHistory = localStorage.getItem("searchHistory");
        const storedActionableSummary =
          localStorage.getItem("actionableSummary");
        const storedIngredientFound = localStorage.getItem("ingredientFound");
        const storedActiveFiltersInfo =
          localStorage.getItem("activeFiltersInfo");
        const storedMarketTrend = localStorage.getItem("marketTrend");
        const storedSustainabilityScore = localStorage.getItem(
          "sustainabilityScore"
        );
        const storedClaimSubstantiation = localStorage.getItem(
          "claimSubstantiation"
        );

        if (storedPrompt) setSubmittedPrompt(JSON.parse(storedPrompt));
        if (storedSearchHistory)
          setSearchHistory(JSON.parse(storedSearchHistory));
        if (storedActionableSummary)
          setActionableSummary(JSON.parse(storedActionableSummary));
        if (storedIngredientFound)
          setIngredientFound(JSON.parse(storedIngredientFound));
        if (storedActiveFiltersInfo)
          setActiveFiltersInfo(JSON.parse(storedActiveFiltersInfo));
        if (storedMarketTrend) setMarketTrend(JSON.parse(storedMarketTrend));
        if (storedSustainabilityScore)
          setSustainabilityScore(JSON.parse(storedSustainabilityScore));
        if (storedClaimSubstantiation)
          setClaimSubstantiation(JSON.parse(storedClaimSubstantiation));
      } catch (e) {
        console.error("Failed to load data from localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (submittedPrompt) {
          localStorage.setItem(
            "submittedPrompt",
            JSON.stringify(submittedPrompt)
          );
        } else {
          localStorage.removeItem("submittedPrompt");
        }

        if (searchHistory && searchHistory.length > 0) {
          localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        } else {
          localStorage.removeItem("searchHistory");
        }

        if (actionableSummary) {
          localStorage.setItem(
            "actionableSummary",
            JSON.stringify(actionableSummary)
          );
        } else {
          localStorage.removeItem("actionableSummary");
        }

        if (ingredientFound && ingredientFound.length > 0) {
          localStorage.setItem(
            "ingredientFound",
            JSON.stringify(ingredientFound)
          );
        } else {
          localStorage.removeItem("ingredientFound");
        }

        if (activeFiltersInfo && activeFiltersInfo.length > 0) {
          localStorage.setItem(
            "activeFiltersInfo",
            JSON.stringify(activeFiltersInfo)
          );
        } else {
          localStorage.removeItem("activeFiltersInfo");
        }
        if (marketTrend) {
          localStorage.setItem("marketTrend", JSON.stringify(marketTrend));
        } else {
          localStorage.removeItem("marketTrend");
        }

        if (sustainabilityScore) {
          localStorage.setItem(
            "sustainabilityScore",
            JSON.stringify(sustainabilityScore)
          );
        } else {
          localStorage.removeItem("sustainabilityScore");
        }

        if (claimSubstantiation) {
          localStorage.setItem(
            "claimSubstantiation",
            JSON.stringify(claimSubstantiation)
          );
        } else {
          localStorage.removeItem("claimSubstantiation");
        }
      } catch (e) {
        console.error("Failed to save data to localStorage:", e);
      }
    }
  }, [
    submittedPrompt,
    searchHistory,
    actionableSummary,
    ingredientFound,
    activeFiltersInfo,
    marketTrend,
    sustainabilityScore,
    claimSubstantiation,
  ]);

  const submitPerplexityIngredientSearch = useCallback(
    async (prompt, searchType = "finder", activeFilters) => {
      setLoading(true);
      setError(null);
      setIngredientFound("");
      setSubmittedPrompt(prompt);
      //console.log("prompt", prompt);
      if (searchType === "finder") {
        try {
          const response = await fetch("/api/sonar/ingredientfinder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, activeFilters: activeFilters }),
          });

          if (!response.ok) {
            const errorData = await response.json(); // Still need to read error JSON
            throw new Error(
              errorData.error || "Failed to get response from AI"
            );
          }

          const data = await response.json();

          console.log(
            "Parsed API Response Data:",
            data,
            "ingredientsData",
            data.ingredientsData
          );

          // Update context state with the parsed data
          setIngredientFound(data.ingredientsData);
          const filtersArray = transformAppliedFiltersToArray(
            data.appliedFilters
          );
          setActiveFiltersInfo(filtersArray);

          setSearchHistory((prevHistory) => [
            {
              id: Date.now(),
              prompt: prompt,
              response: data.result,
              timestamp: new Date().toISOString(),
              type: searchType,
            },
            ...prevHistory,
          ]);
        } catch (err) {
          console.error("Perplexity API error:", err);
          setError(err.message || "An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      }
    },
    []
  );

  const value = {
    loading,
    error,
    ingredientFound,
    setIngredientFound,
    submittedPrompt,
    searchHistory,
    submitPerplexityIngredientSearch,
    activeFiltersInfo,
    setActiveFiltersInfo,
    actionableSummary,
    setActionableSummary,
    marketTrend,
    setMarketTrend,
    sustainabilityScore,
    setSustainabilityScore,
    claimSubstantiation,
    setClaimSubstantiation,
  };

  return (
    <PerplexityContext.Provider value={value}>
      {children}
    </PerplexityContext.Provider>
  );
}
