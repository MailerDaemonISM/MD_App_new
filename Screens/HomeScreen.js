// HomeScreen.js
import { useEffect, useRef, useState } from "react";
import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Share,
  Pressable,
  Image,
  StyleSheet,
  BackHandler,
  Alert,
  RefreshControl,
  Animated,
  Linking
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
import { buildShareText } from "../utils/shareText";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback } from "react";
import { checkAndNotifyNewPosts } from "../utils/postNotificationService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getPostById, getPosts } from "../api/post";
import { fetchSanityUserId } from '../sanity.js';

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
  const [refreshing, setRefreshing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  
  const route = useRoute();
  const postId = route.params?.postId;
  const { isSignedIn, user } = useUser();

  // Helper to ensure post arrays are unique by _id
  const getUniquePosts = (posts) => {
    const uniqueMap = new Map();
    posts.forEach(post => {
      if (post && post._id) uniqueMap.set(post._id, post);
    });
    return Array.from(uniqueMap.values());
  };

  // Sync User
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

  // Fetch bookmarks
  useFocusEffect(
    useCallback(() => {
      const fetchUserBookmarks = async () => {
        if (!isSignedIn || !user) return;
        try {
          const query = `*[_type=="user" && clerkId==$clerkId][0]{ saved_post[]->{ _id } }`;
          const data = await client.fetch(query, { clerkId: user.id });
          setBookmarkedPosts(new Set(data?.saved_post?.map((p) => p._id) || []));
        } catch (err) {
          console.error("Error fetching user bookmarks:", err);
        }
      };
      fetchUserBookmarks();
    }, [isSignedIn, user])
  );

  // Main Fetch logic with Duplicate Prevention
  const fetchAllPosts = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const query = `*[_type == "post"] | order(_createdAt desc) {
        _id, title, body, images[]{asset->{url}}, _createdAt, hashtags[]->{ _id, hashtag }
      }`;
      const result = await client.fetch(query);
      const uniqueResult = getUniquePosts(result);

      setAllPosts(uniqueResult);
      setVisiblePosts(uniqueResult.slice(0, postsPerPage));

      const toggleState = await AsyncStorage.getItem('@notification_toggle_enabled');
      const isToggleOn = toggleState !== null ? JSON.parse(toggleState) : true;
      await checkAndNotifyNewPosts(uniqueResult, isToggleOn);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Periodic Check (Increased interval to 30s for performance)
  useEffect(() => {
    fetchAllPosts();
    const intervalId = setInterval(() => fetchAllPosts(false), 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle postId from Navigation/Deep Link
  useEffect(() => {
    if (postId) {
      getPostById(postId)
        .then((post) => {
          if (post) {
            setSelectedPost(post);
            setAllPosts(prev => getUniquePosts([post, ...prev]));
            setVisiblePosts(prev => getUniquePosts([post, ...prev]));
          }
        })
        .catch(console.error);
    }
  }, [postId]);

  // Back Handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Exit App", "Are you sure you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "YES", onPress: () => BackHandler.exitApp() }
        ]);
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const today = new Date().toDateString();
    const storedData = await AsyncStorage.getItem('@refresh_limit');
    let { date, count } = storedData ? JSON.parse(storedData) : { date: today, count: 0 };
    
    if (date === today && count >= 5) {
      setRefreshing(false);
      return;
    }

    await AsyncStorage.setItem('@refresh_limit', JSON.stringify({ date: today, count: count + 1 }));
    await fetchAllPosts();
    setRefreshing(false);
  }, []);

  const loadMorePosts = () => {
    if (searchQuery || selectedHashtag !== "All") return;
    const nextPage = currentPage + 1;
    const start = (nextPage - 1) * postsPerPage;
    const end = nextPage * postsPerPage;
    const nextSet = allPosts.slice(start, end);

    if (nextSet.length > 0) {
      setVisiblePosts(prev => getUniquePosts([...prev, ...nextSet]));
      setCurrentPage(nextPage);
    }
  };

  const handleShare = async (post) => {
    try {
      const message = buildShareText(post);
      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const handleBookmark = async (postId, clerkId) => {
    if (!clerkId) return;
    try {
      const sanityUserId = await fetchSanityUserId(clerkId);
      if (!sanityUserId) return;

      const alreadySaved = bookmarkedPosts.has(postId);
      setBookmarkedPosts((prev) => {
        const updated = new Set(prev);
        alreadySaved ? updated.delete(postId) : updated.add(postId);
        return updated;
      });

      const patch = client.patch(sanityUserId);
      alreadySaved 
        ? await patch.unset([`saved_post[_ref=="${postId}"]`]).commit()
        : await patch.setIfMissing({ saved_post: [] }).append("saved_post", [{ _type: "reference", _ref: postId }]).commit();
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const renderItem = ({ item }) => {
    const description = Array.isArray(item.body)
      ? item.body.map(b => b.children?.map(c => c.text).join("")).join("\n\n")
      : item.body || "";

    const descriptionPreview = description.split(/\s+/).slice(0, 20).join(" ") + (description.split(/\s+/).length > 20 ? "..." : "");
    const sideBarColor = hashtagColorMap[item.hashtags?.[0]?.hashtag] || "#ddd";
    const hasImages = item.images?.length > 0;

    return (
      <TouchableOpacity onPress={() => setSelectedPost(item)}>
        <View style={[styles.cardContainer, hasImages && { paddingBottom: 0 }]}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text numberOfLines={2} style={styles.cardDescription}>{descriptionPreview || "No content"}</Text>

            {hasImages && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                {item.images.slice(0, 3).map((img, idx) => (
                  <View key={idx} style={{ position: "relative", marginRight: 8 }}>
                    <Image source={{ uri: img.asset.url }} style={{ width: 70, height: 70, borderRadius: 10 }} />
                    {idx === 2 && item.images.length > 3 && (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+{item.images.length - 3}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.cardFooter}>
              <Text style={styles.cardLabel}>{item.hashtags?.map(t => t.hashtag).join(", ") || "No hashtags"}</Text>
              <Text style={styles.cardTime}>{new Date(item._createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={[styles.sideBarContainer, { backgroundColor: sideBarColor }]}>
            <TouchableOpacity onPress={() => handleBookmark(item._id, user?.id)} style={styles.iconButton}>
              <Icon name={bookmarkedPosts.has(item._id) ? "bookmark" : "bookmark-outline"} size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL("https://instagram.com/...")} style={styles.iconButton}>
              <FontAwesomeIcon5 name="instagram" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleShare(item)} style={styles.iconButton}>
              <Icon name="share-social-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedHashtag === "All" || post.hashtags?.some(t => t.hashtag === selectedHashtag);
    return matchesSearch && matchesTag;
  });

  const postsToRender = (searchQuery || selectedHashtag !== "All") ? filteredPosts : visiblePosts;
  const allHashtags = Array.from(new Set(allPosts.flatMap(p => p.hashtags?.map(t => t.hashtag) || [])));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mailer Daemon</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}><Icon name="search-outline" size={26} /></TouchableOpacity>
          <NotificationButton />
        </View>
      </View>

      {searchVisible && (
        <View style={styles.searchContainer}>
          <TextInput placeholder="Search..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBox} />
        </View>
      )}

      {isLoading && postsToRender.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <Animated.FlatList
          data={postsToRender}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          onEndReached={loadMorePosts}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <FloatingButton hashtags={allHashtags} selectedHashtag={selectedHashtag} onSelectHashtag={setSelectedHashtag} />

      <Modal visible={!!selectedPost} animationType="slide" transparent onRequestClose={() => setSelectedPost(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedPost(null)} />
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
              {selectedPost?.images?.map((img, i) => (
                <TouchableOpacity key={i} onPress={() => {setImageViewerIndex(i); setIsImageViewerVisible(true);}}>
                  <Image source={{ uri: img.asset.url }} style={{ width: '100%', height: 200, marginBottom: 10, borderRadius: 10 }} />
                </TouchableOpacity>
              ))}
              <Text style={styles.modalDescription}>
                {Array.isArray(selectedPost?.body) ? selectedPost.body.map(b => b.children?.map(c => c.text).join("")).join("\n\n") : selectedPost?.body}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {isImageViewerVisible && (
        <ImageViewing
          images={selectedPost?.images?.map(img => ({ uri: img.asset.url })) || []}
          imageIndex={imageViewerIndex}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
        />
      )}
    </View>
  );
};

export default HomeScreen;