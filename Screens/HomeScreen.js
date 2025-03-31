import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity"; // Ensure your Sanity client is properly configured

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
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
      }...${currentPage * postsPerPage}] {_id, title, body}`;
      const result = await client.fetch(query);

      if (result.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...result]);
        setCurrentPage((prevPage) => prevPage + 1);
      } else {
        setHasMorePosts(false); // No more posts to fetch
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      {/* Card Left Side */}
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCategory}>Category</Text>
        <Text style={styles.cardDescription}>
          {item.body?.[0]?.children?.map((child) => child.text).join(" ") ||
            "No content available"}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardLabel}>Campus Daemon</Text>
          <Text style={styles.cardTime}>Just now</Text>
        </View>
      </View>

      {/* Colored Bar + Icons */}
      <View style={[styles.sideBarContainer, { backgroundColor: "#FFC5C5" }]}>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.iconButton}>
          <Icon name="menu-outline" size={24} color="#333" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>
        <View style={styles.headerRightIcons}>
          {/* <TouchableOpacity style={styles.iconButton}>
            <Icon name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* List of Posts */}
      {isLoading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={posts}
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

      {/* Floating Action Button */}
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
    paddingBottom: 0, // Space for Floating Button
  },

  /* Header Styles */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    // elevation: 2,
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

  /* Icon Button */
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  /* List Content */
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for Floating Button
  },

  /* Card Styles */
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 6,
    // elevation: 3,
  },

  cardTextContainer: {
    flex: 3,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  /* Titles = Header (20), Paragraph (14), Tags (10) */
  cardTitle: {
    fontSize: 17, // Treat card title as a "header"
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },

  cardCategory: {
    fontSize: 10, // Treat category as a "tag"
    fontStyle: "italic",
    color: "#666",
    marginBottom: "10px",
  },
});
