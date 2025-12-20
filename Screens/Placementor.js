import React, { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Share
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

let url = "";
// Function to fetch placement data based on the selected year
const fetchPlacementData = async (year) => {
  if(year === "2025")
    url=  "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202025%5D%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A";
  else if (year === "2024") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202024%5D%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A";
  } else if (year === "2023") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202023%5D%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A";
  } else if (year === "2022") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202022%5D%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A";
  } else if (year == "2021") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202021%5D%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A";
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.result; // Return the array of placement data
  } catch (error) {
    console.error("Error fetching placement data:", error);
    return [];
  }
};

// Share button handler
import { buildShareText } from "../utils/shareText";

const onShare = async (post) => {
  try {
    let message = buildShareText(post);

    // If no body-style text exists, fall back to placement-specific details
    if (!message || !message.trim()) {
      const company = post.company_name || post.name || 'Company';
      const role = post.role || 'Role';
      const year = post.year ? `Year: ${post.year}` : '';

      // Selected candidates may be stored in different properties; handle common cases
      let selectedText = '';
      if (post.selectedCandidates) {
        selectedText = Array.isArray(post.selectedCandidates)
          ? `Selected: ${post.selectedCandidates.join(', ')}`
          : `Selected: ${String(post.selectedCandidates)}`;
      } else if (post.selected) {
        selectedText = Array.isArray(post.selected)
          ? `Selected: ${post.selected.join(', ')}`
          : `Selected: ${String(post.selected)}`;
      } else if (post.candidates) {
        selectedText = Array.isArray(post.candidates)
          ? `Selected: ${post.candidates.join(', ')}`
          : `Selected: ${String(post.candidates)}`;
      } else if (post.name && post.company_name) {
        // If the item is itself a selected candidate, include the candidate name
        selectedText = `Candidate: ${post.name}`;
      }

      message = `${company} - ${role}${year ? '\n' + year : ''}${selectedText ? '\n' + selectedText : ''}`;
    }

    await Share.share({ message });
  } catch (error) {
    console.error("Error sharing post:", error);
  }
};

const getUserSpecificKey = (userId) => {
  return `placementBookmarks_${userId}`;
};

const PlacementList = () => {
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const { user } = useUser();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await fetchPlacementData(selectedYear);
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setPlacements(sortedData);
        setFilteredPlacements(sortedData);
      } catch (error) {
        console.error("Error fetching placement data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [selectedYear]); // Refetch data whenever the selected year changes

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadBookmarks();
      }
    }, [user])
  );

  const loadBookmarks = async () => {
    if (!user) return;
    try {
      const userKey = getUserSpecificKey(user.id);
      const savedBookmarks = await AsyncStorage.getItem(userKey);
      if (savedBookmarks) {
        setBookmarkedPosts(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  // Update the toggleBookmark function
  const toggleBookmark = async (item) => {
    if (!user) return;
    try {
      const userKey = getUserSpecificKey(user.id);
      // Create a unique identifier for the placement item
      const placementItem = {
        ...item,
        id: item._id || `placement_${item.company_name}_${item.year}` // Create unique ID if none exists
      };

      const isBookmarked = bookmarkedPosts.some(post =>
        post.id === placementItem.id ||
        post._id === placementItem._id
      );

      let updatedBookmarks;

      if (isBookmarked) {
        updatedBookmarks = bookmarkedPosts.filter(post =>
          post.id !== placementItem.id &&
          post._id !== placementItem._id
        );
      } else {
        updatedBookmarks = [...bookmarkedPosts, placementItem];
      }

      await AsyncStorage.setItem(userKey, JSON.stringify(updatedBookmarks));
      setBookmarkedPosts(updatedBookmarks);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    filterPlacements(text, selectedBranch);
    // const filteredData = placements.filter(
    //   (item) =>
    //     item.name.toLowerCase().includes(text.toLowerCase()) ||
    //     item.company_name.toLowerCase().includes(text.toLowerCase()) ||
    //     item.role.toLowerCase().includes(text.toLowerCase())
    // );
    // setFilteredPlacements(filteredData);
  };

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    filterPlacements(searchText, branch);
  };

  const filterPlacements = (text = "", branch = "All") => {
    const filteredData = placements.filter((item) => {
      // Ensure all properties exist before calling .toLowerCase()
      const name = item.name ? item.name.toLowerCase() : "";
      const companyName = item.company_name ? item.company_name.toLowerCase() : "";
      const role = item.role ? item.role.toLowerCase() : "";

      const matchesSearch =
        name.includes(text.toLowerCase()) ||
        companyName.includes(text.toLowerCase()) ||
        role.includes(text.toLowerCase());


      const eligibleBranches = item.eligible_branch
        ? item.eligible_branch.toLowerCase().split(",")
        : [];

      const isBranchEligible =
        branch === "All" ||
        eligibleBranches.includes(branch.toLowerCase()) ||
        eligibleBranches.includes("open to all");

      return matchesSearch && isBranchEligible;
    });

    setFilteredPlacements(filteredData);
  };


  const navigateToDetails = (company_name, year, url) => {
    navigation.navigate("Details", { company_name, year, url });
  };

  const getImageUrl = (image) => {
    if (!image || !image.asset || !image.asset._ref) return null;

    // Extract the image ID and format from the _ref string
    const imageId = image.asset._ref.split("-")[1];
    const dimensions = image.asset._ref.split("-")[2];
    const format = image.asset._ref.split("-")[3];

    return `https://cdn.sanity.io/images/zltsypm6/production/${imageId}-${dimensions}.${format}`;
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigateToDetails(item.company_name, item.year, url)}
    >
      <View>
        <Image
          source={{ uri: getImageUrl(item.image) }}
          style={styles.companyLogo}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.detail}>Role: {item.role}</Text>
        <Text>On Campus</Text>
        <Text>Year : {item.year}</Text>
      </View>
      <View style={styles.iconsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleBookmark(item)}
        >
          <Icon
            name={bookmarkedPosts.some(post =>
              post.id === (item._id || `placement_${item.company_name}_${item.year}`) ||
              post._id === item._id
            ) ? "bookmark" : "bookmark-outline"}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            Linking.openURL(
              "https://www.instagram.com/md_iit_dhanbad?igsh=MXRjbml1emxmcmQwMg=="
            )
          }
        >
          <FontAwesomeIcon5 name="instagram" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="share-social-outline" size={20} color="#333" onPress={() => onShare(item)} />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.iconButton}>
          <Icon name="info" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="open-in-new" size={20} color="#333" />
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5733" />
        <Text style={styles.loadingText}>Loading, please wait...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search placements..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchText("");
            setFilteredPlacements(placements);
          }}
            style={styles.clearButton}>
            <Icon name="close" size={22} color="#777" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdowns for selecting year and branch */}
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          <Picker.Item label="2025" value="2025" />
          <Picker.Item label="2024" value="2024" />
          <Picker.Item label="2023" value="2023" />
          <Picker.Item label="2022" value="2022" />
          <Picker.Item label="2021" value="2021" />
          {/* <Picker.Item label="2020" value="2020" /> */}
        </Picker>

        <Picker
          selectedValue={selectedBranch}
          style={styles.picker}
          onValueChange={handleBranchChange}
        >
          <Picker.Item label="All Branches" value="All" />
          <Picker.Item label="CSE" value="CSE" />
          <Picker.Item label="ECE" value="ECE" />
          <Picker.Item label="EE" value="EE" />
          <Picker.Item label="CE" value="CE" />
          <Picker.Item label="EP" value="EP" />
          <Picker.Item label="ESE" value="ESE" />
          <Picker.Item label="FME" value="FME" />
          <Picker.Item label="ME" value="ME" />
          <Picker.Item label="MECH" value="MECH" />
          <Picker.Item label="MME" value="MME" />
          <Picker.Item label="PE" value="PE" />
          <Picker.Item label="MNC" value="MNC" />
          <Picker.Item label="AGL" value="AGL" />
          <Picker.Item label="AGP" value="AGP" />
        </Picker>
      </View>

      {filteredPlacements.length > 0 ? (
        <FlatList
          data={filteredPlacements}
          keyExtractor={(item, index) =>
            item._id
              ? item._id.toString()
              : `${item.company_name || "unknown"}_${item.year || "NA"}_${index}`
          }
          renderItem={renderCard}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No placements found for your search. Please try different keywords.
          </Text>
        </View>
      )}
    </View>
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
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  picker: {
    width: 150,
    backgroundColor: "#fff",
      color: "#333",   
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)", // light subtle border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    alignItems: "center",
  },

  companyLogo: {
    width: 100, // slightly smaller to match thin style
    height: 100,
    resizeMode: "contain",
    marginLeft: 8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#555",
  },
  cardcontainer: {
    padding: 20,
  },
  iconsContainer: {
    flexDirection: "column",
    backgroundColor: "#98DDFF",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 5,
    justifyContent: "center",
  },
  iconButton: {
    padding: 10,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    marginTop: 10,
    fontWeight: "bold",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    fontWeight: "bold",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 10,
    paddingHorizontal: 10,
  },

  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },

  clearButton: {
    padding: 6,
  },
});

export default PlacementList;