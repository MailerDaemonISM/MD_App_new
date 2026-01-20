// HomeScreen.js
import { useEffect, useRef, useState } from "react";
import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share, // <-- import Share API
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";

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
  const [refreshing, setRefreshing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const route = useRoute();
  const postId = route.params?.postId;


  // Clerk auth user
  const { isSignedIn, user } = useUser();
  useEffect(() => {
  const syncUserWithSanity = async () => {
    if (!isSignedIn || !user) return;

    const userData = {
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      name: user.fullName || "",
      username: user.username || user.firstName || "user",
      image: user.imageUrl || "",
    };

    try {
      await setUserIfNotExists(userData);
    } catch (error) {
      console.error("Error syncing user with Sanity:", error.message);
    }
  };

  syncUserWithSanity();
}, [isSignedIn, user]);

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


  // Fetch ALL posts once and set up periodic checking
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

      if (result.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...result]);
        setCurrentPage((prevPage) => prevPage + 1);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
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
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerRightIcons}></View>
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
        <Animated.FlatList
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
              tintColor="#ff6b6b" // iOS spinner color
              colors={["#ff6b6b", "#feca57", "#1dd1a1"]} // Android spinner colors
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

              {/* Images Carousel */}
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
                            width: 250,
                            aspectRatio: 1,
                            borderRadius: 10,
                            marginRight: 10,
                          }}
                          resizeMode="contain"
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
          </View>
        </View>
      </Modal>

      {refreshing && (
        <View
          style={{
            position: "absolute",
            top: -60,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Ionicons name="refresh" size={40} color="#4A90E2" />
        </View>
      )}

      {selectedPost?.images?.length > 0 && (
        <ImageViewing
          images={selectedPost.images.map(img => ({ uri: img.asset.url }))}
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
