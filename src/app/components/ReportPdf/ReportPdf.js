import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Create styles for your PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica", // Default font
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    borderBottom: "1px solid #eeeeee",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#555555",
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 3,
    marginLeft: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  // Specific styles for sections
  querySection: {
    backgroundColor: "#f0f4f8",
    padding: 10,
    borderRadius: 5,
  },
  ingredientSection: {
    marginBottom: 10,
    borderLeft: "4px solid #3b82f6", // blue-500
    paddingLeft: 8,
  },
  summarySection: {
    backgroundColor: "#ecfdf5", // green-50
    padding: 10,
    borderRadius: 5,
    borderLeft: "4px solid #10b981", // green-400
  },
  // Style for pre-wrap content (like raw AI response)
  preWrap: {
    fontSize: 10,
    fontFamily: "Courier", // Monospaced font for code/raw text
    whiteSpace: "pre-wrap",
    backgroundColor: "#f8f8f8",
    padding: 5,
    borderRadius: 3,
  },
});

// Create the PDF document component
const ReportPdf = ({ reportData, selectedSections }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Ingredient Intelligence Report</Text>

      {selectedSections.includes("query") && reportData.submittedPrompt && (
        <View style={[styles.section, styles.querySection]}>
          <Text style={styles.subtitle}>Your Query:</Text>
          <Text style={styles.text}>{reportData.submittedPrompt}</Text>
        </View>
      )}

      {selectedSections.includes("ingredients") &&
        reportData.ingredients &&
        Array.isArray(reportData.ingredients) &&
        reportData.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Suggested Ingredients:</Text>
            {reportData.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientSection}>
                <Text style={[styles.text, styles.boldText]}>
                  {ingredient.name}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.boldText}>Function:</Text>{" "}
                  {ingredient.function}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.boldText}>Clinical Studies:</Text>{" "}
                  {ingredient.clinicalStudies}
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.boldText}>Market Trend Analysis:</Text>{" "}
                  {ingredient.marketTrendAnalysis}
                </Text>
              </View>
            ))}
          </View>
        )}

      {selectedSections.includes("summary") && reportData.actionableSummary && (
        <View style={[styles.section, styles.summarySection]}>
          <Text style={styles.subtitle}>
            Actionable Summary for Your Business:
          </Text>

          {reportData.actionableSummary.sellingPoints &&
            reportData.actionableSummary.sellingPoints.length > 0 && (
              <View style={{ marginBottom: 5 }}>
                <Text style={[styles.text, styles.boldText]}>
                  Key Selling Points:
                </Text>
                {reportData.actionableSummary.sellingPoints.map((point, i) => (
                  <Text key={i} style={styles.listItem}>
                    • {point}
                  </Text>
                ))}
              </View>
            )}
          {reportData.actionableSummary.cautions &&
            reportData.actionableSummary.cautions.length > 0 && (
              <View style={{ marginBottom: 5 }}>
                <Text style={[styles.text, styles.boldText]}>
                  Cautions & Considerations:
                </Text>
                {reportData.actionableSummary.cautions.map((caution, i) => (
                  <Text key={i} style={styles.listItem}>
                    • {caution}
                  </Text>
                ))}
              </View>
            )}
          {reportData.actionableSummary.marketOpportunities &&
            reportData.actionableSummary.marketOpportunities.length > 0 && (
              <View style={{ marginBottom: 5 }}>
                <Text style={[styles.text, styles.boldText]}>
                  Market Opportunities:
                </Text>
                {reportData.actionableSummary.marketOpportunities.map(
                  (opportunity, i) => (
                    <Text key={i} style={styles.listItem}>
                      • {opportunity}
                    </Text>
                  )
                )}
              </View>
            )}
          {reportData.actionableSummary.nextSteps &&
            reportData.actionableSummary.nextSteps.length > 0 && (
              <View style={{ marginBottom: 5 }}>
                <Text style={[styles.text, styles.boldText]}>
                  Suggested Next Steps:
                </Text>
                {reportData.actionableSummary.nextSteps.map((step, i) => (
                  <Text key={i} style={styles.listItem}>
                    • {step}
                  </Text>
                ))}
              </View>
            )}
        </View>
      )}

      {selectedSections.includes("rawResponse") && reportData.rawAiResponse && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Raw AI Response:</Text>
          <Text style={styles.preWrap}>{reportData.rawAiResponse}</Text>
        </View>
      )}
    </Page>
  </Document>
);

export default ReportPdf;
