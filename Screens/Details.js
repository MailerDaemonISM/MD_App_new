import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
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

  // Handle back button
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
    <ScrollView style={styles.container}>
      {/* Back Button */}
      {/* <TouchableOpacity onPress={() => navigation.navigate("Placementor")} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={28} color="white" />
      </TouchableOpacity> */}

      {/* Image */}
      {/* {placementDetails.image && placementDetails.image.url && (
        <Image source={{ uri: placementDetails.image.url }} style={styles.image} />
      )} */}

      {/* Details Card */}
      <Card style={styles.card}>
        <Title style={styles.title}>{placementDetails.name}</Title>
        <Paragraph style={styles.detail}>Role: {placementDetails.role}</Paragraph>
        <Paragraph style={styles.detail}>Company: {placementDetails.company_name}</Paragraph>
        <Paragraph style={styles.detail}>CGPA: {placementDetails.CGPA}</Paragraph>
        <Paragraph style={styles.detail}>Year: {placementDetails.year}</Paragraph>
        <Paragraph style={styles.detail}>Eligible Branch: {placementDetails.eligible_branch}</Paragraph>
      </Card>

      {/* Interview Rounds */}
      <Section title="Interview Rounds" data={placementDetails.interview_round} />
      
      {/* Selection Process */}
      <Section title="Selection Process" data={placementDetails.selection_process} />
      
      {/* Takeaways */}
      <Section title="Takeaways" data={{ takeaways: placementDetails.takeaways }} />
      
      {/* Test Series */}
      <Section title="Test Series" data={{ test_series: placementDetails.test_series }} />
      
      {/* Influence Of */}
      <Section title="Influence Of" data={placementDetails.influence_of} />
    </ScrollView>
  );
};

// Reusable Section Component
const Section = ({ title, data }) => (
  <>
    <Text style={styles.sectionHeading}>{title}</Text>
    <List.Section>
      {data ? (
        Object.entries(data).map(([key, value]) => (
          <List.Accordion key={key} title={`${title} ${key}`} titleStyle={styles.accordionTitle}>
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))
      ) : (
        <Paragraph style={styles.detail}>No {title.toLowerCase()} details available.</Paragraph>
      )}
    </List.Section>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f7fc",
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#3b5998",
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
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
  image: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: "cover",
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#444",
    marginVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#3b5998",
    paddingBottom: 5,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  accordionText: {
    fontSize: 17,
    color: "#333",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

export default Details;
