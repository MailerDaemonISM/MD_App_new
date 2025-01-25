import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { fetchPlacementData } from "../sanity";

const PlacementList = () => {
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchPlacementData();
        setPlacements(data);
        setFilteredPlacements(data); // Set initial filtered data
      } catch (error) {
        console.error("Error fetching placement data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredData = placements.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.company_name.toLowerCase().includes(text.toLowerCase()) ||
        item.role.toLowerCase().includes(text.toLowerCase()) ||
        item.eligible_branch.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPlacements(filteredData);
  };

  const renderCard = ({ item }) => (
    <View style={styles.card} key={key}>
      <Text style={styles.title}>{item.name}</Text>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.imageUrl }} style={styles.companyLogo} />

        <TouchableOpacity>
          <Icon name="bookmark-border" size={24} color="#777" />
        </TouchableOpacity>
      </View>
      <Text>Role: {item.role}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.campusType}>On Campus</Text>
        <TouchableOpacity>
          <Icon name="share" size={20} color="#777" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Search Bar */}
          <TextInput
            style={styles.searchBar}
            placeholder="Search placements, companies, roles..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleSearch}
          />

          {/* Header Tabs */}
          <ScrollView
            horizontal
            style={styles.tabsContainer}
            showsHorizontalScrollIndicator={true}
          >
            {["All", "Placements", "Internships", "PPOs"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Placement List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.list}
          >
            {filteredPlacements.map((item,key) => renderCard({ item,key }))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  searchBar: {
    margin: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#98DDFF",
  },
  tabText: {
    fontSize: 14,
    color: "#555",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollView: {
    height: "70%", // Fix height to 70% of the screen
    paddingHorizontal: 16,
  },
  list: {
    paddingBottom: 16, // Avoid overlap with the keyboard
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "contain",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  campusType: {
    fontSize: 14,
    color: "#555",
  },
});

export default PlacementList;
