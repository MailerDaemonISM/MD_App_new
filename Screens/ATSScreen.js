import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";

const ATSScreen = () => {
  const navigation = useNavigation();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [atsScore, setAtsScore] = useState(null);

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (!result.canceled) {
        setResume(result.assets[0]);
        setAtsScore(null);
      }
    } catch (error) {
      console.error("Error picking resume:", error);
    }
  };

  const checkATSScore = () => {
    setLoading(true);

    // UI-only fake ATS logic
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60–100
      setAtsScore(score);
      setLoading(false);
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
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
      <TouchableOpacity style={styles.uploadCard} onPress={pickResume}>
        <Icon name="cloud-upload" size={42} color="#4A90E2" />
        <Text style={styles.uploadText}>
          {resume ? resume.name : "Upload Resume (PDF / DOCX)"}
        </Text>
      </TouchableOpacity>

      {/* Check Button */}
      {resume && !loading && (
        <TouchableOpacity style={styles.checkButton} onPress={checkATSScore}>
          <Text style={styles.checkButtonText}>Check ATS Score</Text>
        </TouchableOpacity>
      )}

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
});
