// HomeScreen.js
<<<<<<< HEAD
import { useRoute, useFocusEffect } from "@react-navigation/native";

import { useEffect, useRef, useState,useCallback } from "react";
import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   Share, // <-- import Share API
// } from "react-native";
=======
import { useEffect, useState, useCallback } from "react";
>>>>>>> ATS
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
<<<<<<< HEAD
  StyleSheet, 
  Animated,  
  RefreshControl,
   TextInput,
  Modal,
  Pressable,
  ScrollView,
  Image,// ✅ ADD THIS
=======
  StyleSheet,
  TextInput,
  RefreshControl,
  Modal,
  ScrollView,
  Pressable,
  Image,
>>>>>>> ATS
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import Animated from "react-native-reanimated";
import ImageViewing from "react-native-image-viewing";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";

<<<<<<< HEAD
const setUserIfNotExists = async () => {
  // temporarily disabled
};

=======
// ⚠️ TEMP SAFE STUBS (remove if already implemented elsewhere)
const loadMorePosts = () => {};
const onRefresh = () => {};
const setUserIfNotExists = async () => {};
const useUser = () => ({ isSignedIn: false, user: null });
>>>>>>> ATS

const HomeScreen = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedHashtag, setSelectedHashtag] = useState("All");
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
<<<<<<< HEAD
  const route = useRoute();
  const postId = route.params?.postId;

=======
>>>>>>> ATS

  const postsPerPage = 5;
  const route = useRoute();
  const postId = route.params?.postId;

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn || !user) return;
      await setUserIfNotExists({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || "",
        username: user.username || user.firstName || "user",
        image: user.imageUrl || "",
      });
    };
    syncUser();
  }, [isSignedIn, user]);

<<<<<<< HEAD
    try {
      // await setUserIfNotExists(userData);
    } catch (error) {
      console.error("Error syncing user with Sanity:", error.message);
    }
  };

  syncUserWithSanity();
}, [isSignedIn, user]);

  // Fetch user bookmarks
=======
>>>>>>> ATS
  useFocusEffect(
    useCallback(() => {
      const fetchBookmarks = async () => {
        if (!isSignedIn || !user) return;
        const query = `*[_type=="user" && clerkId==$id][0]{ saved_post[]->{_id} }`;
        const data = await client.fetch(query, { id: user.id });
        setBookmarkedPosts(new Set(data?.saved_post?.map(p => p._id) || []));
      };
      fetchBookmarks();
    }, [isSignedIn, user])
  );

<<<<<<< HEAD

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

      // if (result.length > 0) {
      //   setPosts((prevPosts) => [...prevPosts, ...result]);
      //   setCurrentPage((prevPage) => prevPage + 1);
      // } else {
      //   setHasMorePosts(false);
      // }
setAllPosts(result);
setVisiblePosts(result.slice(0, postsPerPage));



    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Share button handler
=======
>>>>>>> ATS
  const onShare = async (post) => {
    await Share.share({
      title: post.title,
      message: post.title,
    });
  };
const renderItem = ({ item }) => (
  <View style={styles.cardContainer}>
    {/* Card Left Side */}
    <TouchableOpacity style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardCategory}>Category</Text>

<<<<<<< HEAD
      <Text
        style={styles.cardDescription}
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {item.body?.[0]?.children
          ?.map((child) => child.text)
          .join(" ") || "No content available"}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardLabel}>Campus Daemon</Text>
        <Text style={styles.cardTime}>Just now</Text>
=======
  // ✅ FIXED renderItem
  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.cardTextContainer}
        onPress={() => setSelectedPost(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCategory}>Category</Text>
        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.body?.[0]?.children?.map(c => c.text).join(" ") || "No content"}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardLabel}>Campus Daemon</Text>
          <Text style={styles.cardTime}>Just now</Text>
        </View>
      </TouchableOpacity>

      {/* Sidebar */}
      <View style={styles.sideBarContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="bookmark-outline" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesomeIcon5 name="facebook-f" size={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onShare(item)}
        >
          <Icon name="share-social-outline" size={20} />
        </TouchableOpacity>
>>>>>>> ATS
      </View>
    </TouchableOpacity>

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
        onPress={() => onShare(item)}
      >
        <Icon name="share-social-outline" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  </View>
);


  const filteredPosts = allPosts.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

<<<<<<< HEAD
const loadMorePosts = () => {
  if (isLoading) return;

  const nextPage = currentPage + 1;
  const start = (nextPage - 1) * postsPerPage;
  const end = start + postsPerPage;

  const nextPosts = allPosts.slice(start, end);

  if (nextPosts.length > 0) {
    setVisiblePosts(prev => [...prev, ...nextPosts]);
    setCurrentPage(nextPage);
  }
};


const onRefresh = async () => {
  setRefreshing(true);
  await fetchAllPosts();
  setRefreshing(false);
};


=======
  const postsToRender =
    searchQuery || selectedHashtag !== "All"
      ? filteredPosts
      : visiblePosts;
>>>>>>> ATS

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>

<<<<<<< HEAD
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
=======
      {isLoading ? (
        <ActivityIndicator size="large" />
>>>>>>> ATS
      ) : (
        <Animated.FlatList
          data={postsToRender}
          renderItem={renderItem}
          keyExtractor={item => item._id}
        />
      )}

      <FloatingButton
        hashtags={[]}
        selectedHashtag={selectedHashtag}
        onSelectHashtag={setSelectedHashtag}
      />

      {selectedPost && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <Pressable onPress={() => setSelectedPost(null)} />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedPost.title}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 22, fontWeight: "bold" },

  cardContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTextContainer: { flex: 3, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardCategory: { fontSize: 12, color: "#777" },
  cardDescription: { fontSize: 14, marginVertical: 6 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },

  sideBarContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: { padding: 8 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
<<<<<<< HEAD
});
=======
  modalTitle: { fontSize: 18, fontWeight: "bold" },
});
>>>>>>> ATS
