import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

let url = "";

// Function to fetch placement data based on the selected year
const fetchPlacementData = async (year) => {
  if (year === "2024") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202024%5D";
  } else if (year === "2023") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202023%5D";
  } else if (year === "2022") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202022%5D";
  } else if (year === "2021") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202021%5D";
  } else if (year === "2020") {
    url =
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5Byear%20%3D%3D%202020%5D";
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
        setPlacements(data);
        setFilteredPlacements(data);
      } catch (error) {
        console.error("Error fetching placement data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [selectedYear]);

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredData = placements.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.company_name.toLowerCase().includes(text.toLowerCase()) ||
        item.role.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPlacements(filteredData);
  };

  // Updated: Pass company_name (not id) to the Details screen
  const navigateToDetails = (company_name, year) => {
    navigation.navigate("Details", { company_name, year, url });
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigateToDetails(item.company_name, item.year)}
    >
      <View>
        <Image source={{ uri: item.imageUrl }} style={styles.companyLogo} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.detail}>Role: {item.role}</Text>
        <Text>On Campus</Text>
        <Text>Year: {item.year}</Text>
      </View>
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="bookmark-border" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="share" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="info" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="open-in-new" size={20} color="#fff" />
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
          onValueChange={(itemValue) => setSelectedBranch(itemValue)}
        >
          <Picker.Item label="All Branches" value="All" />
          <Picker.Item label="CSE" value="CSE" />
          <Picker.Item label="ECE" value="ECE" />
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
    paddingLeft: 10,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  companyLogo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
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
  iconsContainer: {
    flexDirection: "column",
    backgroundColor: "#98DDFF",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 5,
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
