// HomeScreen.js
import React, { useEffect, useRef, useState } from "react";
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
  AppState,
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react/cjs/react.development";
import { checkAndNotifyNewPosts } from "../utils/postNotificationService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RefreshControl } from "react-native-gesture-handler";
import { Animated } from "react-native";
import LottieView from "lottie-react-native"; // optional
import * as Notifications from 'expo-notifications';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get("window");

const hashtagColorMap = hashtagData.reduce((map, tag) => {
  map[tag.title] = tag.color;
  return map;
}, {});

const HomeScreen = () => {
  const navigation = useNavigation();
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
  const scrollY = useRef(new Animated.Value(0)).current;

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

      // Check for new posts and notify users
      const toggleState = await AsyncStorage.getItem('@notification_toggle_enabled');
      const isToggleOn = toggleState !== null ? JSON.parse(toggleState) : true;
      await checkAndNotifyNewPosts(result, isToggleOn);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Background notification check function
  const checkPostsInBackground = async () => {
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

      // Get toggle state
      const toggleState = await AsyncStorage.getItem('@notification_toggle_enabled');
      const isToggleOn = toggleState !== null ? JSON.parse(toggleState) : true;

      // Check for new posts and notify
      const hasNewPost = await checkAndNotifyNewPosts(result, isToggleOn);

      // If there's a new post, update the UI when app comes back to focus
      if (hasNewPost) {
        setAllPosts(result);
        setVisiblePosts(result.slice(0, postsPerPage));
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("❌ Error checking for new posts in background:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAllPosts();

    // Set up periodic checking for new posts every 3 seconds
    const intervalId = setInterval(async () => {
      await checkPostsInBackground();
    }, 3000); // Check every 3 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);



  // Handle notification press to navigate to post
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const postId = response.notification.request.content.data.postId;

      if (postId) {
        // Find the post in allPosts
        const post = allPosts.find(p => p._id === postId);

        if (post) {
          // Set the selected post to open the modal
          setSelectedPost(post);
          console.log('Navigating to post:', postId);
        }
      }
    });

    return () => subscription.remove();
  }, [allPosts]);

  // Pull-to-refresh handler with limit
  const onRefresh = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const storedData = await AsyncStorage.getItem('@refresh_limit');
      let currentCount = 0;

      if (storedData) {
        const { date, count } = JSON.parse(storedData);
        currentCount = date === today ? count : 0;
      }

      // Check if limit reached
      if (currentCount >= 5) {
        return;
      }

      // Increment refresh count
      const newCount = currentCount + 1;
      await AsyncStorage.setItem('@refresh_limit', JSON.stringify({ date: today, count: newCount }));

      setRefreshing(true);
      await fetchAllPosts();
      setRefreshing(false);
    } catch (error) {
      console.error("Error during refresh:", error);
      setRefreshing(false);
    }
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
      const message = `${post.title}\n\n${Array.isArray(post.body)
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
  const hasImages = Array.isArray(item.images) && item.images.some((img) => img?.asset?.url);

  return (
    <TouchableOpacity onPress={() => setSelectedPost(item)}>
      <View
        style={[
          styles.cardContainer,
          hasImages && { paddingBottom:0},
        ]}
      >
        {/* --------card CONTENT ---------- */}
        <View style={[styles.cardTextContainer]}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          <Text numberOfLines={2} style={styles.cardDescription}>
            {description || "No content available"}
          </Text>

          {/* ---------- IMAGES ROW ---------- */}
          {hasImages && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[{ marginTop: 10 }, { marginBottom: 6 }]}
              pagingEnabled
               contentContainerStyle={{ paddingRight: 16 }}
              decelerationRate="fast"
            >
             {item.images.map((img, idx) => {
  const imageUrl = img?.asset?.url;
  if (!imageUrl) return null;

  // If there are more than 3 images and we're at index 2, show "+X more" overlay
  if (idx === 2 && item.images.length > 3) {
    return (
      <View key={idx} style={{ position: "relative", marginRight: 8 }}>
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
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            +{item.images.length - 3}
          </Text>
        </View>
      </View>
    );
  }

  // Only show first 3 images (0, 1, 2)
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

          {/* ---------- footer ---------- */}
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

        {/* ---------- sidebar---------- */}
        <View
          style={[
            styles.sideBarContainer,
            {
              backgroundColor: sideBarColor,
              //alignSelf: "stretch", 
              justifyContent: "space-around",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleBookmark(item._id, user?.id)}
          >
            <Icon
              name={bookmarkedPosts.has(item._id) ? "bookmark" : "bookmark-outline"}
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

          <TouchableOpacity style={styles.iconButton} onPress={() => handleShare(item)}>
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

    {/* Search bar */}
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

    {/* Optional Lottie Animation for pull-to-refresh */}
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
        <LottieView
          source={require("../assets/refresh.json")} // your Lottie JSON
          autoPlay
          loop
          style={{ width: 60, height: 60 }}
        />
      </View>
    )}
  </View>
);

};

export default HomeScreen;
