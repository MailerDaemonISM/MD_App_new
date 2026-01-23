import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Share,
  BackHandler,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import LostFoundForm from "../components/lostnfoundform";
import { client } from "../sanity";
import { useUser } from "@clerk/clerk-expo";
import { Linking } from "react-native";

export default function MDLostnFound() {
  const { user } = useUser();

  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());

  const fetchPosts = async () => {
    const res = await client.fetch(`
      *[_type == "post" && "#MDLostAndFound" in hashtags[]->hashtag]
      | order(_createdAt desc) {
        _id,
        title,
        body,
        images[]{asset->{url}},
        _createdAt,
        hashtags[]->{hashtag}
      }
    `);
    setPosts(res);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (selectedPost) {
        setSelectedPost(null);
        return true;
      }
      if (showModal) {
        setShowModal(false);
        return true;
      }
      return false;
    };

    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => handler.remove();
  }, [showModal, selectedPost]);

  useEffect(() => {
    if (!user) return;

    const fetchBookmarks = async () => {
      const data = await client.fetch(
        `*[_type=="user" && clerkId==$clerkId][0]{ saved_post[]->{_id} }`,
        { clerkId: user.id }
      );

      if (data?.saved_post) {
        setBookmarkedPosts(new Set(data.saved_post.map(p => p._id)));
      }
    };

    fetchBookmarks();
  }, [user]);

  const fetchSanityUserId = async (clerkId) =>
    await client.fetch(
      `*[_type=="user" && clerkId==$clerkId][0]{_id}`,
      { clerkId }
    );

  const handleBookmark = async (postId, clerkId) => {
    if (!clerkId) return;

    const userDoc = await fetchSanityUserId(clerkId);
    const sanityUserId = userDoc?._id;
    if (!sanityUserId) return;

    const alreadySaved = bookmarkedPosts.has(postId);

    setBookmarkedPosts(prev => {
      const updated = new Set(prev);
      alreadySaved ? updated.delete(postId) : updated.add(postId);
      return updated;
    });

    if (alreadySaved) {
      await client
        .patch(sanityUserId)
        .unset([`saved_post[_ref=="${postId}"]`])
        .commit();
    } else {
      await client
        .patch(sanityUserId)
        .setIfMissing({ saved_post: [] })
        .append("saved_post", [{ _type: "reference", _ref: postId }])
        .commit();
    }
  };

  const handleShare = async (post) => {
    const message = `${post.title}\n\n${
      Array.isArray(post.body)
        ? post.body
            .map(b => b.children?.map(c => c.text).join(""))
            .join("\n")
        : post.body
    }`;
    await Share.share({ message });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setSelectedPost(item)}
    >
      <View style={styles.cardContainer}>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          <Text style={styles.cardDescription} numberOfLines={3}>
            {Array.isArray(item.body)
              ? item.body
                  .map(b => b.children?.map(c => c.text).join(""))
                  .join(" ")
              : item.body}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardLabel}>
              {item.hashtags?.map(t => t.hashtag).join(", ")}
            </Text>
            <Text style={styles.cardTime}>
              {new Date(item._createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.sideBarContainer}>
          <TouchableOpacity onPress={() => handleBookmark(item._id, user?.id)}>
            <Icon
              name={
                bookmarkedPosts.has(item._id)
                  ? "bookmark"
                  : "bookmark-outline"
              }
              size={20}
              color="#333"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.instagram.com/md_iit_dhanbad")
            }
          >
            <FontAwesomeIcon5 name="instagram" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleShare(item)}>
            <Icon name="share-social-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide">
        <LostFoundForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchPosts}
        />
      </Modal>
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedPost(null)}
          />
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>

              {selectedPost?.images?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedPost.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img.asset.url }}
                      style={styles.modalImage}
                    />
                  ))}
                </ScrollView>
              )}

              <Text style={styles.modalDescription}>
                {Array.isArray(selectedPost?.body)
                  ? selectedPost.body
                      .map(b =>
                        b.children?.map(c => c.text).join("")
                      )
                      .join("\n\n")
                  : selectedPost?.body}
              </Text>

              <Text style={styles.modalHashtags}>
                {selectedPost?.hashtags?.map(t => t.hashtag).join("\n")}
              </Text>

              <Text style={styles.modalTime}>
                {new Date(selectedPost?._createdAt).toLocaleString()}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  cardTextContainer: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  cardDescription: { fontSize: 13, color: "#444", marginBottom: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  cardLabel: { fontSize: 11, color: "#999" },
  cardTime: { fontSize: 11, color: "#999" },

  sideBarContainer: {
    width: 48,
    backgroundColor: "#F2994A",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalDescription: { fontSize: 14, lineHeight: 20, marginVertical: 10 },
  modalHashtags: { color: "#666", marginTop: 10 },
  modalTime: { fontSize: 11, color: "#999", marginTop: 6 },
  modalImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginRight: 10,
  },
});
