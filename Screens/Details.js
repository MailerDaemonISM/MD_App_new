import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  BackHandler,
} from "react-native";
import { Card, Title, Paragraph, List } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const fetchPlacementDetails = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching placement details:", error);
    return null;
  }
};

const Details = ({ route }) => {
  const navigation = useNavigation();
  const { company_name, url } = route.params;
  const [placementDetails, setPlacementDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPlacementDetails = async () => {
      setLoading(true);
      setPlacementDetails(null);
      const data = await fetchPlacementDetails(url);
      const details = data
        ? data.filter((item) => item.company_name === company_name)
        : null;

      if (details && details.length > 0) {
        setPlacementDetails(details[0]);
      } else {
        setPlacementDetails(null);
      }
      setLoading(false);
    };

    getPlacementDetails();
  }, [url, company_name]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Placementor");
        return true;
      };
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [navigation])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5733" />
        <Text style={styles.loadingText}>Fetching details...</Text>
      </View>
    );
  }

  if (!placementDetails) {
    return (
      <View style={styles.noDataContainer}>
        <MaterialIcons name="error-outline" size={50} color="gray" />
        <Text style={styles.noDataText}>No details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Card style={styles.card}>
        <Title style={styles.title}>{placementDetails.name}</Title>
        <Paragraph style={styles.detail}>
          Role: {placementDetails.role}
        </Paragraph>
        <Paragraph style={styles.detail}>
          Company: {placementDetails.company_name}
        </Paragraph>
        <Paragraph style={styles.detail}>
          CGPA: {placementDetails.CGPA}
        </Paragraph>
        <Paragraph style={styles.detail}>
          Year: {placementDetails.year}
        </Paragraph>
        <Paragraph style={styles.detail}>
          Eligible Branch: {placementDetails.eligible_branch}
        </Paragraph>
      </Card>

      {/* Interview Rounds */}
      <InterviewRoundsSection data={placementDetails.interview_round} />

      {/* Selection Process */}
      <SelectionProcessSection data={placementDetails.selection_process} />

      {/* Takeaways */}
      <Section
        title="Takeaways"
        data={{ "Key Takeaways": placementDetails.takeaways }}
      />

      {/* Test Series */}
      <Section
        title="Test Preparation"
        data={{ "Test Series": placementDetails.test_series }}
      />

      {/* Influence Of */}
      <InfluenceOfSection data={placementDetails.influence_of} />
    </ScrollView>
  );
};

// Section for Interview Rounds
const InterviewRoundsSection = ({ data }) => (
  <>
    <Text style={styles.sectionHeading}>Interview Rounds</Text>
    <List.Section>
      {data ? (
        Object.entries(data).map(([key, value], index) => (
          <List.Accordion
            key={key}
            title={`Round ${index + 1}`}
            titleStyle={styles.accordionTitle}
          >
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))
      ) : (
        <Paragraph style={styles.detail}>
          No interview round details available.
        </Paragraph>
      )}
    </List.Section>
  </>
);

// Section for Selection Process
const SelectionProcessSection = ({ data }) => {
  if (!data) return null;

  // Define key mapping
  const keyMap = {
    step1: "Round 1",
    step2: "Group Discussion Round",
    step3: "Interview Round",
  };

  // Sort keys to maintain correct order (step1, step2, step3)
  const sortedKeys = Object.keys(data).sort();

  return (
    <>
      <Text style={styles.sectionHeading}>Selection Process</Text>
      <List.Section>
        {sortedKeys.map((key) => (
          <List.Accordion
            key={key}
            title={keyMap[key] || key}
            titleStyle={styles.accordionTitle}
          >
            <Text style={styles.accordionText}>{data[key]}</Text>
          </List.Accordion>
        ))}
      </List.Section>
    </>
  );
};



// Section for Influence Of
const InfluenceOfSection = ({ data }) => {
  if (!data) return null;

  // Define fixed headings for Influence Of section
  const keyMap = {
    projects: "Projects/Previous Internships",
    pors: "PORs",
  };

  return (
    <>
      <Text style={styles.sectionHeading}>Influence Of</Text>
      <List.Section>
        {Object.entries(data).map(([key, value]) => (
          <List.Accordion
            key={key}
            title={keyMap[key] || key} // Use predefined headings if available
            titleStyle={styles.accordionTitle}
          >
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))}
      </List.Section>
    </>
  );
};






// Reusable Section Component
const Section = ({ title, data }) => (
  <>
    <Text style={styles.sectionHeading}>{title}</Text>
    <List.Section>
      {data ? (
        Object.entries(data).map(([key, value]) => (
          <List.Accordion
            key={key}
            title={key}
            titleStyle={styles.accordionTitle}
          >
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))
      ) : (
        <Paragraph style={styles.detail}>
          No {title.toLowerCase()} details available.
        </Paragraph>
      )}
    </List.Section>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "gray",
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
    marginBottom: 10,
  },
  detail: {
    fontSize: 18,
    color: "#555",
    marginVertical: 5,
  },
  card: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "rgba(238, 109, 152, 1)", // Apply the specified color
    marginVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(238, 109, 152, 1)", // Matching border color
    paddingBottom: 5,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  accordionText: {
    fontSize: 14,
    color: "#333",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontStyle: "italic",
  },
});

export default Details;
