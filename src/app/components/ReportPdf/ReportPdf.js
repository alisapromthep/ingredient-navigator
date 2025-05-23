// components/ReportPdf/ReportPdf.js
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import { themeColors } from "../../../lib/themeColors";

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "/fonts/OpenSans-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/OpenSans-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: colors.background,
      padding: 40,
      fontFamily: "Open Sans",
      color: colors.text,
    },
    header: {
      fontSize: 32,
      textAlign: "center",
      marginBottom: 30,
      fontWeight: "bold",
      color: colors.primary,
      textTransform: "uppercase",
    },
    sectionContainer: {
      marginBottom: 25,
      padding: 20,
      backgroundColor: "#FFFFFF", // Keeping content blocks white for consistency across themes
      borderRadius: 8,
      borderLeft: `5px solid ${colors.primary}`, // Strong accent border
      shadowColor: "#000", // Slight shadow for depth
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      color: colors.primary,
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: 5,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
      color: colors.accent, // Use accent for subheadings
    },
    text: {
      fontSize: 11,
      lineHeight: 1.6,
      marginBottom: 4,
    },
    listItem: {
      fontSize: 11,
      marginBottom: 2,
      marginLeft: 15,
      position: "relative",
    },
    bullet: {
      position: "absolute",
      left: -10,
      top: 0,
      fontSize: 11,
      color: colors.accent,
    },
    ingredientCard: {
      marginBottom: 15,
    },
    // Specific styling for summary blocks - using slightly different shades
    // for visual distinction within the summary section
    summaryBlock: {
      backgroundColor: colors.background, // Use theme background for blocks
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      border: `1px solid ${colors.border}`,
    },
    cautionBlock: {
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      border: `1px solid ${colors.red || "#dc3545"}`, // Fallback red for cautions
    },
    // Raw AI response
    rawResponseText: {
      fontSize: 9,
      fontFamily: "Courier",
      backgroundColor: "#F0F0F0",
      padding: 8,
      borderRadius: 4,
      whiteSpace: "pre-wrap",
      color: colors.text, // Ensure text color is readable on this background
    },
  });

const ReportPdf = ({ reportData, selectedSections, currentTheme }) => {
  const colors = themeColors[currentTheme] || themeColors.lightblue;
  const styles = createStyles(colors);

  console.log(
    "report data",
    reportData,
    "selectedSection",
    selectedSections,
    "currentTheme",
    currentTheme
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Ingredient Intelligence Report</Text>

        {selectedSections.includes("query") && reportData.submittedPrompt && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Research Query</Text>
            <Text style={styles.text}>
              {(reportData.submittedPrompt || "").toString()}
            </Text>
          </View>
        )}

        {selectedSections.includes("ingredients") &&
          reportData.ingredients &&
          Array.isArray(reportData.ingredients) &&
          reportData.ingredients.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Key Ingredient Deep Dive</Text>
              {reportData.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientCard}>
                  <Text style={styles.subsectionTitle}>
                    {(ingredient.name || "").toString()}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={{ fontWeight: "bold" }}>Function:</Text>{" "}
                    {(ingredient.function || "").toString()}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={{ fontWeight: "bold" }}>
                      Clinical Studies:
                    </Text>{" "}
                    {ingredient.clinicalStudies || "N/A".toString()}
                  </Text>
                  <Text style={styles.text}>
                    <Text style={{ fontWeight: "bold" }}>
                      Market Trend Analysis:
                    </Text>{" "}
                    {ingredient.marketTrendAnalysis || "".toString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

        {selectedSections.includes("summary") &&
          reportData.actionableSummary && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Strategic Action Plan</Text>

              {reportData.actionableSummary.sellingPoints &&
                reportData.actionableSummary.sellingPoints.length > 0 && (
                  <View style={styles.summaryBlock}>
                    <Text style={styles.subsectionTitle}>
                      Key Selling Points
                    </Text>
                    {reportData.actionableSummary.sellingPoints.map(
                      (point, i) => (
                        <Text key={i} style={styles.listItem}>
                          <Text style={styles.bullet}>• </Text>
                          {point}
                        </Text>
                      )
                    )}
                  </View>
                )}
              {reportData.actionableSummary.cautions &&
                reportData.actionableSummary.cautions.length > 0 && (
                  <View style={styles.cautionBlock}>
                    <Text style={styles.subsectionTitle}>
                      Cautions & Considerations
                    </Text>
                    {reportData.actionableSummary.cautions.map((caution, i) => (
                      <Text key={i} style={styles.listItem}>
                        <Text style={styles.bullet}>• </Text>
                        {caution}
                      </Text>
                    ))}
                  </View>
                )}
              {reportData.actionableSummary.marketOpportunities &&
                reportData.actionableSummary.marketOpportunities.length > 0 && (
                  <View style={styles.summaryBlock}>
                    <Text style={styles.subsectionTitle}>
                      Market Opportunities
                    </Text>
                    {reportData.actionableSummary.marketOpportunities.map(
                      (opportunity, i) => (
                        <Text key={i} style={styles.listItem}>
                          <Text style={styles.bullet}>• </Text>
                          {opportunity}
                        </Text>
                      )
                    )}
                  </View>
                )}
              {reportData.actionableSummary.nextSteps &&
                reportData.actionableSummary.nextSteps.length > 0 && (
                  <View style={styles.summaryBlock}>
                    <Text style={styles.subsectionTitle}>
                      Suggested Next Steps
                    </Text>
                    {reportData.actionableSummary.nextSteps.map((step, i) => (
                      <Text key={i} style={styles.listItem}>
                        <Text style={styles.bullet}>• </Text>
                        {step}
                      </Text>
                    ))}
                  </View>
                )}
            </View>
          )}

        {selectedSections.includes("rawResponse") &&
          reportData.rawAiResponse && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                Raw AI Response (for Debugging)
              </Text>
              <Text style={styles.rawResponseText}>
                {reportData.rawAiResponse}
              </Text>
            </View>
          )}
      </Page>
    </Document>
  );
};

export default ReportPdf;
