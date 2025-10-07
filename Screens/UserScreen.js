import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Image,
  StyleSheet
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import { client } from "../sanity";
import styles from "./HomeScreen.style";
import { useIsFocused } from "@react-navigation/native";
import { hashtags as hashtagData } from "./hashtags";
import AsyncStorage from "@react-native-async-storage/async-storage";

const hashtagColorMap = hashtagData.reduce((map, tag) => {
  map[tag.title] = tag.color;
  return map;
}, {});

const handleShare = async (post) => {
  try {
    const message = `${post.title}\n\n${
      Array.isArray(post.body)
        ? post.body
            .map((block) =>
              Array.isArray(block.children)
                ? block.children.map((child) => child.text).join("")
                : ""
            )
            .join("\n\n")
        : typeof post.body === "string"
        ? post.body
        : ""
    }`;

    await Share.share({ message });
  } catch (error) {
    console.error("Error sharing post:", error);
  }
};

const getImageUrl = (image) => {
  if (!image || !image.asset || !image.asset._ref) return null;
  const parts = image.asset._ref.split("-");
  const imageId = parts[1];
  const dimensions = parts[2];
  const format = parts[3];
  return `https://cdn.sanity.io/images/zltsypm6/production/${imageId}-${dimensions}.${format}`;
};

const getUserSpecificKey = (userId) => {
  return `placementBookmarks_${userId}`;
};

const UserScreen = () => {
  const { user } = useUser();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDocId, setUserDocId] = useState(null);
  const [placementBookmarks, setPlacementBookmarks] = useState([]);
  const isFocused = useIsFocused();

  const fetchSavedPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const query = `*[_type == "user" && clerkId == $clerkId][0]{
        _id,
        saved_post[]->{
          _id,
          title,
          body,
          images[]{asset->{url}},
          _createdAt,
          hashtags[]->{_id, hashtag}
        }
      }`;
      const data = await client.fetch(query, { clerkId: user.id });
      setSavedPosts(data?.saved_post || []);
      setUserDocId(data?._id);
    } catch (err) {
      console.error("Error fetching saved posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacementBookmarks = async () => {
    if (!user) return;
    try {
      const userKey = getUserSpecificKey(user.id);
      const bookmarks = await AsyncStorage.getItem(userKey);
      if (bookmarks) {
        setPlacementBookmarks(JSON.parse(bookmarks));
      }
    } catch (error) {
      console.error("Error loading placement bookmarks:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchSavedPosts();
      fetchPlacementBookmarks();
    }
  }, [isFocused, user]);

  const toggleSavePost = async (postId) => {
    if (!userDocId) return;
    try {
      const alreadySaved = savedPosts.some((p) => p._id === postId);
      setSavedPosts((prev) =>
        alreadySaved
          ? prev.filter((p) => p._id !== postId)
          : [...prev, { _id: postId }]
      );

      if (alreadySaved) {
        await client
          .patch(userDocId)
          .unset([`saved_post[_ref=="${postId}"]`])
          .commit();
      } else {
        await client
          .patch(userDocId)
          .setIfMissing({ saved_post: [] })
          .append("saved_post", [{ _type: "reference", _ref: postId }])
          .commit();
      }
    } catch (err) {
      console.error("Error toggling saved post:", err);
      fetchSavedPosts();
    }
  };

  const togglePlacementBookmark = async (item) => {
    if (!user) return;
    try {
      const userKey = getUserSpecificKey(user.id);
      const isBookmarked = placementBookmarks.some((post) => post.id === item.id);
      let updatedBookmarks;

      if (isBookmarked) {
        updatedBookmarks = placementBookmarks.filter((post) => post.id !== item.id);
      } else {
        updatedBookmarks = [...placementBookmarks, item];
      }

      await AsyncStorage.setItem(userKey, JSON.stringify(updatedBookmarks));
      setPlacementBookmarks(updatedBookmarks);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Regular saved post card (news/posts)
  const renderItem = ({ item }) => {
    const description = Array.isArray(item.body)
      ? item.body
          .map((block) =>
            Array.isArray(block.children)
              ? block.children.map((child) => child.text).join("")
              : ""
          )
          .join("\n\n")
      : typeof item.body === "string"
      ? item.body
      : "";

    const firstTag = item.hashtags?.[0]?.hashtag;
    const sideBarColor = hashtagColorMap[firstTag] || "#ddd";

    return (
      <View style={styleshome.cardContainer}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text numberOfLines={3} style={styles.cardDescription}>
            {description || "No content available"}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardLabel}>
              {item.hashtags?.length
                ? item.hashtags.map((t) => t.hashtag).join(", ")
                : "No hashtags"}
            </Text>
            <Text style={styles.cardTime}>
              {new Date(item._createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "column",
            width: 50,
            justifyContent: "space-around",
            alignItems: "center",
            paddingVertical: 12,
            backgroundColor: sideBarColor,
          }}
        >
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => toggleSavePost(item._id)}
          >
            <Icon
              name={
                savedPosts.some((p) => p._id === item._id)
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesomeIcon5 name="instagram" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleShare(item)}
          >
            <Icon name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Placement flatlists
  const renderPlacementCard = ({ item }) => {
    const isBookmarked = placementBookmarks.some((post) => post.id === item.id);

    return (
      <View style={placementStyles.card}>
        <Image
          source={{ uri: getImageUrl(item.image) }}
          style={placementStyles.companyLogo}
        />
        <View style={placementStyles.cardContent}>
          <Text style={placementStyles.title}>{item.name}</Text>
          <Text style={placementStyles.detail}>Role: {item.role}</Text>
          <Text>On Campus</Text>
          <Text>Year: {item.year}</Text>
        </View>
        <View style={placementStyles.iconsContainer}>
          <TouchableOpacity
            style={placementStyles.iconButton}
            onPress={() => togglePlacementBookmark(item)}
          >
            <Icon
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesomeIcon5 name="instagram" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={placementStyles.iconButton}
            onPress={() => handleShare(item)}
          >
            <Icon name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={placementStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5733" />
        <Text style={placementStyles.loadingText}>
          Loading saved content...
        </Text>
      </View>
    );
  }

  return (
    <View style={placementStyles.container}>
      <FlatList
        data={[...savedPosts, ...placementBookmarks]}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => {
          if (item.company_name || item.name) {
            return renderPlacementCard({ item });
          } else {
            return renderItem({ item });
          }
        }}
        ListEmptyComponent={() => (
          <Text style={placementStyles.noResultsText}>
            No saved posts or placements yet.
          </Text>
        )}
      />
    </View>
  );
};

// Home screen styles for posts
const styleshome = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    marginVertical: 8,
    marginHorizontal: 10,
    overflow: "hidden",
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 7,
  },
});

// Placement list styles
const placementStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    marginVertical: 8,
    marginHorizontal: 10,
    overflow: "hidden",
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 7,
    alignItems: "center",
  },
  companyLogo: {
    width: 100,
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
  iconsContainer: {
    width: 50,
    justifyContent: "space-around",
    backgroundColor: "#98DDFF",
    alignItems: "center",
    paddingVertical: 12,
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
  noResultsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 20,
  },
});

export default UserScreen;
