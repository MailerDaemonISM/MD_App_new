import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { useUser } from '@clerk/clerk-expo';
import Markdown from 'react-native-markdown-display';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

// 1. Recursive Component for Threads
const CommentThread = ({ comment, onReply, onDelete, currentUserId, depth = 0 }) => {
  const isOwner = currentUserId === comment.user_id;

  return (
    <View style={[styles.threadContainer, { marginLeft: depth > 0 ? 12 : 0 }]}>
      <View style={styles.verticalLine} />
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>u/{comment.user_id.slice(0, 8)}</Text>
        <Markdown style={commentMdStyles}>{comment.content}</Markdown>

        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity onPress={() => onReply(comment)}>
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity onPress={() => onDelete(comment.id)}>
              <Text style={[styles.replyButtonText, { color: '#ff4500' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {comment.children?.map((child) => (
          <CommentThread
            key={child.id}
            comment={child}
            onReply={onReply}
            onDelete={onDelete}
            currentUserId={currentUserId}
            depth={depth + 1}
          />
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
  const queryClient = useQueryClient();

  // State
  const [selectedPost, setSelectedPost] = useState(null);
  const [discussionVisible, setDiscussionVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('general');

  // New Post State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetSubId, setTargetSubId] = useState('');
  const [images, setImages] = useState([]); // Changed to array
  const [isUploading, setIsUploading] = useState(false);

  // Comment State
  const [replyText, setReplyText] = useState('');
  const [parentComment, setParentComment] = useState(null);

  // --- QUERIES ---
  const { data: communities } = useQuery({
    queryKey: ['subreddits'],
    queryFn: async () => {
      const { data } = await supabase.from('subreddits').select('*');
      if (data?.length > 0) setTargetSubId(data[0].id);
      return data;
    },
  });

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts', selectedSlug],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, subreddits!inner(*), likes(user_id)')
        .eq('subreddits.slug', selectedSlug)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  // --- MUTATIONS ---
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

  // --- MULTI-IMAGE PICKING & UPLOADING ---
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Enabled
      selectionLimit: 5,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris]);
    }
  };

  const uploadMultipleImages = async (uris) => {
    return Promise.all(uris.map(async (uri) => {
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: `image/${fileExt}`,
      });

      const { error } = await supabase.storage.from('post-images').upload(filePath, formData);
      if (error) throw error;

      const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
      return data.publicUrl;
    }));
  };

  const handleCreatePost = async () => {
    if (!title.trim()) return Alert.alert("Required", "Please add a title");
    setIsUploading(true);

    try {
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadMultipleImages(images);
      }

      const { error } = await supabase.from('posts').insert([{
        title,
        content,
        subreddit_id: targetSubId,
        user_id: user.id,
        image_urls: imageUrls // Array column
      }]);

      if (error) throw error;

      queryClient.invalidateQueries(['posts', selectedSlug]);
      setModalVisible(false);
      setTitle(''); setContent(''); setImages([]);
      Alert.alert("Success", "Post created!");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const { data: rawComments, isLoading: loadingComments } = useQuery({
    queryKey: ['comments', selectedPost?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('comments').select('*').eq('post_id', selectedPost.id).order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPost,
  });

  const nestedComments = rawComments ? nestComments(rawComments) : [];

  const handlePostComment = async () => {
    if (!replyText.trim()) return;
    const { error } = await supabase.from('comments').insert([{
      post_id: selectedPost.id,
      parent_id: parentComment?.id || null,
      content: replyText,
      user_id: user.id
    }]);

    if (!error) {
      setReplyText('');
      setParentComment(null);
      queryClient.invalidateQueries(['comments', selectedPost.id]);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert("Delete Comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from('comments').delete().eq('id', commentId);
          queryClient.invalidateQueries(['comments', selectedPost.id]);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={communities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedSlug(item.slug)}
              style={[styles.tab, selectedSlug === item.slug && styles.activeTab]}
            >
              <Text style={selectedSlug === item.slug ? styles.activeText : styles.tabText}>
                r/{item.slug}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loadingPosts ? <ActivityIndicator style={{ marginTop: 20 }} color="#007bff" /> : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isLiked = item.likes?.some(l => l.user_id === user.id);
            const likeCount = item.likes?.length || 0;

            return (
              <TouchableOpacity
                style={styles.postCard}
                activeOpacity={0.9}
                onPress={() => { setSelectedPost(item); setDiscussionVisible(true); }}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.subAvatar}><Text style={styles.subAvatarText}>{item.subreddits?.slug[0].toUpperCase()}</Text></View>
                  <View>
                    <Text style={styles.cardSubText}>r/{item.subreddits?.slug}</Text>
                    <Text style={styles.cardUserText}>u/{item.user_id.slice(0, 8)}</Text>
                  </View>
                </View>

                <Text style={styles.postTitle}>{item.title}</Text>

                {item.image_urls && item.image_urls.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item.image_urls.map((url, index) => (
                      <Image key={index} source={{ uri: url }} style={[styles.postImage, { width: 300, marginRight: 10 }]} resizeMode="cover" />
                    ))}
                  </ScrollView>
                )}

                <View style={styles.previewContent}>
                  <Markdown style={postMdStyles}>{item.content.length > 120 ? item.content.slice(0, 120) + '...' : item.content}</Markdown>
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={[styles.votePill, isLiked && styles.votedPill]}
                    onPress={() => toggleLike.mutate({ postId: item.id, isLiked })}
                  >
                    <Text style={[styles.voteIcon, isLiked && styles.votedText]}>{isLiked ? '🧡' : '⬆️'}</Text>
                    <Text style={[styles.voteCount, isLiked && styles.votedText]}>{likeCount > 0 ? likeCount : 'Vote'}</Text>
                  </TouchableOpacity>

                  <View style={styles.footerAction}>
                    <Text style={styles.footerIcon}>💬</Text>
                    <Text style={styles.footerCount}>Discuss</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* CREATE POST MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.cancelBtn}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>New Post</Text>
            <TouchableOpacity onPress={handleCreatePost} disabled={isUploading}>
              {isUploading ? <ActivityIndicator size="small" color="#007bff" /> : <Text style={styles.postBtn}>Post</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <View style={styles.pickerBox}>
              <Picker selectedValue={targetSubId} onValueChange={(v) => setTargetSubId(v)}>
                {communities?.map(s => <Picker.Item key={s.id} label={`r/${s.slug}`} value={s.id} />)}
              </Picker>
            </View>

            {/* HORIZONTAL IMAGE PICKER PREVIEW */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {images.map((uri, index) => (
                <View key={index} style={{ marginRight: 10 }}>
                  <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                  <TouchableOpacity 
                    onPress={() => setImages(images.filter((_, i) => i !== index))}
                    style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 2 }}
                  >
                    <Text style={{ color: 'white', fontSize: 10 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={[styles.imagePicker, { width: 100, height: 100, marginBottom: 0 }]} onPress={pickImages}>
                 <Text style={{ fontSize: 24, color: '#007bff' }}>+</Text>
              </TouchableOpacity>
            </ScrollView>

            <TextInput placeholder="An interesting title" style={styles.titleInput} value={title} onChangeText={setTitle} />
            <TextInput placeholder="Text (Markdown allowed)" style={styles.bodyInput} value={content} onChangeText={setContent} multiline />
          </ScrollView>
        </View>
      </Modal>

      {/* DISCUSSION MODAL */}
      <Modal visible={discussionVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDiscussionVisible(false)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDiscussionVisible(false)}><Text style={styles.cancelBtn}>Close</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Discussion</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* This ScrollView contains the Post Content + the Comments */}
          <ScrollView style={{ flex: 1, padding: 15 }}>
            {/* POST CONTENT AT THE TOP */}
            <View style={{ marginBottom: 20 }}>
              <View style={styles.cardHeader}>
                 <View style={styles.subAvatar}><Text style={styles.subAvatarText}>{selectedPost?.subreddits?.slug[0].toUpperCase()}</Text></View>
                 <Text style={styles.cardSubText}>r/{selectedPost?.subreddits?.slug}</Text>
              </View>
              <Text style={styles.discTitle}>{selectedPost?.title}</Text>
              
              {selectedPost?.image_urls && selectedPost.image_urls.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                  {selectedPost.image_urls.map((url, index) => (
                    <Image key={index} source={{ uri: url }} style={{ width: 300, height: 250, borderRadius: 12, marginRight: 10 }} resizeMode="cover" />
                  ))}
                </ScrollView>
              )}
              
              <Markdown>{selectedPost?.content || ""}</Markdown>
            </View>

            <View style={styles.divider} />

            {/* COMMENTS SECTION */}
            <Text style={{ fontWeight: 'bold', color: '#666', marginBottom: 10 }}>Comments</Text>
            {loadingComments ? <ActivityIndicator color="#007bff" /> : (
              nestedComments.map(comment => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  onReply={(c) => setParentComment(c)}
                  onDelete={handleDeleteComment}
                  currentUserId={user.id}
                />
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.commentInputContainer}>
            {parentComment && (
              <View style={styles.replyingToBar}>
                <Text style={styles.replyingToText}>Replying to u/{parentComment.user_id.slice(0, 8)}</Text>
                <TouchableOpacity onPress={() => setParentComment(null)}><Text style={{ color: 'red' }}>Cancel</Text></TouchableOpacity>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput placeholder="Add a comment..." style={styles.input} value={replyText} onChangeText={setReplyText} />
              <TouchableOpacity onPress={handlePostComment}><Text style={styles.postBtn}>Send</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ... existing styles remain the same ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { paddingVertical: 12, paddingHorizontal: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e1e4e8' },
  tab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#ddd' },
  activeTab: { backgroundColor: '#007bff', borderColor: '#007bff' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  tabText: { color: '#555', fontWeight: '600' },

  // Card & Image Styles
  postCard: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, padding: 16, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  postImage: { width: '100%', height: 200, borderRadius: 8, marginVertical: 10, backgroundColor: '#eee' },
  detailImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 15 },
  imagePicker: { width: '100%', height: 160, backgroundColor: '#F6F7F8', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#DCDDDE', overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  imagePickerText: { color: '#007bff', fontWeight: '700' },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  subAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  subAvatarText: { color: '#fff', fontWeight: 'bold' },
  cardSubText: { fontWeight: 'bold', fontSize: 14, color: '#1c1c1c' },
  cardUserText: { fontSize: 12, color: '#666' },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1b', marginBottom: 6 },
  previewContent: { maxHeight: 80, overflow: 'hidden' },

  // Interaction Bar
  cardFooter: { flexDirection: 'row', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  votePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7F8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E8EAED' },
  votedPill: { backgroundColor: '#FF450010', borderColor: '#FF450030' },
  votedText: { color: '#FF4500' },
  voteIcon: { fontSize: 16, marginRight: 4 },
  voteCount: { fontSize: 13, fontWeight: '700', color: '#4A4A4A' },
  footerAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7F8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E8EAED' },
  footerIcon: { fontSize: 16 },
  footerCount: { fontSize: 13, fontWeight: '700', color: '#4A4A4A', marginLeft: 6 },

  fab: { position: 'absolute', bottom: 30, right: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 32 },
  modalContent: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  cancelBtn: { color: '#ff4500', fontSize: 16, fontWeight: '600' },
  postBtn: { color: '#007bff', fontSize: 16, fontWeight: 'bold' },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  pickerBox: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 20 },
  titleInput: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1c1c1c' },
  bodyInput: { fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  discTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1b', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  threadContainer: { flexDirection: 'row', marginTop: 15 },
  verticalLine: { width: 2, backgroundColor: '#E5E5E5', marginRight: 10, borderRadius: 1 },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: 12, fontWeight: 'bold', color: '#777', marginBottom: 2 },
  replyButtonText: { color: '#007bff', fontWeight: 'bold', fontSize: 12 },
  commentInputContainer: { borderTopWidth: 1, borderColor: '#eee', paddingHorizontal: 10, paddingVertical: 12, backgroundColor: '#fff' },
  replyingToBar: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8 },
  replyingToText: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
});

const postMdStyles = { body: { fontSize: 14, color: '#444' } };
const commentMdStyles = { body: { fontSize: 14, color: '#333' } };