import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";

const colorCycle = ["#FFC5C5", "#FFD59D", "#FECACA", "#CDFAFF"];

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const postsPerPage = 5;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (isLoading || !hasMorePosts) return;

    setIsLoading(true);
    try {
      const query = `*[_type == "post"] | order(_createdAt desc) [${
        (currentPage - 1) * postsPerPage
      }...${currentPage * postsPerPage}] {
        _id, title, body, _createdAt
      }`;

      const result = await client.fetch(query);

      if (result.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...result]);
        setCurrentPage((prevPage) => prevPage + 1);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const description =
      item.body?.[0]?.children?.map((child) => child.text).join(" ") || "";

    const sideBarColor = colorCycle[index % 4];

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardCategory}>Category</Text>
          <Text numberOfLines={3} ellipsizeMode="tail" style={styles.cardDescription}>
            {description || "No content available"}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardLabel}>Campus Daemon</Text>
            <Text style={styles.cardTime}>
              {new Date(item._createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={[styles.sideBarContainer, { backgroundColor: sideBarColor }]}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="bookmark-outline" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesomeIcon5 name="facebook-f" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)} style={styles.iconButton}>
            <Icon name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <TextInput
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBox}
        />
      )}

      {isLoading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          onEndReachedThreshold={0.5}
          onEndReached={fetchPosts}
          ListFooterComponent={
            isLoading && (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#0000ff" />
                <Text>Loading more posts...</Text>
              </View>
            )
          }
        />
      )}

      <FloatingButton />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerRightIcons: {
    flexDirection: "row",
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchBox: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderColor: "#ddd",       
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,           
    shadowRadius: 4,
    elevation: 3,                 
  },
  cardTextContainer: {
    flex: 3,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  
  },
  cardLabel: {
    fontSize: 12,
    color: "#888",
  },
  cardTime: {
    fontSize: 12,
    color: "#888",
  },
  sideBarContainer: {
    width: 50,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
