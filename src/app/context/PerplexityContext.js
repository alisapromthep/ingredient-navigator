"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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
  const [aiResponse, setAiResponse] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  const submitPerplexityPrompt = useCallback(
    async (prompt, searchType = "finder") => {
      setLoading(true);
      setError(null);
      setAiResponse("");
      setSubmittedPrompt(prompt);
      console.log("prompt", prompt);
      try {
        const response = await fetch("/api/ingredientintel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const errorData = await response.json(); // Still need to read error JSON
          throw new Error(errorData.error || "Failed to get response from AI");
        }

        const data = await response.json();

        console.log("Parsed API Response Data:", data); // Now you'll see your ingredients!

        // Update context state with the parsed data
        setAiResponse(data.ingredients);

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
    },
    []
  );

  const value = {
    loading,
    error,
    aiResponse,
    submittedPrompt,
    searchHistory,
    submitPerplexityPrompt,
  };

  return (
    <PerplexityContext.Provider value={value}>
      {children}
    </PerplexityContext.Provider>
  );
}
