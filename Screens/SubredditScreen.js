import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Share
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { useUser } from '@clerk/clerk-expo';
import Markdown from 'react-native-markdown-display';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// --- ASSET CONSTANTS ---
const UPVOTE_ICON = require('../assets/upvote.png');
const SHARE_ICON = require('../assets/share.png');
const CHAT_ICON = require('../assets/chat.png');
const MENU = require('../assets/dots.png')

// --- UTILITY: RELATIVE TIME ---
const getTimeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString();
};

// --- COMPONENT: IMAGE CAROUSEL WITH DOTS ---
// --- UPDATED COMPONENT: IMAGE CAROUSEL WITH SNAP EFFECT ---
const ImageCarousel = ({ images, modalMode = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselWidth = modalMode ? width - 32 : width;

  // We use a debounce-like logic to only update the index when the scroll has settled
  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / carouselWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={{ width: carouselWidth }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={true}
        snapToInterval={carouselWidth}
        snapToAlignment="start" // Changed to start for smoother locking
        decelerationRate="fast" // High friction for a snappy feel
        onMomentumScrollEnd={handleScroll} // Calculate index ONLY after swipe finishes
        scrollEventThrottle={16}
        disableIntervalMomentum={true}
        removeClippedSubviews={true} // Performance optimization for images
      >
        {images.map((url, idx) => (
          <Image
            key={idx}
            source={{ uri: url }}
            style={[
              styles.postImage,
              { width: carouselWidth, height: modalMode ? 300 : 280 }
            ]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* PAGINATION DOTS */}
      {images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.paginationDot,
                idx === activeIndex ? styles.paginationDotActive : null
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// 1. Recursive Component for Comment Threads
const CommentThread = ({ comment, onReply, onDelete, currentUserId, depth = 0 }) => {
  const isOwner = currentUserId === comment.user_id;

  return (
    <View style={[styles.threadContainer, { marginLeft: depth > 0 ? 10 : 0 }]}>
      {depth > 0 && <View style={styles.verticalLine} />}
      <View style={styles.commentContent}>
        <View style={styles.commentHeaderRow}>
          <Text style={styles.commentAuthor}>
            {comment.is_anonymous ? 'u/anonymous' : `u/${comment.author_name || 'Member'}`}
          </Text>
          <Text style={styles.timeAgo}> • {getTimeAgo(comment.created_at)}</Text>
        </View>
        <Markdown style={commentMdStyles}>{comment.content}</Markdown>
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => onReply(comment)} style={styles.actionItem}>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.actionItem}>
              <Text style={[styles.actionText, { color: '#FF4500' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
        {comment.children?.map((child) => (
          <CommentThread key={child.id} comment={child} onReply={onReply} onDelete={onDelete} currentUserId={currentUserId} depth={depth + 1} />
        ))}
      </View>
    </View>
  );
};

// 2. Data Transformer
const nestComments = (list) => {
  const map = {};
  const roots = [];
  list.forEach((item) => { map[item.id] = { ...item, children: [] }; });
  list.forEach((item) => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });
  return roots;
};

export default function RedditScreen() {
  const navigation = useNavigation();
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const { user } = useUser();
  const topListRef = useRef(null);
  const queryClient = useQueryClient();
  const flatListRef = useRef(null); // Ref for "Jump to Top"

  const [filterType, setFilterType] = useState('new');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [discussionVisible, setDiscussionVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('general');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [targetSubId, setTargetSubId] = useState('');
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [parentComment, setParentComment] = useState(null);

  //check community guidelines only once
  useEffect(() => {
    const checkGuidelines = async () => {
      const accepted = await AsyncStorage.getItem("guidelinesAccepted");
      if (!accepted) {
        setShowGuidelines(true);
      }
    };
    checkGuidelines();
  }, []);

  const handleAccept = async () => {
    await AsyncStorage.setItem("guidelinesAccepted", "true");
    setShowGuidelines(false);
  };

  const handleDecline = () => {
    setShowGuidelines(true);
    navigation.navigate("HomeScreen"); // Or whatever your main landing screen is
  };

  // Scroll to top when subreddit changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedSlug, filterType]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries(['posts', selectedSlug]),
      queryClient.invalidateQueries(['subreddits'])
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length < 1) {
        setSearchResults([]);
        return;
      }
      const { data } = await supabase.from('subreddits').select('*').ilike('slug', `%${searchQuery}%`).limit(5);
      setSearchResults(data || []);
    };
    const timer = setTimeout(() => fetchSearchResults(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: communities } = useQuery({
    queryKey: ['subreddits'],
    queryFn: async () => {
      const { data } = await supabase.from('subreddits').select('*');
      if (data?.length > 0 && !targetSubId) setTargetSubId(data[0].id);
      return data;
    },
  });

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts', selectedSlug, filterType],
    queryFn: async () => {
      // Basic fetch
      const { data } = await supabase
        .from('posts')
        .select('*, subreddits!inner(*), likes(user_id), comments(count)')
        .eq('subreddits.slug', selectedSlug)
        .order('created_at', { ascending: false });
      return data;
    },
    select: (data) => {
      if (!data) return [];
      if (filterType === 'mine') {
        return data.filter(p => p.user_id === user.id);
      }
      if (filterType === 'popular') {
        return [...data].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      }
      return data;
    }
  });

  const deletePost = useMutation({
    mutationFn: async (postId) => {
      // 1. Explicitly check user ID in the query for RLS safety
      const { error, data } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id); // Ensures you can only delete YOURS

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // 2. Clear the cache and force a refetch
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      Alert.alert("Success", "Post has been removed.");
    },
    onError: (error) => {
      Alert.alert("Deletion Failed", error.message);
    }
  });

  // DELETE Logic
  const handleDeletePress = (postId) => {
    Alert.alert("Delete Post", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePost.mutate(postId) }
    ]);
  };

  const toggleLike = useMutation({
    mutationFn: async ({ postId, isLiked }) => {
      if (isLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['posts', selectedSlug]),
  });

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const uploadMultipleImages = async (uris) => {
    return Promise.all(uris.map(async (uri) => {
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;
      const formData = new FormData();
      formData.append('file', { uri, name: fileName, type: `image/${fileExt}` });
      const { error } = await supabase.storage.from('post-images').upload(filePath, formData);
      if (error) throw error;
      const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
      return data.publicUrl;
    }));
  };

  const handleCreatePost = async () => {
    if (!title.trim()) return Alert.alert("Required", "Please add a title");
    setIsUploading(true);
    const displayName = user.username || user.fullName || "User";
    try {
      let imageUrls = images.length > 0 ? await uploadMultipleImages(images) : [];
      const { error } = await supabase.from('posts').insert([{
        title, content, subreddit_id: targetSubId, user_id: user.id,
        author_name: displayName, image_urls: imageUrls, is_anonymous: isAnonymous
      }]);
      if (error) throw error;
      queryClient.invalidateQueries(['posts', selectedSlug]);
      setModalVisible(false);
      setTitle(''); setContent(''); setImages([]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const { data: rawComments, isLoading: loadingComments } = useQuery({
    queryKey: ['comments', selectedPost?.id],
    queryFn: async () => {
      const { data } = await supabase.from('comments').select('*').eq('post_id', selectedPost.id).order('created_at', { ascending: true });
      return data;
    },
    enabled: !!selectedPost,
  });

  const handlePostComment = async () => {
    if (!replyText.trim()) return;
    const displayName = user.username || user.fullName || "Member";
    const { error } = await supabase.from('comments').insert([{
      post_id: selectedPost.id, parent_id: parentComment?.id || null,
      content: replyText, user_id: user.id, author_name: displayName, is_anonymous: isAnonymous
    }]);
    if (!error) {
      setReplyText(''); setParentComment(null);
      queryClient.invalidateQueries(['comments', selectedPost.id]);
      queryClient.invalidateQueries(['posts', selectedSlug]);
    }
  };

  // const handleBlockUser = async (userIdToBlock) => {
  //   // ... (inside your Alert/Confirm logic)
  //   const blocked = await AsyncStorage.getItem("blockedUsers");
  //   const blockedList = blocked ? JSON.parse(blocked) : [];

  //   if (!blockedList.includes(userIdToBlock)) {
  //     const updatedList = [...blockedList, userIdToBlock];
  //     await AsyncStorage.setItem("blockedUsers", JSON.stringify(updatedList));

  //     // CRUCIAL: Update the local state so the UI re-renders instantly
  //     setBlockedUsers(updatedList);

  //     Alert.alert("User Blocked", "The feed has been updated.");
  //   }
  // };

  const handleDeleteComment = (id) => {
    Alert.alert("Delete", "Remove this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await supabase.from('comments').delete().eq('id', id);
          queryClient.invalidateQueries(['comments', selectedPost.id]);
        }
      }
    ]);
  };

  const onShare = async (post) => {
    try {
      await Share.share({
        message: `Check out: "${post.title}" on ISM Diaries\nhttps://appmailerdaemon.online/post/${post.id}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  // --- HANDLER FOR SELECTING SUBREDDIT ---
  const handleSelectSubreddit = (slug, id, index) => {
    setSelectedSlug(slug);
    if (id) setTargetSubId(id);
    setSearchQuery('');
    setIsSearchActive(false);

    // Jump Feed to top
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }

    // JUMP SUBREDDIT TO LEFTMOST POSITION
    if (topListRef.current && index !== undefined) {
      topListRef.current.scrollToIndex({
        index: index,
        animated: true,
        viewPosition: 0, // 0 = leftmost, 0.5 = center, 1 = rightmost
      });
    }
  };


  const submitReport = async (postId) => {
    try {
      const { error } = await supabase
        .from('user_reviews')
        .insert([
          {
            post_id: postId,
            reporter_id: user.id
          }
        ]);

      if (error) throw error;

      Alert.alert(
        "Report Submitted",
        "Team Mailer Daemon will review your report request take necessary actions within 24 hours. Thanks for keeping the community safe!"
      );
    } catch (err) {
      Alert.alert("Error", "Could not submit report. Please try again later.");
      console.error(err);
    }
  };

  const handleReportPress = (postId) => {
    Alert.alert(
      "Report Post",
      "Are you sure you want to report this content for violating community guidelines?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Report",
          style: "destructive",
          onPress: () => submitReport(postId)
        }
      ]
    );
  };


  const handleMenuPress = (item) => {
    const isOwner = item.user_id === user.id;

    const options = [
      {
        text: "Report Post",
        onPress: () => handleReportPress(item.id),
        style: "default",
      },
    ];

    // Add Delete option ONLY if the user owns the post
    if (isOwner) {
      options.unshift({
        text: "Delete Post",
        onPress: () => handleDeletePress(item.id),
        style: "destructive",
      });
    }

    options.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Post Options", "What would you like to do?", options);
  };

  const handleBlockUser = async (userIdToBlock) => {
    try {
      const blocked = await AsyncStorage.getItem("blockedUsers");
      let blockedList = blocked ? JSON.parse(blocked) : [];

      if (!blockedList.includes(userIdToBlock)) {
        const updatedList = [...blockedList, userIdToBlock];

        // 1. Save to Storage (Persistent)
        await AsyncStorage.setItem("blockedUsers", JSON.stringify(updatedList));

        // 2. Update State (Immediate UI change)
        setBlockedUsers(updatedList);

        Alert.alert("Success", "User blocked. Feed updated.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [isBlockManagerVisible, setIsBlockManagerVisible] = useState(false);

  const handlePlusPress = () => {
    Alert.alert(
      "Quick Actions",
      "Select an option",
      [
        { text: "📝 Create a Post", onPress: () => setModalVisible(true) },
        { text: "🚫 Manage Blocked Users", onPress: () => setIsBlockManagerVisible(true) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  // Define how the buttons fly out
  const getButtonStyle = (index) => ({
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70 * index - 10], // Spacing between buttons
        }),
      },
    ],
    opacity: animation,
  });

  const [blockedUsers, setBlockedUsers] = useState([]);

  const unblockUser = async (userIdToUnblock) => {
    try {
      // 1. Filter out the ID from the current list
      const updatedList = blockedUsers.filter(id => id !== userIdToUnblock);

      // 2. Update Local State (This triggers the UI/Feed refresh)
      setBlockedUsers(updatedList);

      // 3. Update Persistent Storage
      await AsyncStorage.setItem("blockedUsers", JSON.stringify(updatedList));

      // 4. Optional: Feedback to user
      // Alert.alert("Success", "User unblocked"); 
    } catch (error) {
      console.error("Failed to unblock user:", error);
    }
  };

  useEffect(() => {
    const loadBlocked = async () => {
      const blocked = await AsyncStorage.getItem("blockedUsers");
      if (blocked) setBlockedUsers(JSON.parse(blocked));
    };
    loadBlocked();
  }, []);

  // Inside your RedditScreen function
  const visiblePosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter(post => {
      // Convert both to strings to ensure '123' matches 123
      const postAuthorId = String(post.user_id);
      const isBlocked = blockedUsers.some(blockedId => String(blockedId) === postAuthorId);

      return !isBlocked;
    });
  }, [posts, blockedUsers]); // This re-runs the instant blockedUsers changes

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={showGuidelines} transparent={true} animationType="fade">
        <View style={styles.guidelineOverlay}>
          <View style={styles.guidelineContainer}>

            {/* Centered Brand Icon */}
            <View style={styles.brandIcon}>
              <Text style={{ fontSize: 40 }}>🛡️</Text>
            </View>

            <Text style={styles.guidelineTitle}>Community Guidelines</Text>
            <Text style={styles.guidelineSubtitle}>Please review our protocols to continue</Text>

            <View style={styles.rulesList}>
              {[
                { icon: "🚫", text: "No Abusive or Hateful Content" },
                { icon: "🔞", text: "Strictly No Sexual Content" },
                { icon: "⚖️", text: "Zero Discrimination (Race/Caste/Origin)" },
                { icon: "⚠️", text: "No Destructive Criticism or Harassment" },
                { icon: "👨‍💻", text: "Admin Authority to Moderate/Delete" }
              ].map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Text style={styles.ruleIcon}>{rule.icon}</Text>
                  <Text style={styles.ruleText}>{rule.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              <Text style={styles.acceptBtnText}>I Understand & Agree</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
              <Text style={styles.declineBtnText}>Go Back</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {!isSearchActive ? (
            <>
              <Text style={styles.headerTitle}>ISM <Text style={{ color: '#1A1A1B' }}>DIARIES</Text></Text>

              <View style={styles.headerActions}>
                <View style={styles.filterPill}>
                  <TouchableOpacity
                    onPress={() => setFilterType('new')}
                    style={[styles.filterBtn, filterType === 'new' && styles.filterBtnActive]}
                  >
                    <Text style={[styles.filterText, filterType === 'new' && styles.filterTextActive]}>New</Text>
                  </TouchableOpacity>

                  <View style={styles.filterDivider} />

                  <TouchableOpacity
                    onPress={() => setFilterType('popular')}
                    style={[styles.filterBtn, filterType === 'popular' && styles.filterBtnActive]}
                  >
                    <Text style={[styles.filterText, filterType === 'popular' && styles.filterTextActive]}>Popular</Text>
                  </TouchableOpacity>

                  <View style={styles.filterDivider} />

                  <TouchableOpacity
                    onPress={() => setFilterType('mine')}
                    style={[styles.filterBtn, filterType === 'mine' && styles.filterBtnActive]}
                  >
                    <Text style={[styles.filterText, filterType === 'mine' && styles.filterTextActive]}>Mine</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.iconCircle} onPress={() => setIsSearchActive(true)}>
                  <Text style={{ fontSize: 16 }}>🔍</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.searchContainer}>
              <TextInput
                autoFocus
                placeholder="Search subreddits..."
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#878A8C"
              />
              <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }}>
                <Text style={styles.cancelSearchText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SEARCH RESULTS DROPDOWN */}
        {isSearchActive && searchResults.length > 0 && (
          <View style={styles.searchResultsDropdown}>
            {searchResults.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={styles.searchResultItem}
                onPress={() => handleSelectSubreddit(sub.slug, sub.id)}
              >
                <Text style={styles.searchResultText}>r/{sub.slug}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SUBREDDIT TABS */}
        <FlatList
          ref={topListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={communities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabList}
          // This helps scrollToIndex work accurately
          getItemLayout={(data, index) => (
            { length: 100, offset: 100 * index, index }
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleSelectSubreddit(item.slug, item.id, index)}
              style={[
                styles.tab,
                selectedSlug === item.slug && styles.activeTab // Blue background
              ]}
            >
              <Text style={[
                styles.tabText,
                selectedSlug === item.slug && styles.activeTabText // White bold text
              ]}>
                r/{item.slug}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* FEED */}
      {loadingPosts ? (
        <ActivityIndicator style={{ marginTop: 0 }} color="#0079D3" />
      ) : visiblePosts && visiblePosts.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={visiblePosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4500" />}
          renderItem={({ item }) => {
            const isLiked = item.likes?.some(l => l.user_id === user.id);
            const likeCount = item.likes?.length || 0;
            const commentCount = item.comments?.[0]?.count || 0;

            return (
              <View
                style={styles.postCard}
                activeOpacity={0.95}
                onPress={() => { setSelectedPost(item); setDiscussionVisible(true); }}
              >
                {/* Inside your Card Header or Footer */}
                <View style={styles.cardHeader}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>

                    {/* Left Side: Avatar and Info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.subAvatar}>
                        <Text style={styles.subAvatarText}>{item.subreddits?.slug[0].toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={styles.cardSubText}>r/{item.subreddits?.slug}</Text>
                        <Text style={styles.cardUserText}>
                          {item.is_anonymous ? 'u/anonymous' : `u/${item.author_name || 'Ghost'}`}
                          <Text> • {getTimeAgo(item.created_at)}</Text>
                        </Text>
                      </View>
                    </View>

                    {/* Right Side: Three Dots Menu */}
                    <TouchableOpacity
                      onPress={(event) => {
                        const { pageY } = event.nativeEvent;
                        setSelectedItem(item);
                        setMenuPosition({ top: pageY + 10, right: 20 });
                        setMenuVisible(true);
                      }}
                      style={{ padding: 10, marginRight: -5 }} // Increased hit slop for better touch
                    >
                      <Image source={MENU} style={[styles.assetIcon, { width: 18, height: 18 }]} />
                    </TouchableOpacity>

                  </View>
                </View>

                <Text style={styles.postTitle}>{item.title}</Text>

                {/* --- IMAGE CAROUSEL WITH DOTS --- */}
                {item.image_urls && item.image_urls.length > 0 && (
                  <View style={styles.imageScrollContainer}>
                    <ImageCarousel images={item.image_urls} />
                  </View>
                )}

                <View style={styles.previewContent}>
                  <Markdown style={postMdStyles}>{item.content.length > 140 ? item.content.slice(0, 140) + '...' : item.content}</Markdown>
                </View>

                {/* FOOTER */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <TouchableOpacity
                      style={[styles.actionPill, isLiked && styles.votedPill]}
                      onPress={() => toggleLike.mutate({ postId: item.id, isLiked })}
                    >
                      <Image
                        source={UPVOTE_ICON}
                        style={[styles.assetIcon, { tintColor: isLiked ? '#FF4500' : '#878A8C' }]}
                      />
                      <Text style={[styles.footerCount, isLiked && styles.votedText]}>
                        {likeCount || 'Vote'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionPill}
                      onPress={() => { setSelectedPost(item); setDiscussionVisible(true); }}
                    >
                      <Image source={CHAT_ICON} style={[styles.assetIcon, { width: 18, height: 18 }]} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.footerCount}>{commentCount}</Text>
                        <Text style={{ color: '#E2E4E7' }}>|</Text>
                        <Text style={styles.footerCount}>Discuss</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.shareIconBtn} onPress={() => onShare(item)}>
                    <Image source={SHARE_ICON} style={[styles.assetIcon, { tintColor: '#878A8C' }]} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      ) : (
        /* --- EMPTY STATE VIEW --- */
        <View style={styles.emptyStateContainer}>
          <View style={styles.mutedCircle}>
            <Text style={styles.mutedIcon}>📭</Text>
          </View>
          <Text style={styles.emptyTitle}>No posts in r/{selectedSlug} yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to share something with this community!</Text>
          <TouchableOpacity
            style={styles.createFirstBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createFirstBtnText}>Create a Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FLOATING ACTIONS */}
      <TouchableOpacity
        style={[styles.identityFab, isAnonymous && styles.anonFabActive]}
        onPress={() => setIsAnonymous(!isAnonymous)}
      >
        <Text style={styles.identityEmoji}>{isAnonymous ? '👻' : '👤'}</Text>
        <Text style={[styles.identityFabText, isAnonymous && { color: '#FFF' }]}>{isAnonymous ? 'Anon' : 'Public'}</Text>
      </TouchableOpacity>

      <View style={styles.fabContainer}>

        {/* Option: Manage Blocked Users */}
        <Animated.View style={[styles.secondaryButton, getButtonStyle(2)]}>
          <TouchableOpacity
            style={styles.innerButton}
            onPress={() => { toggleMenu(); setIsBlockManagerVisible(true); }}
          >
            <Text style={styles.buttonLabel}>Blocked Users</Text>
            <Text style={styles.iconText}>🚫</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Option: Create Post */}
        <Animated.View style={[styles.secondaryButton, getButtonStyle(1)]}>
          <TouchableOpacity
            style={styles.innerButton}
            onPress={() => { toggleMenu(); setModalVisible(true); }}
          >
            <Text style={styles.buttonLabel}>New Post</Text>
            <Text style={styles.iconText}>📝</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Toggle Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleMenu}
          style={styles.mainFab}
        >
          <Animated.Text style={[
            styles.plusText,
            {
              transform: [{
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'] // Turns + into x
                })
              }]
            }
          ]}>
            +
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* CREATE MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancelBtn}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={handleCreatePost} disabled={isUploading}>
              {isUploading ? <ActivityIndicator size="small" color="#0079D3" /> : <Text style={styles.postBtn}>Post</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={targetSubId} onValueChange={(v) => setTargetSubId(v)}>
                {communities?.map(s => <Picker.Item key={s.id} label={`r/${s.slug}`} value={s.id} />)}
              </Picker>
            </View>
            <TextInput placeholder="Title" style={styles.titleInput} value={title} onChangeText={setTitle} />
            <TextInput placeholder="What's on your mind? (Markdown supported)" style={styles.bodyInput} value={content} onChangeText={setContent} multiline />

            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
              <Text style={{ color: '#0079D3', fontWeight: '700' }}>+ Add Photos</Text>
            </TouchableOpacity>

            <ScrollView horizontal style={{ marginTop: 10 }}>
              {images.map((uri, i) => (
                <View key={i} style={{ marginRight: 8 }}>
                  <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  <TouchableOpacity style={styles.removeImg} onPress={() => setImages(images.filter((_, idx) => idx !== i))}>
                    <Text style={{ color: '#FFF', fontSize: 10 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>

      {/* DISCUSSION MODAL */}
      <Modal visible={discussionVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDiscussionVisible(false)}><Text style={styles.cancelBtn}>Close</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Discussion</Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            data={nestComments(rawComments || [])}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ListHeaderComponent={
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.cardUserText}>
                  {selectedPost?.is_anonymous ? 'u/anonymous' : `u/${selectedPost?.author_name}`}
                  <Text> • {selectedPost ? getTimeAgo(selectedPost.created_at) : ''}</Text>
                </Text>
                <Text style={styles.discTitle}>{selectedPost?.title}</Text>

                {/* --- CAROUSEL IN MODAL --- */}
                {selectedPost?.image_urls && selectedPost.image_urls.length > 0 && (
                  <View style={[styles.imageScrollContainer, { marginHorizontal: 0, borderRadius: 8, overflow: 'hidden' }]}>
                    <ImageCarousel images={selectedPost.image_urls} modalMode={true} />
                  </View>
                )}

                <Markdown style={postMdStyles}>{selectedPost?.content || ""}</Markdown>
                <View style={styles.divider} />
                <Text style={styles.commentHeader}>Comments</Text>
                {loadingComments && <ActivityIndicator color="#0079D3" />}
              </View>
            }
            renderItem={({ item }) => (
              <CommentThread comment={item} onReply={setParentComment} onDelete={handleDeleteComment} currentUserId={user.id} />
            )}
          />

          <View style={styles.commentInputWrapper}>
            {parentComment && (
              <View style={styles.replyingBar}>
                <Text style={styles.replyingText}>Replying to u/{parentComment.author_name}</Text>
                <TouchableOpacity onPress={() => setParentComment(null)}><Text style={{ color: '#FF4500' }}>Cancel</Text></TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput placeholder="Add a comment..." style={styles.commentInput} value={replyText} onChangeText={setReplyText} multiline />
              <TouchableOpacity onPress={handlePostComment} style={styles.sendBtn}>
                <Text style={{ color: '#0079D3', fontWeight: '800' }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        {/* The Pressable backdrop handles "touching away" */}
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuOverlay, { top: menuPosition.top, right: menuPosition.right }]}>
            {selectedItem?.user_id === user.id && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  handleDeletePress(selectedItem.id);
                }}
              >
                <Text style={[styles.menuText, { color: 'red' }]}>Delete Post</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleReportPress(selectedItem.id);
              }}
            >
              <Text style={styles.menuText}>Report Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleBlockUser(selectedItem.user_id); // This works even if 'is_anonymous' is true
              }}
            >
              <Text style={styles.menuText}>Block User</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Modal
        visible={isBlockManagerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBlockManagerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.blockManagerSheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Blocked Accounts</Text>
              <TouchableOpacity onPress={() => setIsBlockManagerVisible(false)}>
                <Text style={styles.closeText}>Done</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetSub}>Restoring a user will show their posts in your feed again.</Text>

            {/* List of Blocked Users */}
            <FlatList
              data={blockedUsers} // Uses the state we filtered with
              keyExtractor={(item) => item}
              style={{ marginTop: 10 }}
              renderItem={({ item }) => (
                <View style={styles.blockedUserRow}>
                  <Text style={styles.blockedIdText}>User {item.slice(0, 8)}...</Text>
                  <TouchableOpacity
                    onPress={() => unblockUser(item)}
                    style={styles.restoreBtn}
                  >
                    <Text style={styles.restoreText}>Restore</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>You haven't blocked anyone yet.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF0F5' },

  // Header
  header: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E4E7', zIndex: 10 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FF4500', letterSpacing: -1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F6F7F8', justifyContent: 'center', alignItems: 'center' },

  filterPill: { flexDirection: 'row', backgroundColor: '#F6F7F8', borderRadius: 20, padding: 2, alignItems: 'center' },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18 },
  filterBtnActive: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  filterText: { fontSize: 12, fontWeight: '600', color: '#878A8C' },
  filterTextActive: { color: '#0079D3', fontWeight: '800' },
  filterDivider: { width: 1, height: 12, backgroundColor: '#E2E4E7' },

  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { flex: 1, backgroundColor: '#F6F7F8', borderRadius: 8, padding: 8, fontSize: 15 },
  cancelSearchText: { color: '#0079D3', fontWeight: '600' },

  // Search Results
  searchResultsDropdown: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: '#FFF', borderRadius: 8, zIndex: 999, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  searchResultItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F6F7F8' },
  searchResultText: { fontWeight: '700', color: '#1A1A1B', fontSize: 15 },

  tabList: { paddingHorizontal: 12, paddingBottom: 8, paddingTop: 0 },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, backgroundColor: '#F6F7F8' },
  activeTab: { backgroundColor: '#0079D3' },
  tabText: { color: '#878A8C', fontWeight: '700', fontSize: 13 },
  activeTabText: { color: '#FFF' },

  // Post Card
  postCard: { backgroundColor: '#FFF', marginBottom: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E4E7' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  subAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0079D3', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  subAvatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  cardSubText: { fontSize: 13, fontWeight: '700', color: '#1A1A1B' },
  cardUserText: { fontSize: 12, color: '#878A8C' },
  postTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1B', marginBottom: 8, lineHeight: 24 },

  // Image Carousel Styles
  imageScrollContainer: { marginHorizontal: -16, marginBottom: 12 },
  postImage: { width: width, height: 280, backgroundColor: '#F6F7F8' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D3D3D3', marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: '#0079D3', width: 8, height: 8, borderRadius: 4 },

  previewContent: { marginBottom: 12 },

  // Card Footer
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  footerLeft: { flexDirection: 'row', gap: 12 },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7F8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 25, gap: 8 },
  votedPill: { backgroundColor: '#FF450010' },
  votedText: { color: '#FF4500', fontWeight: '800' },
  assetIcon: { width: 20, height: 20, resizeMode: 'contain' },
  footerCount: { fontSize: 13, fontWeight: '700', color: '#57646F' },
  shareIconBtn: { width: 40, height: 40, backgroundColor: '#F6F7F8', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  // FABS
  fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0079D3', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 32, fontWeight: '300' },
  identityFab: { position: 'absolute', bottom: 30, left: 20, height: 48, paddingHorizontal: 18, borderRadius: 24, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', elevation: 4, borderWidth: 1, borderColor: '#EDF0F5' },
  anonFabActive: { backgroundColor: '#1A1A1B', borderColor: '#1A1A1B' },
  identityFabText: { marginLeft: 8, fontWeight: '700', color: '#1A1A1B' },
  identityEmoji: { fontSize: 18 },

  // Modal UI
  modalContent: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EDF0F5' },
  modalTitle: { fontWeight: '800', fontSize: 16 },
  cancelBtn: { color: '#FF4500', fontWeight: '600' },
  postBtn: { color: '#0079D3', fontWeight: '800', fontSize: 16 },
  pickerContainer: { backgroundColor: '#F6F7F8', borderRadius: 10, marginBottom: 20 },
  titleInput: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#1A1A1B' },
  bodyInput: { fontSize: 16, minHeight: 120, textAlignVertical: 'top', color: '#1A1A1B' },
  imagePickerBtn: { padding: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#0079D3', borderRadius: 8, alignItems: 'center' },
  removeImg: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 2 },

  // Comments & Discussion
  discTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1B', marginVertical: 8 },
  divider: { height: 1, backgroundColor: '#EDF0F5', marginVertical: 16 },
  commentHeader: { fontSize: 13, fontWeight: '800', color: '#878A8C', textTransform: 'uppercase', marginBottom: 12 },
  threadContainer: { flexDirection: 'row', marginTop: 16 },
  verticalLine: { width: 1.5, backgroundColor: '#EDF0F5', marginRight: 12, marginLeft: 4 },
  commentContent: { flex: 1 },
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontSize: 13, fontWeight: '700', color: '#1A1A1B' },
  timeAgo: { fontSize: 12, color: '#878A8C' },
  commentActions: { flexDirection: 'row', gap: 20, marginTop: 8 },
  actionText: { fontSize: 12, fontWeight: '700', color: '#878A8C' },
  commentInputWrapper: { padding: 12, borderTopWidth: 1, borderTopColor: '#EDF0F5', backgroundColor: '#FFF' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  commentInput: { flex: 1, backgroundColor: '#F6F7F8', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
  replyingBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  replyingText: { fontSize: 12, color: '#878A8C' },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F6F7F8',
    borderWidth: 1,
    borderColor: '#E2E4E7'
  },
  activeTab: {
    backgroundColor: '#0079D3',
    borderColor: '#0079D3',
    // Adding a slight shadow to make the selected one "lift"
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 }
  },
  tabText: {
    color: '#878A8C',
    fontWeight: '600',
    fontSize: 14
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 6,
  },
  mutedCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mutedIcon: {
    fontSize: 50,
    opacity: 0.3, // Gives that "muted" look
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#878A8C',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createFirstBtn: {
    backgroundColor: '#0079D3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  createFirstBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  filterPill: {
    flexDirection: 'row',
    backgroundColor: '#F6F7F8',
    borderRadius: 20,
    padding: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E4E7'
  },
  deletePostBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Ensure header remains clean with 3 buttons
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12, // Tighter padding for 3-button support
    paddingVertical: 8,
    height: 54,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)', // Very subtle dimming
  },
  menuOverlay: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 8,
    width: 150,
    paddingVertical: 5,
    // Shadow for elevation
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  guidelineOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    maxHeight: '70%',
  },
  guidelineEmoji: { fontSize: 40, marginBottom: 10 },
  guidelineTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  guidelineScroll: { marginBottom: 20 },
  guidelineText: { fontSize: 15, color: '#555', lineHeight: 22 },
  acceptBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  acceptBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  declineBtn: { paddingVertical: 10 },
  declineBtnText: { color: '#888', fontSize: 14 },
  guidelineOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidelineContainer: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: 'center',
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  brandIcon: {
    marginBottom: 20,
  },
  guidelineTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  guidelineSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  rulesList: {
    width: '100%',
    marginBottom: 35,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  ruleIcon: {
    fontSize: 18,
    marginRight: 15,
  },
  ruleText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  acceptBtn: {
    backgroundColor: '#000', // Solid black for a premium feel
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  declineBtn: {
    marginTop: 20,
  },
  declineBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dims the background
    justifyContent: 'flex-end', // Aligns the sheet to the bottom
  },
  blockManagerSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    height: '60%', // Covers half the screen
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  sheetSub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  closeText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  blockedUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  blockedIdText: {
    fontSize: 16,
    color: '#333',
  },
  restoreBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  restoreText: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'center',
  },
  mainFab: {
    backgroundColor: '#0F172A',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  plusText: {
    color: 'white',
    fontSize: 30,
    fontWeight: '300',
  },
  secondaryButton: {
    position: 'absolute',
    width: 160, // Width to accommodate label + icon
    height: 50,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  innerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
  },
  buttonLabel: {
    marginRight: 10,
    fontWeight: '600',
    color: '#334155',
    fontSize: 14,
  },
  iconText: {
    fontSize: 18,
  },
});


const postMdStyles = {
  body: { fontSize: 15, color: '#1A1A1B', lineHeight: 22 },
  paragraph: { marginBottom: 4 }
};
const commentMdStyles = {
  body: { fontSize: 14, color: '#1A1A1B', lineHeight: 20 },
  paragraph: { marginBottom: 0 }
};