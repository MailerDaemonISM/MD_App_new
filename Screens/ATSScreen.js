import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
// import { GoogleGenerativeAI } from "@google/genai";
import * as DocumentPicker from "expo-document-picker";
import { extractText } from "expo-pdf-text-extract";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(API_KEY);
console.log("Api_Key: ", API_KEY);
const ATSScreen = () => {
  const navigation = useNavigation();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [advice, setAdvice] = useState("");

  const handleATSAnalysis = async () => {
    try {
      //picking the pdf files
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setLoading(true);
      // console.log(result.assets[0])
      setResume(result.assets[0]);

      //Extract text from pdf
      const resumeText = await extractText(result.assets[0].uri);
      const prompt = `
  Act as a senior recruitment expert and an advanced ATS (Applicant Tracking System). 
  
  TASK:
  1. Carefully analyze the provided resume text.
  2. Identify the most likely professional job role or title the candidate is targeting (e.g., Frontend Developer, Data Scientist, Product Manager, etc.).
  3. Evaluate the resume against current industry standards for that specific identified role.
  4. Provide a match score (0-100), identify specific technical or soft skill gaps, and give actionable professional advice.

  Return ONLY a JSON object with this structure:
  {
    "identifiedRole": "The job title you identified",
    "score": 85,
    "gaps": ["List item 1", "List item 2"],
    "advice": ["Actionable point 1", "Actionable point 2"]
  }

  Resume Text:
  ${resumeText}
`;
      //Send to Gemini
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        //  Get the raw string from Gemini
        const rawText = data.candidates[0].content.parts[0].text;

        //Parse the string into a real JavaScript Object
        const resultJson = JSON.parse(rawText);

        // console.log(resultJson);
        setAtsScore(resultJson.score);
        setGaps(resultJson.gaps);

        let adviceData = resultJson.advice;

        // If Gemini sends one big string with newlines, split it into an array
        if (typeof adviceData === 'string') {
          adviceData = adviceData.split('\n').filter(line => line.trim() !== "");
        }

        setAdvice(adviceData);
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ATS Resume Checker</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Upload your resume and check how ATS-friendly it is
      </Text>

      {/* Upload Card */}
      <TouchableOpacity style={styles.uploadCard} onPress={handleATSAnalysis}>
        <Icon name="cloud-upload" size={42} color="#4A90E2" />
        <Text style={styles.uploadText}>
          {resume ? resume.name : "Upload Resume (PDF / DOCX)"}
        </Text>
      </TouchableOpacity>

      {/* Loader */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Analyzing resume...</Text>
        </View>
      )}

      {/* Result */}
      {atsScore !== null && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Your ATS Score</Text>

          {/*  Score */}
          <View
            style={[
              styles.scoreCircle,
              {
                borderColor: atsScore >= 75 ? "#2ECC71" : "#E67E22",
              },
            ]}
          >
            <Text
              style={[
                styles.scoreCircleText,
                { color: atsScore >= 75 ? "#2ECC71" : "#E67E22" },
              ]}
            >
              {atsScore}%
            </Text>
          </View>

          {/* Progress Bar  */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${atsScore}%`,
                  backgroundColor: atsScore >= 75 ? "#2ECC71" : "#E67E22",
                },
              ]}
            />
          </View>

          <Text style={styles.feedbackText}>
            {atsScore >= 75
              ? "Great! Your resume is ATS-friendly 🚀"
              : "Needs improvement. Optimize keywords & formatting ⚠️"}
          </Text>

          {gaps.length > 0 && (
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Icon name="error-outline" size={20} color="#E74C3C" />
                <Text style={[styles.sectionTitle, { color: "#E74C3C" }]}>
                  Gaps Identified
                </Text>
              </View>
              {gaps.map((gap, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{gap}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Advice Section */}
          {Array.isArray(advice) && advice.length > 0 && (
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Icon name="lightbulb-outline" size={20} color="#F1C40F" />
                <Text style={[styles.sectionTitle, { color: "#D4AC0D" }]}>
                  Professional Advice
                </Text>
              </View>
              {advice.map((item, index) => (
                <View key={`advice-${index}`} style={styles.bulletItem}>
                  {/* The Bullet column */}
                  <Text style={[styles.bulletPoint, { color: "#D4AC0D" }]}>
                    {"\u2022"}
                  </Text>
                  {/* The Text column (wraps correctly because of flex: 1) */}
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default ATSScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },

  uploadCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4A90E2",
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 20,
  },

  uploadText: {
    marginTop: 10,
    fontSize: 14,
    color: "#4A90E2",
    textAlign: "center",
  },

  checkButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  checkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },

  resultCard: {
    marginTop: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    elevation: 3,
    alignItems: "center",
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },

  /* Score Styles */
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  scoreCircleText: {
    fontSize: 32,
    fontWeight: "bold",
  },

  progressBarBackground: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 6,
    overflow: "hidden",
    width: "100%",
    marginTop: 10,
  },

  progressBarFill: {
    height: 10,
    borderRadius: 6,
  },

  feedbackText: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  infoSection: {
    width: "100%",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
  bulletItem: {
    flexDirection: "row",      
    alignItems: "flex-start",  
    marginBottom: 8,           
    paddingRight: 10,         
  },
  bulletPoint: {
    width: 20,             
    fontSize: 22,
    lineHeight: 22,            
    textAlign: "center",
  },
  bulletText: {
    flex: 1,                  
    fontSize: 14,
    color: "#444",
    lineHeight: 22,            
  },
});
