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
  const [actionableSummary, setActionableSummary] = useState(null); // Keep separate for easier access
  const [ingredientFound, setIngredientFound] = useState([]);
  const [activeFiltersInfo, setActiveFiltersInfo] = useState([]);

  // --- useEffect to load data from localStorage on mount ---
  useEffect(() => {
    try {
      const storedPrompt = localStorage.getItem("submittedPrompt");
      const storedIngredientFound = localStorage.getItem("ingredientFound");
      const storedActionableSummary = localStorage.getItem("actionableSummary");
      const storedActiveFiltersInfo = localStorage.getItem("activeFiltersInfo");

      if (storedPrompt) {
        setSubmittedPrompt(JSON.parse(storedPrompt));
      }
      if (storedIngredientFound) {
        setIngredientFound(JSON.parse(storedIngredientFound));
      }
      if (storedActiveFiltersInfo) {
        setActiveFiltersInfo(JSON.parse(storedActiveFiltersInfo));
      }
      if (storedActionableSummary) {
        setActionableSummary(JSON.parse(storedActionableSummary));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage:", e);
      localStorage.clear();
    }
  }, []);

  // --- useEffect to save data to localStorage whenever it changes ---
  useEffect(() => {
    if (submittedPrompt) {
      localStorage.setItem("submittedPrompt", JSON.stringify(submittedPrompt));
    }
    if (ingredientFound) {
      localStorage.setItem("ingredientFound", JSON.stringify(ingredientFound));
    }
    if (activeFiltersInfo) {
      localStorage.setItem(
        "activeFiltersInfo",
        JSON.stringify(activeFiltersInfo)
      );
    }
    if (actionableSummary) {
      localStorage.setItem(
        "actionableSummary",
        JSON.stringify(actionableSummary)
      );
    }
  }, [submittedPrompt, ingredientFound, actionableSummary]);

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
  };

  return (
    <PerplexityContext.Provider value={value}>
      {children}
    </PerplexityContext.Provider>
  );
}
