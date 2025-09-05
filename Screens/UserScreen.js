import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import { client } from "../sanity";
import styles from "./HomeScreen.style"; // flatlist card style same as posts on homescreen
import { useIsFocused } from "@react-navigation/native";

const UserScreen = () => {
  const { user } = useUser();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const fetchSavedPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const query = `
        *[_type == "user" && clerkId == $clerkId][0]{
          saved_post[]->{
            _id,
            title,
            body,
            images[]{asset->{url}},
            _createdAt,
            hashtags[]->{
              _id,
              hashtag
            }
          }
        }
      `;
      const data = await client.fetch(query, { clerkId: user.id });
      setSavedPosts(data?.saved_post || []);
    } catch (err) {
      console.error("Error fetching saved posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch whenever screen becomes active
  useEffect(() => {
    if (isFocused) {
      fetchSavedPosts();
    }
  }, [isFocused, user]);

  const renderItem = ({ item }) => {
    // extract description text from body
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

    return (
      // home screen card design
      <View style={styles.cardContainer}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text
            numberOfLines={3}
            ellipsizeMode="tail"
            style={styles.cardDescription}
          >
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

        {/* sidebar icons same as HomeScreen */}
        <View style={styles.sideBarContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="bookmark" size={20} color="#333" />
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📌 Saved Posts</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      ) : savedPosts.length === 0 ? (
        <Text style={{ padding: 16 }}>No saved posts yet.</Text>
      ) : (
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
};

export default UserScreen;
