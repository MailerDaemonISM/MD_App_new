import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView } from "react-native";
import { Card, Title, Paragraph, List } from "react-native-paper";

// Fetch placement data using the URL
const fetchPlacementDetails = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data.result; // Assuming the API response contains a "result" key
  } catch (error) {
    console.error("Error fetching placement details:", error);
    return null;
  }
};

const Details = ({ route }) => {
 //id changed to company_name
  const { company_name, url } = route.params;
  const [placementDetails, setPlacementDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPlacementDetails = async () => {
      setLoading(true);
      setPlacementDetails(null); // Clear previous data

      const data = await fetchPlacementDetails(url);

      //id changed to company_name
      const details = data ? data.filter(item => item.company_name === company_name) : null;

      if (details && details.length > 0) {
        setPlacementDetails(details[0]); // Display the first matching entry
      } else {
        setPlacementDetails(null);
      }
      setLoading(false);
    };

    getPlacementDetails();
  }, [url, company_name]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5733" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!placementDetails) {
    return (
      <View style={styles.noDataContainer}>
        <Text>No details found for this placement.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Display image if available */}
      {placementDetails.image && placementDetails.image.url && (
        <Image
          source={{ uri: placementDetails.image.url }}
          style={styles.image}
        />
      )}
      
      {/* Placement Overview */}
      <Card style={styles.card}>
        <Title style={styles.title}>{placementDetails.name}</Title>
        <Paragraph style={styles.detail}>Role: {placementDetails.role}</Paragraph>
        <Paragraph style={styles.detail}>Company: {placementDetails.company_name}</Paragraph>
        <Paragraph style={styles.detail}>CGPA: {placementDetails.CGPA}</Paragraph>
        <Paragraph style={styles.detail}>Year: {placementDetails.year}</Paragraph>
        <Paragraph style={styles.detail}>Eligible Branch: {placementDetails.eligible_branch}</Paragraph>
      </Card>

      {/* Accordion for Interview Rounds */}
      <List.Section>
        <List.Accordion title="Interview Rounds">
          <Paragraph style={styles.detail}>
            {placementDetails.interview_round && placementDetails.interview_round.length > 0
              ? placementDetails.interview_round[0].round_type
              : "N/A"}
          </Paragraph>
        </List.Accordion>
      </List.Section>

      {/* Accordion for Selection Process */}
      <List.Section>
        <List.Accordion title="Selection Process">
          <Paragraph style={styles.detail}>
            {placementDetails.selection_process ? placementDetails.selection_process.details : "N/A"}
          </Paragraph>
        </List.Accordion>
      </List.Section>

      {/* Accordion for Takeaways */}
      <List.Section>
        <List.Accordion title="Takeaways">
          <Paragraph style={styles.detail}>
            {placementDetails.takeaways || "N/A"}
          </Paragraph>
        </List.Accordion>
      </List.Section>

      {/* Accordion for Test Series */}
      <List.Section>
        <List.Accordion title="Test Series">
          <Paragraph style={styles.detail}>
            {placementDetails.test_series || "N/A"}
          </Paragraph>
        </List.Accordion>
      </List.Section>

      {/* Accordion for Influence */}
      <List.Section>
        <List.Accordion title="Influence of">
          <Paragraph style={styles.detail}>
            {placementDetails.influence_of && placementDetails.influence_of.length > 0
              ? placementDetails.influence_of[0].influenced_by
              : "N/A"}
          </Paragraph>
        </List.Accordion>
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    marginTop: 10,
    fontWeight: "bold",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginVertical: 5,
  },
  card: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 20,
  },
});

export default Details;
