// HomeScreen.js
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useEffect, useRef, useState, useCallback } from "react";
import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  StyleSheet,
  Animated,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";
import { hashtags as hashtagData } from "./hashtags";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";

// Create hashtag color map
const hashtagColorMap = hashtagData.reduce((map, tag) => {
  map[tag.title] = tag.color;
  return map;
}, {});

const getUserSpecificKey = (userId) => {
  return `postBookmarks_${userId}`;
};

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
  const [userDocId, setUserDocId] = useState(null);
  const postsPerPage = 5;
  const [refreshing, setRefreshing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const route = useRoute();
  const postId = route.params?.postId;

  const { isSignedIn, user } = useUser();

  // Fetch user bookmarks and document ID
  useFocusEffect(
    useCallback(() => {
      const fetchUserBookmarks = async () => {
        if (!isSignedIn || !user) return;
        try {
          const query = `*[_type=="user" && clerkId==$clerkId][0]{
            _id,
            saved_post[]->{ _id }
          }`;
          const data = await client.fetch(query, { clerkId: user.id });
          setUserDocId(data?._id);
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

  useEffect(() => {
    fetchAllPosts();
  }, []);

  // Toggle bookmark
  const toggleBookmark = async (postId) => {
    if (!userDocId || !user) return;
    
    try {
      const isBookmarked = bookmarkedPosts.has(postId);
      
      // Update local state immediately
      setBookmarkedPosts((prev) => {
        const newSet = new Set(prev);
        if (isBookmarked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      // Update Sanity
      if (isBookmarked) {
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
      console.error("Error toggling bookmark:", err);
      // Revert on error
      setBookmarkedPosts((prev) => {
        const newSet = new Set(prev);
        if (bookmarkedPosts.has(postId)) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
    }
  };

  // Share button handler
  const onShare = async (post) => {
    try {
      const bodyText = Array.isArray(post.body)
        ? post.body
            .map((block) =>
              Array.isArray(block.children)
                ? block.children.map((child) => child.text).join("")
                : ""
            )
            .join("\n\n")
        : typeof post.body === "string"
        ? post.body
        : "";

      await Share.share({
        title: post.title,
        message: `${post.title}\n\n${bodyText}\n\nShared via Mailer Daemon`,
      });
    } catch (error) {
      console.error("Error sharing post:", error);
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
    const sideBarColor = hashtagColorMap[firstTag] || "#FFC5C5";
    const hasImages =
      Array.isArray(item.images) && item.images.some((img) => img?.asset?.url);
    const isBookmarked = bookmarkedPosts.has(item._id);

    return (
      <TouchableOpacity onPress={() => setSelectedPost(item)}>
        <View
          style={[
            styles.cardContainer,
            hasImages && { paddingBottom: 0 },
          ]}
        >
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCategory}>Category</Text>

            <Text
              style={styles.cardDescription}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {description || "No content available"}
            </Text>

            {/* Horizontal image scroller */}
            {hasImages && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10, marginBottom: 6 }}
                contentContainerStyle={{ paddingRight: 16 }}
                pagingEnabled
                decelerationRate="fast"
              >
                {item.images.map((img, idx) => {
                  const imageUrl = img?.asset?.url;
                  if (!imageUrl) return null;

                  if (idx === 2 && item.images.length > 3) {
                    return (
                      <View
                        key={idx}
                        style={{ position: "relative", marginRight: 8 }}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 10,
                            backgroundColor: "#fff",
                          }}
                          resizeMode="contain"
                        />
                        <View
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: 70,
                            height: 70,
                            borderRadius: 10,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            +{item.images.length - 3}
                          </Text>
                        </View>
                      </View>
                    );
                  }
                  if (idx > 2) return null;

                  return (
                    <Image
                      key={idx}
                      source={{ uri: imageUrl }}
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 10,
                        marginRight: 8,
                        backgroundColor: "#fff",
                      }}
                      resizeMode="contain"
                    />
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.cardFooter}>
              <View>
                {item.hashtags?.length ? (
                  item.hashtags.map((t, i) => (
                    <Text key={i} style={styles.cardLabel}>
                      {t.hashtag}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.cardLabel}>No hashtags</Text>
                )}
              </View>
              <Text style={styles.cardTime}>
                {new Date(item._createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Colored Bar + Icons */}
          <View
            style={[styles.sideBarContainer, { backgroundColor: sideBarColor }]}
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => toggleBookmark(item._id)}
            >
              <Icon
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
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
              onPress={() => onShare(item)}
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

  const postsToRender =
    searchQuery || selectedHashtag !== "All" ? filteredPosts : visiblePosts;

  const allHashtags = Array.from(
    new Set(allPosts.flatMap((p) => p.hashtags?.map((t) => t.hashtag) || []))
  );

  const loadMorePosts = () => {
    if (isLoading) return;

    const nextPage = currentPage + 1;
    const start = (nextPage - 1) * postsPerPage;
    const end = start + postsPerPage;

    const nextPosts = allPosts.slice(start, end);

    if (nextPosts.length > 0) {
      setVisiblePosts((prev) => [...prev, ...nextPosts]);
      setCurrentPage(nextPage);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllPosts();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
            <Icon name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      {searchVisible && (
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search posts..."
            placeholderTextColor="#666"
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

      {/* Loading state */}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ff6b6b"
              colors={["#ff6b6b", "#feca57", "#1dd1a1"]}
              progressBackgroundColor="#fff"
            />
          }
          scrollEventThrottle={16}
        />
      )}

      {/* Floating Hashtag Button */}
      <FloatingButton
        hashtags={allHashtags}
        selectedHashtag={selectedHashtag}
        onSelectHashtag={setSelectedHashtag}
      />

      {/* Post Modal */}
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedPost(null)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>

              {/* Images Carousel */}
              {selectedPost?.images?.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  decelerationRate="fast"
                  snapToInterval={280}
                  style={{ marginVertical: 10 }}
                >
                  {selectedPost.images.map((img, idx) => {
                    const imageUrl = img?.asset?.url;
                    if (!imageUrl) return null;

                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          setImageViewerIndex(idx);
                          setIsImageViewerVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={{
                            width: 270,
                            height: 270,
                            borderRadius: 10,
                            marginRight: 10,
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Post Content */}
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

              {/* Hashtags */}
              <Text style={styles.modalHashtags}>
                {selectedPost?.hashtags?.length
                  ? selectedPost.hashtags
                      .map((tag) => `${tag.hashtag}`)
                      .join("\n")
                  : "No hashtags"}
              </Text>

              {/* Timestamp */}
              <Text style={styles.modalTime}>
                {new Date(selectedPost?._createdAt).toLocaleString()}
              </Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {selectedPost?.images?.length > 0 && (
        <ImageViewing
          images={selectedPost.images.map((img) => ({ uri: img.asset.url }))}
          imageIndex={imageViewerIndex}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
          presentationStyle="overFullScreen"
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 0,
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
    marginHorizontal: 16,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchBox: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    paddingLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  modalDescription: {
    fontSize: 15,
    color: "#444",
    marginBottom: 15,
    lineHeight: 22,
  },
  modalHashtags: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 12,
  },
  modalTime: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
});