import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Share, // <-- import Share API
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";

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
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
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

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      {/* Card Left Side */}
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCategory}>Category</Text>
        <Text
          style={styles.cardDescription}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
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
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onShare(item)} // <-- share handler
        >
          <Icon name="share-social-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>
        <View style={styles.headerRightIcons}></View>
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
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
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
    color: "#555",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: "#777",
  },
  cardTime: {
    fontSize: 12,
    color: "#777",
  },
  sideBarContainer: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    padding: 10,
    alignItems: "center",
  },
});
