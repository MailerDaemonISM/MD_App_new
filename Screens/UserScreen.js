import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Share
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import { client } from "../sanity";
import styles from "./HomeScreen.style";
import { useIsFocused } from "@react-navigation/native";
import { hashtags as hashtagData } from "./hashtags";

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



const UserScreen = () => {
  const { user } = useUser();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDocId, setUserDocId] = useState(null);
  const isFocused = useIsFocused();

  const fetchSavedPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const query = `
        *[_type == "user" && clerkId == $clerkId][0]{
          _id,
          saved_post[]->{
            _id,
            title,
            body,
            images[]{asset->{url}},
            _createdAt,
            hashtags[]->{_id, hashtag}
          }
        }
      `;
      const data = await client.fetch(query, { clerkId: user.id });
      setSavedPosts(data?.saved_post || []);
      setUserDocId(data?._id);
    } catch (err) {
      console.error("Error fetching saved posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchSavedPosts();
  }, [isFocused, user]);

  const toggleSavePost = async (postId) => {
    if (!userDocId) return;
    try {
      const alreadySaved = savedPosts.some((p) => p._id === postId);

      if (alreadySaved) {
        setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
        await client
          .patch(userDocId)
          .unset([`saved_post[_ref=="${postId}"]`])
          .commit();
      } else {
        setSavedPosts((prev) => [...prev, { _id: postId }]);
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
  const sideBarColor = hashtagColorMap[firstTag] || "#ddd"; //default grey
    return (
      <View style={styles.cardContainer}>
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

        {/* Sidebar container */}
        <View
            style={{
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
          <TouchableOpacity style={styles.iconButton} onPress={() => handleShare(item)}>
            <Icon name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
