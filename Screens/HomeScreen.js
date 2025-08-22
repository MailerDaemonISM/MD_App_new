import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Image
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";
import styles from "./HomeScreen.style"; 

const colorCycle = ["#FFC5C5", "#FFD59D", "#FECACA", "#CDFAFF"];

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null); // For overlay
  const postsPerPage = 5;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (isLoading || !hasMorePosts) return;

    setIsLoading(true);
    try {
      const query = `*[_type == "post"] | order(_createdAt desc) [${
        (currentPage - 1) * postsPerPage
      }...${currentPage * postsPerPage}] {
        _id,
        title,
        body,
        images[]{asset->{url}},
        _createdAt,
        hashtags[]->{
          _id,
          hashtag
        }
      }`;

      const result = await client.fetch(query);

      if (result.length > 0) {
        setPosts((prevPosts) => [...prevPosts, ...result]);
        setCurrentPage((prevPage) => prevPage + 1);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const description =
      item.body?.[0]?.children?.map((child) => child.text).join(" ") || "";

    const sideBarColor = colorCycle[index % 4];

    return (
      <TouchableOpacity onPress={() => setSelectedPost(item)}>
        <View style={styles.cardContainer}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCategory}>Category</Text>
            <Text
              numberOfLines={3}
              ellipsizeMode="tail"
              style={styles.cardDescription}
            >
              {description || "No content available"}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardLabel}>
                {item.hashtags?.length
                  ? (() => {
                      const maxToShow = 2;
                      const tagsToShow = item.hashtags
                        .slice(0, maxToShow)
                        .map((tag) => `${tag.hashtag}`);
                      const extraCount = item.hashtags.length - maxToShow;

                      return extraCount > 0
                        ? [...tagsToShow, `+${extraCount} more`].join("\n")
                        : tagsToShow.join("\n");
                    })()
                  : "No hashtags"}
              </Text>
              <Text style={styles.cardTime}>
                {new Date(item._createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.sideBarContainer,
              { backgroundColor: sideBarColor },
            ]}
          >
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="bookmark-outline" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesomeIcon5 name="facebook-f" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="share-social-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>
        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            onPress={() => setSearchVisible(!searchVisible)}
            style={styles.iconButton}
          >
            <Icon name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <TextInput
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBox}
        />
      )}

      {isLoading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          onEndReachedThreshold={0.5}
          onEndReached={fetchPosts}
          ListFooterComponent={
            isLoading && (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#333" />
                <Text>Loading more posts...</Text>
              </View>
            )
          }
        />
      )}

      <FloatingButton />
{/*overlay modal for displaying post details */}
<Modal
  visible={!!selectedPost}
  animationType="slide"
  transparent
  onRequestClose={() => setSelectedPost(null)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {/* Close Button */}
      <TouchableOpacity
        style={[
          styles.closeButton,
          {
            backgroundColor:
              colorCycle[selectedPost?.index % colorCycle.length],
          },
        ]}
        onPress={() => setSelectedPost(null)}
      >
        <Icon name="close" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
      <Text style={styles.modalCategory}>Category</Text>

      {/*Show images if present */}
      {selectedPost?.images && selectedPost.images.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
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
        {selectedPost?.body?.[0]?.children
          ?.map((child) => child.text)
          .join(" ") || "No content available"}
      </Text>
      <Text style={styles.modalHashtags}>
        {selectedPost?.hashtags?.length
          ? selectedPost.hashtags.map((tag) => `${tag.hashtag}`).join("\n")
          : "No hashtags"}
      </Text>
      <Text style={styles.modalTime}>
        {new Date(selectedPost?._createdAt).toLocaleString()}
      </Text>
    </View>
  </View>
</Modal>

    </View>
  );
};

export default HomeScreen;

