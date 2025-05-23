"use client";

import { useState, useEffect } from "react";
import { usePerplexity } from "@/app/context/PerplexityContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPdf from "../components/ReportPdf/ReportPdf";

export default function ReportsPage() {
  const { submittedPrompt, aiResponse, actionableSummary, loading, error } =
    usePerplexity();

  // State to manage which sections to include in the PDF
  const [selectedPdfSections, setSelectedPdfSections] = useState({
    query: true,
    ingredients: true,
    summary: true,
    rawResponse: false, // Raw response is usually optional for final reports
  });

  // Combine all report data for easy passing to PDF component
  const reportData = {
    submittedPrompt,
    ingredients: aiResponse?.ingredients, // Access ingredients from aiResponse
    actionableSummary,
    rawAiResponse: aiResponse?.rawResponse, // Access rawResponse from aiResponse
  };

  // Check if there's any data to display/generate a PDF
  const hasReportData =
    submittedPrompt || aiResponse?.ingredients?.length > 0 || actionableSummary;

  // Function to handle checkbox changes for PDF sections
  const handleSectionToggle = (sectionName) => {
    setSelectedPdfSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  if (loading) {
    return (
      <div className="text-center p-8 text-blue-600">
        Loading your report...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  if (!hasReportData) {
    return (
      <div className="text-center p-8 text-gray-600">
        No report generated yet. Please submit a query from the form.
      </div>
    );
  }

  // Filter selected sections for PDF generation
  const pdfSections = Object.keys(selectedPdfSections).filter(
    (key) => selectedPdfSections[key]
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Ingredient Intelligence Report
      </h1>

      {/* PDF Options and Download Button */}
      <div className="mb-8 p-6 bg-purple-50 border-l-4 border-purple-400 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-purple-800 mb-3">
          Generate PDF Report:
        </h2>

        {/* Checkbox options for PDF content */}
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedPdfSections.query}
              onChange={() => handleSectionToggle("query")}
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            <span className="text-gray-700">Include Query</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedPdfSections.ingredients}
              onChange={() => handleSectionToggle("ingredients")}
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            <span className="text-gray-700">Include Ingredients</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedPdfSections.summary}
              onChange={() => handleSectionToggle("summary")}
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            <span className="text-gray-700">Include Actionable Summary</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedPdfSections.rawResponse}
              onChange={() => handleSectionToggle("rawResponse")}
              className="form-checkbox h-5 w-5 text-purple-600"
            />
            <span className="text-gray-700">
              Include Raw AI Response (for debugging)
            </span>
          </label>
        </div>

        {/* PDF Download Button */}
        {/* Only show if there's data and at least one section is selected */}
        {hasReportData && pdfSections.length > 0 ? (
          <PDFDownloadLink
            document={
              <ReportPdf
                reportData={reportData}
                selectedSections={pdfSections}
              />
            }
            fileName="ingredient_report.pdf"
          >
            {({ blob, url, loading, error }) => (
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                disabled={loading}
              >
                {loading ? "Generating PDF..." : "Download PDF Report"}
              </button>
            )}
          </PDFDownloadLink>
        ) : (
          <p className="text-gray-600">
            Select content to enable PDF download.
          </p>
        )}
      </div>

      {/* Display Latest Insight (Same as before) */}
      {submittedPrompt && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Your Query:</h2>
          <p className="text-gray-700">{submittedPrompt}</p>
        </div>
      )}

      {/* Render ingredients data */}
      {reportData.ingredients &&
        Array.isArray(reportData.ingredients) &&
        reportData.ingredients.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">
              Suggested Ingredients:
            </h2>
            <div className="space-y-6">
              {reportData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="p-4 border rounded shadow-sm bg-white"
                >
                  <h3 className="text-xl font-bold text-blue-700 mb-2">
                    {ingredient.name}
                  </h3>
                  <p className="mb-1">
                    <strong className="text-gray-700">Function:</strong>{" "}
                    {ingredient.function}
                  </p>
                  <p className="mb-1">
                    <strong className="text-gray-700">Clinical Studies:</strong>{" "}
                    {ingredient.clinicalStudies}
                  </p>
                  <p className="mb-1">
                    <strong className="text-gray-700">
                      Market Trend Analysis:
                    </strong>{" "}
                    {ingredient.marketTrendAnalysis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Render actionable summary */}
      {reportData.actionableSummary && (
        <div className="p-6 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">
            Actionable Summary for Your Business:
          </h2>

          {reportData.actionableSummary.sellingPoints &&
            reportData.actionableSummary.sellingPoints.length > 0 && (
              <div className="mb-3">
                <h3 className="font-bold text-lg text-green-700">
                  Key Selling Points:
                </h3>
                <ul className="list-disc pl-5 text-gray-800">
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
              <div className="mb-3">
                <h3 className="font-bold text-lg text-red-700">
                  Cautions & Considerations:
                </h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {reportData.actionableSummary.cautions.map((caution, i) => (
                    <li key={i}>{caution}</li>
                  ))}
                </ul>
              </div>
            )}
          {reportData.actionableSummary.marketOpportunities &&
            reportData.actionableSummary.marketOpportunities.length > 0 && (
              <div className="mb-3">
                <h3 className="font-bold text-lg text-blue-700">
                  Market Opportunities:
                </h3>
                <ul className="list-disc pl-5 text-gray-800">
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
              <div className="mb-3">
                <h3 className="font-bold text-lg text-purple-700">
                  Suggested Next Steps:
                </h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {reportData.actionableSummary.nextSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Optionally, display raw response for debugging */}
      {reportData.rawAiResponse && (
        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Raw AI Response (for Debugging):
          </h2>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-yellow-100 p-3 rounded overflow-x-auto">
            {reportData.rawAiResponse}
          </pre>
        </div>
      )}
    </div>
  );
}
