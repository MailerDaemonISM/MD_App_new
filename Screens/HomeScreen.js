//HomeScreen.js
import React, { useEffect, useState } from "react";
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
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";
import styles from "./HomeScreen.style";
import { hashtags as hashtagData } from "./hashtags";
import { useUser } from "@clerk/clerk-expo";
import { setUserIfNotExists } from "../api/user";//sanity user create if not exists
import NotificationButton from "../components/notification"; 


// color cycle replaced -> hashtags mapped to color on hashtags.js page
const hashtagColorMap = hashtagData.reduce((map, tag) => {
  map[tag.title] = tag.color;
  return map;
}, {});

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedHashtag, setSelectedHashtag] = useState("All");
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [hasUnseen, setHasUnseen] = useState(true); // assume unseen when app opens


  const postsPerPage = 5;

  // Clerk auth user
  const { isSignedIn, user } = useUser();

  // link Clerk auth user to Sanity on first login
  useEffect(() => {
    if (isSignedIn && user) {
      const userData = {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || "Anonymous",
        username: user.username || user.fullName || "Anonymous",
        image: user.imageUrl || "",
      };

      setUserIfNotExists(userData);
    }
  }, [isSignedIn, user]);

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
      console.error("❌ Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // share handle
  const handleShare = async (post) => {
  try {
    const message = `${post.title}\n\n${
      Array.isArray(post.body)
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

    await Share.share({
      message,
    });
  } catch (error) {
    console.error("Error sharing post:", error);
  }
};


  // fetch sanity user _id by clerkId
  const fetchSanityUserId = async (clerkId) => {
  const query = `*[_type == "user" && clerkId == $clerkId][0]{ _id }`;
  const params = { clerkId };   // MUST be defined
  return await client.fetch(query, params);
};
//handle bookmark using clerkId n posts_id
const handleBookmark = async (postId, clerkId) => {
  if (!clerkId) {
    console.error("ClerkId is missing, cannot bookmark");
    return;
  }

  try {
    // Get sanity user document
    const userDoc = await fetchSanityUserId(clerkId);
    const sanityUserId = userDoc?._id;
    if (!sanityUserId) {
      console.error("No Sanity user found for ClerkId:", clerkId);
      return;
    }

    //  Generate unique key
    const uniqueKey = `${postId}-${Date.now()}`;

    // Patch saved posts
    await client
      .patch(sanityUserId)
      .setIfMissing({ saved_post: [] })
      .append("saved_post", [
        {
          _key: uniqueKey,
          _ref: postId,
          _type: "reference",
        },
      ])
      .commit();
      // Update local state
    setBookmarkedPosts((prev) => new Set([...prev, postId]));

    console.log(" Post bookmarked:", postId);
  } catch (err) {
    console.error(" Error bookmarking post:", err);
  }
};



  const renderItem = ({ item }) => {
    // body content
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
    const sideBarColor = hashtagColorMap[firstTag] || "#ddd"; // fallback gray

    return (
      <TouchableOpacity onPress={() => setSelectedPost(item)}>
        <View style={styles.cardContainer}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
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
            <TouchableOpacity style={styles.iconButton}>
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

  // filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = (post.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesHashtag =
      selectedHashtag === "All" ||
      post.hashtags?.some((tag) => tag.hashtag === selectedHashtag);

    return matchesSearch && matchesHashtag;
  });

  // unique hashtags
  const allHashtags = Array.from(
    new Set(posts.flatMap((p) => p.hashtags?.map((t) => t.hashtag) || []))
  );

  return (
     <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Welcome to Mailer Daemon</Text>
      <View style={styles.headerRightIcons}>
        {/* Search Button */}
        <TouchableOpacity
          onPress={() => setSearchVisible(!searchVisible)}
          style={styles.iconButton}
        >
          <Icon name="search-outline" size={26} color="#333" />
        </TouchableOpacity>

        {/*Notification Button */}
        <NotificationButton />
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

      {/* floating filter button */}
      <FloatingButton
        hashtags={allHashtags}
        selectedHashtag={selectedHashtag}
        onSelectHashtag={setSelectedHashtag}
      />

      {/* Overlay modal */}
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>

              {/* Images first */}
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

              {/* Then body text */}
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

              {/* Hashtags + time */}
              <Text style={styles.modalHashtags}>
                {selectedPost?.hashtags?.length
                  ? selectedPost.hashtags
                      .map((tag) => `${tag.hashtag}`)
                      .join("\n")
                  : "No hashtags"}
              </Text>
              <Text style={styles.modalTime}>
                {new Date(selectedPost?._createdAt).toLocaleString()}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
