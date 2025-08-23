import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  BackHandler,
  Image,
} from "react-native";
import { Card, Title, Paragraph, List } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "./DetailScreen.style";

const getImageUrl = (image) => {
  if (!image || !image.asset || !image.asset._ref) return null;
  const imageId = image.asset._ref.split("-")[1];
  const dimensions = image.asset._ref.split("-")[2];
  const format = image.asset._ref.split("-")[3];
  return `https://cdn.sanity.io/images/zltsypm6/production/${imageId}-${dimensions}.${format}`;
};

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
        {placementDetails.image && (
          <Image
            source={{ uri: getImageUrl(placementDetails.image) }}
            style={styles.companyLogo}
          />
        )}
        <Title style={styles.title}>{placementDetails.name}</Title>
        <Paragraph style={styles.detail}>Role: {placementDetails.role}</Paragraph>
        <Paragraph style={styles.detail}>Company: {placementDetails.company_name}</Paragraph>
        <Paragraph style={styles.detail}>CGPA: {placementDetails.CGPA}</Paragraph>
        <Paragraph style={styles.detail}>Year: {placementDetails.year}</Paragraph>
        <Paragraph style={styles.detail}>
          Eligible Branch: {placementDetails.eligible_branch}
        </Paragraph>
      </Card>

      {/* Interview Rounds */}
      <InterviewRoundsSection data={placementDetails.interview_round} />

      {/* Selection Process */}
      <SelectionProcessSection data={placementDetails.selection_process} />

      {/* Takeaways */}
      <Section title="Takeaways" data={{ "Key Takeaways": placementDetails.takeaways }} />

      {/* Test Series */}
      <Section title="Test Preparation" data={{ "Test Series": placementDetails.test_series }} />

      {/* Resources Section */}
      <ResourcesSection data={placementDetails.resources} />

      {/* Influence Of */}
      <InfluenceOfSection data={placementDetails.influence_of} />

      {/* Selected Candidates Section */}
      <SelectedCandidatesSection data={placementDetails.selected} />
    </ScrollView>
  );
};

// Selected Candidates Section
const SelectedCandidatesSection = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionHeading}>Selected Candidates</Text>
      <List.Section>
        <List.Accordion
          title="View Candidates"
          titleStyle={styles.accordionTitle}
          left={props => <MaterialIcons {...props} name="people" size={24} color="gray" />}
        >
          {data.map((name, index) => (
            <List.Item
              key={index}
              title={name}
          left={props => <MaterialIcons {...props} name="people" size={24} color="gray" />}
            />
          ))}
        </List.Accordion>
      </List.Section>
    </>
  );
};

// Parse Portable Text into plain text
const parsePortableText = (blocks) => {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block._type === "block" && Array.isArray(block.children)) {
        return block.children.map((span) => span.text).join("");
      }
      return "";
    })
    .join("\n\n");
};

// ----------------- Section Components -----------------
// Interview Rounds Section
const InterviewRoundsSection = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const rounds = Object.entries(data).filter(
    ([, value]) => value && value.trim() !== ""
  );

  if (rounds.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionHeading}>Interview Rounds</Text>
      <List.Section>
        {rounds.map(([key, value], index) => (
          <List.Accordion
            key={key}
            title={`Round ${index + 1}`}
            titleStyle={styles.accordionTitle}
          >
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))}
      </List.Section>
    </>
  );
};


// Selection Process Section
const SelectionProcessSection = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const keyMap = {
    step1: "Round 1",
    step2: "Group Discussion Round",
    step3: "Interview Round",
  };

  const steps = Object.entries(data).filter(
    ([, value]) => value && value.trim() !== ""
  );

  if (steps.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionHeading}>Selection Process</Text>
      <List.Section>
        {steps.map(([key, value]) => (
          <List.Accordion
            key={key}
            title={keyMap[key] || key}
            titleStyle={styles.accordionTitle}
          >
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))}
      </List.Section>
    </>
  );
};


// Resources Section
const ResourcesSection = ({ data }) => {
  if (!data || data.length === 0) return null;
  const parsedText = parsePortableText(data);
  return (
    <>
      <Text style={styles.sectionHeading}>Resources</Text>
      <List.Section>
        <List.Accordion title="Questions and Links" titleStyle={styles.accordionTitle}>
          <Text style={styles.accordionText}>{parsedText}</Text>
        </List.Accordion>
      </List.Section>
    </>
  );
};

// Reusable Section Component
const Section = ({ title, data }) => {
  if (!data) return null;

  const items = Object.entries(data).filter(
    ([, value]) => value && value.trim() !== ""
  );

  if (items.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionHeading}>{title}</Text>
      <List.Section>
        {items.map(([key, value]) => (
          <List.Accordion
            key={key}
            title={key}
            titleStyle={styles.accordionTitle}
          >
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))}
      </List.Section>
    </>
  );
};
// Influence Of Section
const InfluenceOfSection = ({ data }) => {
  if (!data) return null;
  const keyMap = {
    projects: "Projects/Previous Internships",
    pors: "PORs",
  };
  return (
    <>
      <Text style={styles.sectionHeading}>Influence Of</Text>
      <List.Section>
        {Object.entries(data).map(([key, value]) => (
          <List.Accordion key={key} title={keyMap[key] || key} titleStyle={styles.accordionTitle}>
            <Text style={styles.accordionText}>{value}</Text>
          </List.Accordion>
        ))}
      </List.Section>
    </>
  );
};


export default Details;
