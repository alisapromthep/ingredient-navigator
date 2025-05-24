"use client";

import { useState, useEffect } from "react";
import { usePerplexity } from "@/app/context/PerplexityContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPdf from "../components/ReportPdf/ReportPdf";
import { themeColors } from "../../lib/themeColors"; // Adjust path as needed

export default function ReportsPage() {
  const {
    submittedPrompt,
    ingredientFound,
    actionableSummary,
    loading,
    error,
  } = usePerplexity();

  // State for PDF section selection
  const [selectedPdfSections, setSelectedPdfSections] = useState({
    query: true,
    ingredients: true,
    summary: true,
    rawResponse: false,
  });

  // State for theme selection, loaded from localStorage
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("reportTheme") || "lightblue";
    }
    return "lightblue";
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("reportTheme", currentTheme);
    }
  }, [currentTheme]);

  // Derive active colors from the selected theme
  const activeColors = themeColors[currentTheme] || themeColors.lightblue;

  const reportData = {
    submittedPrompt,
    ingredients: ingredientFound?.ingredients,
    actionableSummary,
    rawingredientFound: ingredientFound?.rawResponse,
  };

  //console.log("reportData", reportData);

  const pdfReportData = {
    submittedPrompt: reportData.submittedPrompt || "",
    ingredients: Array.isArray(reportData.ingredients)
      ? reportData.ingredients
      : [],
    actionableSummary: reportData.actionableSummary || {},
    rawingredientFound: reportData.rawingredientFound || "",
  };
  //console.log(pdfReportData);
  const hasReportData =
    submittedPrompt ||
    ingredientFound?.ingredients?.length > 0 ||
    actionableSummary;

  const handleSectionToggle = (sectionName) => {
    setSelectedPdfSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Function to handle theme checkbox change
  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName); // Set the selected theme
  };

  if (loading) {
    return (
      <div className="text-center p-8 text-indigo-600 font-semibold">
        Loading your report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-8 font-semibold">
        Error: {error}
      </div>
    );
  }

  if (!hasReportData) {
    return (
      <div className="text-center p-8 text-gray-600">
        No report generated yet. Please submit a query from the form.
      </div>
    );
  }

  const pdfSections = Object.keys(selectedPdfSections).filter(
    (key) => selectedPdfSections[key]
  );

  console.log("pdfSections", pdfSections);

  return (
    <div className="container mx-auto p-6 max-w-5xl font-sans text-indigo-950">
      <h1 className="text-4xl font-extrabold mb-8 text-center uppercase text-indigo-50">
        Ingredient Intelligence Report
      </h1>

      <div className="grid grid-cols-3">
        {/* PDF Options and Download Button - Styled as a distinct card */}
        <div className="col-span-2 mb-10 p-8 rounded-xl shadow-lg border-l-4 border-indigo-700 bg-white">
          <h2 className="text-2xl font-bold mb-4 text-indigo-950">
            Generate PDF Report:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <label className="flex items-center space-x-3 text-lg">
              <input
                type="checkbox"
                checked={selectedPdfSections.query}
                onChange={() => handleSectionToggle("query")}
                className="form-checkbox h-6 w-6 rounded-md accent-indigo-700"
              />
              <span className="text-indigo-950">Include Query Details</span>
            </label>
            <label className="flex items-center space-x-3 text-lg">
              <input
                type="checkbox"
                checked={selectedPdfSections.ingredients}
                onChange={() => handleSectionToggle("ingredients")}
                className="form-checkbox h-6 w-6 rounded-md accent-indigo-700"
              />
              <span className="text-indigo-950">
                Include Ingredient Deep Dive
              </span>
            </label>
            <label className="flex items-center space-x-3 text-lg">
              <input
                type="checkbox"
                checked={selectedPdfSections.summary}
                onChange={() => handleSectionToggle("summary")}
                className="form-checkbox h-6 w-6 rounded-md accent-indigo-700"
              />
              <span className="text-indigo-950">
                Include Strategic Action Plan
              </span>
            </label>
            <label className="flex items-center space-x-3 text-lg">
              <input
                type="checkbox"
                checked={selectedPdfSections.rawResponse}
                onChange={() => handleSectionToggle("rawResponse")}
                className="form-checkbox h-6 w-6 rounded-md"
                style={{ accentColor: activeColors.primary }}
              />
              <span className="text-indigo-950">Include Raw AI Output</span>
            </label>
          </div>

          {hasReportData && pdfSections.length > 0 ? (
            <PDFDownloadLink
              document={
                <ReportPdf
                  reportData={reportData}
                  selectedSections={pdfSections}
                  currentTheme={currentTheme}
                />
              }
              fileName="ingredient_report.pdf"
            >
              {({ blob, url, loading, error }) => (
                <button
                  className="text-indigo-950 bg-indigo-100 w-full md:w-auto font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md text-lg"
                  disabled={loading}
                >
                  {loading
                    ? "Generating PDF..."
                    : "Download Comprehensive Report"}
                </button>
              )}
            </PDFDownloadLink>
          ) : (
            <p className="text-gray-600 text-center py-4">
              Select content to enable PDF download.
            </p>
          )}
        </div>
        {/* Theme Selector */}
        <div className="mb-10 p-6 rounded-xl shadow-lg border-l-4 border-indigo-700 bg-white">
          <h2 className="text-xl font-bold mb-4 text-indigo-700">
            Choose Report Theme:
          </h2>
          <div className="grid grid-cols-2 gap-1">
            {Object.keys(themeColors).map((themeName) => (
              <label
                key={themeName}
                className={`text-indigo-700 h-8 flex items-center p-1 rounded-md cursor-pointer transition-all duration-200 ease-in-out
              `}
              >
                <input
                  type="checkbox"
                  checked={currentTheme === themeName}
                  onChange={() => handleThemeChange(themeName)}
                  className="h-4 w-4 rounded-sm mr-2 accent-indigo-700"
                />
                <div
                  className="w-4 h-4 rounded-sm mr-2" // Smaller color square
                  style={{ backgroundColor: themeColors[themeName].primary }} // Removed border from color square
                  title={themeName
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                ></div>
                <span
                  className="text-base"
                  style={{ color: activeColors.text }}
                >
                  {" "}
                  {/* Smaller text */}
                  {themeName
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Display Latest Insight - Styled as a distinct card */}
      {submittedPrompt && (
        <div
          className="mb-8 p-6 rounded-lg shadow-md"
          style={{
            backgroundColor: "#ffffff",
            borderBottom: `2px solid ${activeColors.border}`,
          }}
        >
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: activeColors.primary }}
          >
            Your Research Query
          </h2>
          <p style={{ color: activeColors.lightText, lineHeight: "1.6" }}>
            {submittedPrompt}
          </p>
        </div>
      )}

      {/* Render ingredients data - Sections as cards */}
      {reportData.ingredients &&
        Array.isArray(reportData.ingredients) &&
        reportData.ingredients.length > 0 && (
          <div className="mb-10">
            <h2
              className="text-3xl font-bold mb-6"
              style={{ color: activeColors.primary }}
            >
              Key Ingredient Deep Dive:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg shadow-lg"
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${activeColors.border}`,
                  }}
                >
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: activeColors.accent }}
                  >
                    {ingredient.name}
                  </h3>
                  <p className="mb-2" style={{ color: activeColors.lightText }}>
                    <strong style={{ color: activeColors.text }}>
                      Function:
                    </strong>{" "}
                    {ingredient.function}
                  </p>
                  <p className="mb-2" style={{ color: activeColors.lightText }}>
                    <strong style={{ color: activeColors.text }}>
                      Clinical Studies:
                    </strong>{" "}
                    {ingredient.clinicalStudies}
                  </p>
                  <p className="mb-2" style={{ color: activeColors.lightText }}>
                    <strong style={{ color: activeColors.text }}>
                      Market Trend Analysis:
                    </strong>{" "}
                    {ingredient.marketTrendAnalysis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Render actionable summary - Sections as distinct, colored cards */}
      {reportData.actionableSummary && (
        <div className="mb-10">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: activeColors.primary }}
          >
            Strategic Action Plan:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportData.actionableSummary.sellingPoints &&
              reportData.actionableSummary.sellingPoints.length > 0 && (
                <div
                  className="p-6 rounded-lg shadow-md"
                  style={{
                    backgroundColor: activeColors.background,
                    border: `1px solid ${activeColors.accent}`,
                  }}
                >
                  <h3
                    className="font-bold text-xl mb-3"
                    style={{ color: activeColors.accent }}
                  >
                    Key Selling Points:
                  </h3>
                  <ul
                    className="list-disc pl-6 space-y-1"
                    style={{ color: activeColors.text }}
                  >
                    {reportData.actionableSummary.sellingPoints.map(
                      (point, i) => (
                        <li key={i}>{point}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            {reportData.actionableSummary.cautions &&
              reportData.actionableSummary.cautions.length > 0 && (
                <div
                  className="p-6 rounded-lg shadow-md"
                  style={{
                    backgroundColor: activeColors.background,
                    border: `1px solid ${themeColors.red.primary}`,
                  }}
                >
                  <h3
                    className="font-bold text-xl mb-3"
                    style={{ color: themeColors.red.primary }}
                  >
                    Cautions & Considerations:
                  </h3>
                  <ul
                    className="list-disc pl-6 space-y-1"
                    style={{ color: activeColors.text }}
                  >
                    {reportData.actionableSummary.cautions.map((caution, i) => (
                      <li key={i}>{caution}</li>
                    ))}
                  </ul>
                </div>
              )}
            {reportData.actionableSummary.marketOpportunities &&
              reportData.actionableSummary.marketOpportunities.length > 0 && (
                <div
                  className="p-6 rounded-lg shadow-md"
                  style={{
                    backgroundColor: activeColors.background,
                    border: `1px solid ${activeColors.accent}`,
                  }}
                >
                  <h3
                    className="font-bold text-xl mb-3"
                    style={{ color: activeColors.accent }}
                  >
                    Market Opportunities:
                  </h3>
                  <ul
                    className="list-disc pl-6 space-y-1"
                    style={{ color: activeColors.text }}
                  >
                    {reportData.actionableSummary.marketOpportunities.map(
                      (opportunity, i) => (
                        <li key={i}>{opportunity}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            {reportData.actionableSummary.nextSteps &&
              reportData.actionableSummary.nextSteps.length > 0 && (
                <div
                  className="p-6 rounded-lg shadow-md"
                  style={{
                    backgroundColor: activeColors.background,
                    border: `1px solid ${activeColors.accent}`,
                  }}
                >
                  <h3
                    className="font-bold text-xl mb-3"
                    style={{ color: activeColors.accent }}
                  >
                    Suggested Next Steps:
                  </h3>
                  <ul
                    className="list-disc pl-6 space-y-1"
                    style={{ color: activeColors.text }}
                  >
                    {reportData.actionableSummary.nextSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Raw AI Response - Distinct, less prominent card */}
      {reportData.rawingredientFound && (
        <div
          className="mt-10 p-6 rounded-lg shadow-md"
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${activeColors.border}`,
          }}
        >
          <h2
            className="text-xl font-semibold mb-3"
            style={{ color: activeColors.primary }}
          >
            Raw AI Output (for Debugging)
          </h2>
          <pre
            className="whitespace-pre-wrap text-sm font-mono p-4 rounded overflow-x-auto border"
            style={{
              backgroundColor: "#f0f0f0",
              borderColor: activeColors.border,
              color: activeColors.text,
            }}
          >
            {reportData.rawingredientFound}
          </pre>
        </div>
      )}
    </div>
  );
}
