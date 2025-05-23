"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

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
  const [actionableSummary, setActionableSummary] = useState(null); // Keep separate for easier access

  // --- useEffect to load data from localStorage on mount ---
  useEffect(() => {
    try {
      const storedPrompt = localStorage.getItem("submittedPrompt");
      const storedAiResponse = localStorage.getItem("aiResponse");
      const storedActionableSummary = localStorage.getItem("actionableSummary");

      if (storedPrompt) {
        setSubmittedPrompt(JSON.parse(storedPrompt));
      }
      if (storedAiResponse) {
        setAiResponse(JSON.parse(storedAiResponse));
      }
      if (storedActionableSummary) {
        setActionableSummary(JSON.parse(storedActionableSummary));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage:", e);
      // Clear localStorage if it's corrupted
      localStorage.clear();
    }
  }, []); // Empty dependency array means this runs once on mount

  // --- useEffect to save data to localStorage whenever it changes ---
  useEffect(() => {
    if (submittedPrompt) {
      // Only save if there's actual data
      localStorage.setItem("submittedPrompt", JSON.stringify(submittedPrompt));
    }
    if (aiResponse) {
      localStorage.setItem("aiResponse", JSON.stringify(aiResponse));
    }
    if (actionableSummary) {
      localStorage.setItem(
        "actionableSummary",
        JSON.stringify(actionableSummary)
      );
    }
  }, [submittedPrompt, aiResponse, actionableSummary]);

  const submitPerplexityPrompt = useCallback(
    async (prompt, searchType = "finder") => {
      setLoading(true);
      setError(null);
      setAiResponse("");
      setSubmittedPrompt(prompt);
      //console.log("prompt", prompt);
      if (searchType === "finder") {
        try {
          const response = await fetch("/api/ingredientfinder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          });

          if (!response.ok) {
            const errorData = await response.json(); // Still need to read error JSON
            throw new Error(
              errorData.error || "Failed to get response from AI"
            );
          }

          const data = await response.json();

          console.log("Parsed API Response Data:", data);

          // Update context state with the parsed data
          setAiResponse(data);

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
