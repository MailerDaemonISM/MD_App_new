import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
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

  return (
    <SafeAreaView style={styles.container}>
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
      ) : posts && posts.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={posts}
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
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

                    {/* DELETE BUTTON - Visible only if it's the user's post */}
                    {item.user_id === user.id && (
                      <TouchableOpacity
                        onPress={() => handleDeletePress(item.id)}
                        style={styles.deletePostBtn}
                      >
                        <Text style={{ fontSize: 18 }}>🗑️</Text>
                      </TouchableOpacity>
                    )}
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

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
});


const postMdStyles = {
  body: { fontSize: 15, color: '#1A1A1B', lineHeight: 22 },
  paragraph: { marginBottom: 4 }
};
const commentMdStyles = {
  body: { fontSize: 14, color: '#1A1A1B', lineHeight: 20 },
  paragraph: { marginBottom: 0 }
};