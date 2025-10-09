// HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Share,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";
import styles from "./HomeScreen.style";
import { hashtags as hashtagData } from "./hashtags";
import { useUser } from "@clerk/clerk-expo";
import { setUserIfNotExists } from "../api/user";
import NotificationButton from "../components/notification";
import { Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react/cjs/react.development";

const hashtagColorMap = hashtagData.reduce((map, tag) => {
  map[tag.title] = tag.color;
  return map;
}, {});

const HomeScreen = () => {
  const [allPosts, setAllPosts] = useState([]); 
  const [visiblePosts, setVisiblePosts] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedHashtag, setSelectedHashtag] = useState("All");
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const postsPerPage = 5;

  // Clerk auth user
  const { isSignedIn, user } = useUser();

  // Fetch user bookmarks
 useFocusEffect(
  useCallback(() => {
    const fetchUserBookmarks = async () => {
      if (!isSignedIn || !user) return;
      try {
        const query = `*[_type=="user" && clerkId==$clerkId][0]{
          saved_post[]->{ _id }
        }`;
        const data = await client.fetch(query, { clerkId: user.id });
        if (data?.saved_post) {
          setBookmarkedPosts(new Set(data.saved_post.map((p) => p._id)));
        } else {
          setBookmarkedPosts(new Set());
        }
      } catch (err) {
        console.error("Error fetching user bookmarks:", err);
      }
    };

    fetchUserBookmarks();
  }, [isSignedIn, user])
);


  // Fetch ALL posts once
  useEffect(() => {
    const fetchAllPosts = async () => {
      setIsLoading(true);
      try {
        const query = `*[_type == "post"] | order(_createdAt desc) {
          _id,
          title,
          body,
          images[]{asset->{url}},
          _createdAt,
          hashtags[]->{ _id, hashtag }
        }`;
        const result = await client.fetch(query);
        setAllPosts(result);
        setVisiblePosts(result.slice(0, postsPerPage));
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  // Load more posts locally
  const loadMorePosts = () => {
    const nextPage = currentPage + 1;
    const start = (nextPage - 1) * postsPerPage;
    const end = nextPage * postsPerPage;
    const newPosts = allPosts.slice(start, end);

    if (newPosts.length > 0) {
      setVisiblePosts((prev) => [...prev, ...newPosts]);
      setCurrentPage(nextPage);
    }
  };

  // share
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

  // get sanity userId from clerkId
  const fetchSanityUserId = async (clerkId) => {
    const query = `*[_type == "user" && clerkId == $clerkId][0]{ _id }`;
    return await client.fetch(query, { clerkId });
  };

  // toggle bookmark button
  const handleBookmark = async (postId, clerkId) => {
    if (!clerkId) return;
    try {
      const userDoc = await fetchSanityUserId(clerkId);
      const sanityUserId = userDoc?._id;
      if (!sanityUserId) return;

      const alreadySaved = bookmarkedPosts.has(postId);

      // Optimistic UI update
      setBookmarkedPosts((prev) => {
        const updated = new Set(prev);
        if (alreadySaved) updated.delete(postId);
        else updated.add(postId);
        return updated;
      });

      if (alreadySaved) {
        // Remove bookmark in Sanity
        await client
          .patch(sanityUserId)
          .unset([`saved_post[_ref=="${postId}"]`])
          .commit();
      } else {
        // Add bookmark in Sanity
        await client
          .patch(sanityUserId)
          .setIfMissing({ saved_post: [] })
          .append("saved_post", [{ _type: "reference", _ref: postId }])
          .commit();
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
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
    const sideBarColor = hashtagColorMap[firstTag] || "#ddd";

    return (
      <TouchableOpacity onPress={() => setSelectedPost(item)}>
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

          <View
            style={[styles.sideBarContainer, { backgroundColor: sideBarColor }]}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleBookmark(item._id, user?.id)}
            >
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
                      style={styles.iconButton}
                      onPress={() =>
                        Linking.openURL(
                          "https://www.instagram.com/md_iit_dhanbad?igsh=MXRjbml1emxmcmQwMg=="
                        )
                      }
                  > 
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
      </TouchableOpacity>
    );
  };

 // Filter by search and hashtag
const filteredPosts = allPosts.filter((post) => {
  const matchesSearch = (post.title || "")
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
  const matchesHashtag =
    selectedHashtag === "All" ||
    post.hashtags?.some((tag) => tag.hashtag === selectedHashtag);
  return matchesSearch && matchesHashtag;
});

//all posts should be rendered
const postsToRender =
  searchQuery || selectedHashtag !== "All" ? filteredPosts : visiblePosts;

  const allHashtags = Array.from(
    new Set(allPosts.flatMap((p) => p.hashtags?.map((t) => t.hashtag) || []))
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            onPress={() => setSearchVisible(!searchVisible)}
            style={styles.iconButton}
          >
            <Icon name="search-outline" size={26} color="#333" />
          </TouchableOpacity>
          <NotificationButton />
        </View>
      </View>

  {searchVisible && (
  <View style={styles.searchContainer}>
    <TextInput
      placeholder="Search posts..."
      value={searchQuery}
      onChangeText={setSearchQuery}
      style={styles.searchBox}
    />
    {searchQuery.length > 0 && (
      <TouchableOpacity
        onPress={() => setSearchQuery("")}
        style={styles.clearButton}
      >
        <Icon name="close" size={22} color="#777" />
      </TouchableOpacity>
    )}
  </View>
)}
      {isLoading && visiblePosts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      ) : (
        <FlatList
          data={postsToRender}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          onEndReachedThreshold={0.5}
          onEndReached={
            !searchQuery && selectedHashtag === "All" ? loadMorePosts : null
          }
          ListFooterComponent={
            !searchQuery && selectedHashtag === "All" && isLoading ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#333" />
                <Text>Loading more posts...</Text>
              </View>
            ) : null
          }
        />
      )}

      <FloatingButton
        hashtags={allHashtags}
        selectedHashtag={selectedHashtag}
        onSelectHashtag={setSelectedHashtag}
      />

      {/* Post Modal */}
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
            <ScrollView
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
              {selectedPost?.images?.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  decelerationRate="fast"
                  snapToInterval={260}
                  nestedScrollEnabled
                  style={{ marginVertical: 10 }}
                >
                  {selectedPost.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img.asset.url }}
                      style={{
                        width: 250,
                        aspectRatio: 1,
                        borderRadius: 10,
                        marginRight: 10,
                      }}
                      resizeMode="contain"
                    />
                  ))}
                </ScrollView>
              )}
              <Text style={styles.modalDescription}>
                {Array.isArray(selectedPost?.body)
                  ? selectedPost.body
                      .map((block) =>
                        Array.isArray(block.children)
                          ? block.children.map((child) => child.text).join("")
                          : ""
                      )
                      .join("\n\n")
                  : typeof selectedPost?.body === "string"
                  ? selectedPost.body
                  : "No content available"}
              </Text>
              <Text style={styles.modalHashtags}>
                {selectedPost?.hashtags?.length
                  ? selectedPost.hashtags
                      .map((tag) => `${tag.hashtag}`)
                      .join("\n")
                  : "No hashtags"}
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
};

export default HomeScreen;
