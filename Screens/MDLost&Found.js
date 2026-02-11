import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import LostFoundForm from "../components/lostnfoundform";
import { client } from "../sanity"; // your sanity client

export default function MDLostnFound() {
  const [posts, setPosts] = useState([]); // store all #MDLostAndFound posts
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null); // for post details modal
  const [isLoading, setIsLoading] = useState(false);

  // Fetch #MDLostAndFound posts from Sanity
  const fetchPosts = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const query = `*[_type == "post" && "${"#MDLostAndFound"}" in hashtags[]->.hashtag] | order(_createdAt desc){
        _id, title, body, images[]{asset->{url}}, _createdAt, hashtags[]->{ _id, hashtag }
      }`;
      const result = await client.fetch(query);

      // Remove duplicates if needed
      const uniqueResult = Array.from(new Map(result.map((p) => [p._id, p])).values());
      setPosts(uniqueResult);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  const handleShare = (item) => {
    Alert.alert("Share", `Share: ${item.title}`);
  };

  // Convert Sanity Portable Text to plain string
  const getPlainText = (blocks) => {
    if (!blocks) return "";
    return blocks
      .map((block) => block.children?.map((child) => child.text).join("") || "")
      .join("\n\n");
  };

  const renderItem = ({ item }) => {
    const description = getPlainText(item.body);
    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => setSelectedPost(item)}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
          <Text style={styles.hashtag}>#MDLostAndFound</Text>
          <Text style={styles.time}>
            {new Date(item._createdAt).toLocaleDateString()}{" "}
            {new Date(item._createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.sideBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              Linking.openURL(
                "https://www.instagram.com/md_iit_dhanbad?igsh=MXRjbml1emxmcmQwMg=="
              )
            }
          >
            <FontAwesome5 name="instagram" size={18} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleShare(item)}
          >
            <Icon name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isLoading}
        onRefresh={() => fetchPosts()}
      />

      {/* ADD POST BUTTON */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowFormModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL: Add Post */}
      <Modal
        visible={showFormModal}
        animationType="slide"
        onRequestClose={() => setShowFormModal(false)}
      >
        <LostFoundForm
          onClose={() => setShowFormModal(false)}
          onSuccess={() => fetchPosts(false)}
        />
      </Modal>

      {/* MODAL: Post Details */}
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedPost(null)} />
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
              {selectedPost?.images?.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img.asset.url }}
                  style={{ width: "100%", height: 200, marginBottom: 10, borderRadius: 10 }}
                />
              ))}
              <Text style={styles.modalDescription}>
                {Array.isArray(selectedPost?.body)
                  ? selectedPost.body
                      .map((b) => b.children?.map((c) => c.text).join(""))
                      .join("\n\n")
                  : selectedPost?.body}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: "row",
    marginBottom: 14,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
  },
  card: {
    flex: 1,
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#444",
    marginBottom: 6,
  },
  hashtag: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: "#aaa",
  },
  sideBar: {
    width: 44,
    backgroundColor: "#EEA052",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  iconButton: {
    paddingVertical: 6,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#22c55e",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#444",
  },
});