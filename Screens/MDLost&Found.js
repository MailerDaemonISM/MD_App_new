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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import LostFoundForm from "../components/lostnfoundform";
import { getMDLostFoundPosts } from "../api/lost_found";

export default function MDLostnFound() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await getMDLostFoundPosts();
      setPosts(res);
    } catch (err) {
      Alert.alert("Error", "Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleShare = (item) => {
    Alert.alert("Share", `Share: ${item.title}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      {/* MAIN CARD */}
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.body}
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

      {/* ORANGE SIDE BAR */}
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
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* MODAL */}
<Modal
  visible={showModal}
  animationType="slide"
  onRequestClose={() => setShowModal(false)}
>
  <LostFoundForm
    onClose={() => setShowModal(false)}
    onSuccess={fetchPosts}
  />
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
});
