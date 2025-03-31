import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import FloatingButton from '../components/floatingButton';
import { client } from '../sanity';

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const postsPerPage = 5;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (isLoading || !hasMorePosts) return;

    setIsLoading(true);
    try {
      const query = `*[_type == "post"] | order(_createdAt desc) [${(currentPage - 1) * postsPerPage}...${currentPage * postsPerPage}] {_id, title, body}`;
      const result = await client.fetch(query);

      if (result.length > 0) {
        setPosts((prevPosts) => {
          const allPosts = [...prevPosts, ...result];
          const uniquePosts = allPosts.filter(
            (post, index, self) => self.findIndex((p) => p._id === post._id) === index
          );
          return uniquePosts;
        });
        setCurrentPage((prevPage) => prevPage + 1);
      } else {
        setHasMorePosts(false); // No more posts to fetch
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = useCallback(({ item }) => (
    <PostItem 
      title={item.title} 
      body={item.body?.[0]?.children?.map((child) => child.text).join(' ') || 'No content available'} 
    />
  ), []);

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WELCOME TO MAILER DAEMON APP!</Text>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id} // Simplified key extraction
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        onEndReached={fetchPosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && <ActivityIndicator size="large" color="#0000ff" />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts found.</Text>
            </View>
          )
        }
      />

      <FloatingButton />
    </View>
  );
};

const PostItem = React.memo(({ title, body }) => (
  <View style={styles.postCard}>
    <Text style={styles.postTitle}>{title}</Text>
    <Text style={styles.postBody}>{body}</Text>
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  postCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  postBody: {
    fontSize: 16,
    color: '#555555',
  },
});

export default HomeScreen;
