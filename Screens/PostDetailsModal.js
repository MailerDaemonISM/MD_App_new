import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import Modal from "react-native-modal";

const PostDetailsModal = ({ isVisible, onClose, post }) => {
  if (!post) return null;

  const description =
    post.body?.[0]?.children?.map((child) => child.text).join(" ") || "";

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header} />
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.date}>
            {new Date(post._createdAt).toLocaleString()}
          </Text>

          {/* Show Image only if present */}
          {post.images && post.images.length > 0 && (
            <Image
              source={{ uri: post.images[0].asset?.url }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <Text style={styles.description}>{description}</Text>

          <Text style={styles.hashtagsTitle}>Hashtags:</Text>
          {post.hashtags?.length ? (
            post.hashtags.map((tag) => (
              <Text key={tag._id} style={styles.hashtag}>
                #{tag.hashtag}
              </Text>
            ))
          ) : (
            <Text style={styles.noHashtags}>No hashtags</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default PostDetailsModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    alignSelf: "center",
    borderRadius: 3,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 15,
    lineHeight: 20,
  },
  hashtagsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  hashtag: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  noHashtags: {
    fontSize: 14,
    color: "#999",
  },
});
