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
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
let url = "";
// Function to fetch placement data based on the selected year
const fetchPlacementData = async (year) => {
  if (year === "2024") {
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
  } else if (year == "2020") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202020%5D%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A";
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
  const onShare = async (post) => {
    try {
      await Share.share({
        title: post.title,
        message:
          `${post.title}\n\n${
            post.body?.[0]?.children?.map((child) => child.text).join(" ") ||
            "No content available"
          }\n\nShared via Mailer Daemon`,
      });
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

const PlacementList = () => {
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedBranch, setSelectedBranch] = useState("All");
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
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="bookmark-border" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="share" size={20} color="#333" onPress={() => onShare(item)} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="info" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="open-in-new" size={20} color="#333" />
        </TouchableOpacity>
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
      <TextInput
        style={styles.searchBar}
        placeholder="Search placements..."
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Dropdowns for selecting year and branch */}
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          <Picker.Item label="2024" value="2024" />
          <Picker.Item label="2023" value="2023" />
          <Picker.Item label="2022" value="2022" />
          <Picker.Item label="2021" value="2021" />
          <Picker.Item label="2020" value="2020" />
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
          keyExtractor={(item) => item.id}
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
});

export default PlacementList;