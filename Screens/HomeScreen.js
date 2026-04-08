// ============================================================
// FILE: Screens/HomeScreen.js  — FULL REPLACEMENT
// ============================================================

import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useEffect, useRef, useState, useCallback } from "react";
import ImageViewing from "react-native-image-viewing";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import {
  View, Text, TouchableOpacity, ActivityIndicator, Share,
  StyleSheet, Animated, RefreshControl, TextInput, Modal,
  Pressable, ScrollView, Image, FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesomeIcon5 from "react-native-vector-icons/FontAwesome5";
import FloatingButton from "../components/floatingButton";
import { client } from "../sanity";
import { hashtags as hashtagData } from "./hashtags";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";

// ── Safe import of highlights API ─────────────────────────
let fetchPlacementCompanies = async () => [];
let fetchInternshipCompanies = async () => [];
try {
  const api = require("../api/highlights");
  if (api.fetchPlacementCompanies)  fetchPlacementCompanies  = api.fetchPlacementCompanies;
  if (api.fetchInternshipCompanies) fetchInternshipCompanies = api.fetchInternshipCompanies;
} catch (e) {
  console.warn("highlights api not found:", e.message);
}



// ── Hashtag colour map ─────────────────────────────────────
const hashtagColorMap = hashtagData.reduce((map, tag) => {
  map[tag.title] = tag.color;
  return map;
}, {});

// ── Highlights design tokens ───────────────────────────────
const H = {
  accent:    "#FF6600",
  accentBg:  "#FFF3EB",
  blue:      "#1A73E8",
  blueBg:    "#EBF1FB",
  green:     "#0F9D58",
  greenBg:   "#E6F4ED",
  border:    "#F0F0F0",
  text:      "#1A1A1A",
  textSub:   "#555555",
  textMuted: "#999999",
};

// ─────────────────────────────────────────────────────────────
const HomeScreen = () => {

  // ── Original state ────────────────────────────────────────
  const [allPosts,          setAllPosts]          = useState([]);
  const [visiblePosts,      setVisiblePosts]      = useState([]);
  const [isLoading,         setIsLoading]         = useState(false);
  const [currentPage,       setCurrentPage]       = useState(1);
  const [searchVisible,     setSearchVisible]     = useState(false);
  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedPost,      setSelectedPost]      = useState(null);
  const [selectedHashtag,   setSelectedHashtag]   = useState("All");
  const [bookmarkedPosts,   setBookmarkedPosts]   = useState(new Set());
  const [userDocId,         setUserDocId]         = useState(null);
  const [refreshing,        setRefreshing]        = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [imageViewerIndex,  setImageViewerIndex]  = useState(0);
  const postsPerPage = 5;
  const route  = useRoute();
  const { isSignedIn, user } = useUser();

  // ── Highlights state ──────────────────────────────────────
  const [highlightOpen,   setHighlightOpen]   = useState(false);
  const [activeTab,       setActiveTab]       = useState("placement");
  const [companies,       setCompanies]       = useState([]);
  const [companyLoading,  setCompanyLoading]  = useState(false);
  const [companySearch,   setCompanySearch]   = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  // ── Animations ────────────────────────────────────────────
  const highlightPulse = useRef(new Animated.Value(1)).current;
  const sheetAnim      = useRef(new Animated.Value(900)).current;
  const tabUnderline   = useRef(new Animated.Value(0)).current;

  // Pulse the highlights button continuously
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(highlightPulse, { toValue: 1.1,  duration: 750, useNativeDriver: true }),
        Animated.timing(highlightPulse, { toValue: 1.0,  duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // ── Open highlights sheet ─────────────────────────────────
  const openHighlights = () => {
    setHighlightOpen(true);
    setCompanySearch("");
    loadCompanies("placement", "");
    setActiveTab("placement");
    sheetAnim.setValue(900);
    Animated.spring(sheetAnim, {
      toValue: 0, tension: 60, friction: 12, useNativeDriver: true,
    }).start();
  };

  // Register so App.js headerRight button can trigger this
  useEffect(() => {
    highlightsStore.open = openHighlights;
    return () => { highlightsStore.open = null; };
  }, []);



  const closeHighlights = () => {
    Animated.timing(sheetAnim, {
      toValue: 900, duration: 280, useNativeDriver: true,
    }).start(() => {
      setHighlightOpen(false);
      setSelectedCompany(null);
      setActiveTab("placement");
    });
  };

  // ── Load companies from Sanity ────────────────────────────
  const loadCompanies = async (tab, search) => {
    setCompanyLoading(true);
    try {
      const data = tab === "placement"
        ? await fetchPlacementCompanies(search)
        : await fetchInternshipCompanies(search);
      setCompanies(data || []);
    } catch (err) {
      console.error("loadCompanies error:", err);
      setCompanies([]);
    } finally {
      setCompanyLoading(false);
    }
  };

  // Switch tab with animation
  const switchTab = (tab) => {
    setActiveTab(tab);
    setCompanySearch("");
    setCompanies([]);
    loadCompanies(tab, "");
    Animated.timing(tabUnderline, {
      toValue: tab === "placement" ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Debounced search
  useEffect(() => {
    if (!highlightOpen) return;
    const t = setTimeout(() => loadCompanies(activeTab, companySearch), 350);
    return () => clearTimeout(t);
  }, [companySearch]);

  // ── ORIGINAL: bookmarks ───────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const fetchUserBookmarks = async () => {
        if (!isSignedIn || !user) return;
        try {
          const query = `*[_type=="user" && clerkId==$clerkId][0]{
            _id, saved_post[]->{ _id }
          }`;
          const data = await client.fetch(query, { clerkId: user.id });
          setUserDocId(data?._id);
          if (data?.saved_post) {
            setBookmarkedPosts(new Set(data.saved_post.map((p) => p._id)));
          } else {
            setBookmarkedPosts(new Set());
          }
        } catch (err) { console.error("Error fetching user bookmarks:", err); }
      };
      fetchUserBookmarks();
    }, [isSignedIn, user])
  );

  // ── ORIGINAL: fetch posts ─────────────────────────────────
  const fetchAllPosts = async () => {
    setIsLoading(true);
    try {
      const query = `*[_type == "post"] | order(_createdAt desc) {
        _id, title, body, images[]{asset->{url}},
        _createdAt, hashtags[]->{ _id, hashtag }
      }`;
      const result = await client.fetch(query);
      setAllPosts(result);
      setVisiblePosts(result.slice(0, postsPerPage));
    } catch (error) { console.error("❌ Error fetching posts:", error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAllPosts(); }, []);

  // ── ORIGINAL: toggle bookmark ─────────────────────────────
  const toggleBookmark = async (postId) => {
    if (!userDocId || !user) return;
    try {
      const isBookmarked = bookmarkedPosts.has(postId);
      setBookmarkedPosts((prev) => {
        const s = new Set(prev);
        isBookmarked ? s.delete(postId) : s.add(postId);
        return s;
      });
      if (isBookmarked) {
        await client.patch(userDocId).unset([`saved_post[_ref=="${postId}"]`]).commit();
      } else {
        await client.patch(userDocId)
          .setIfMissing({ saved_post: [] })
          .append("saved_post", [{ _type: "reference", _ref: postId }])
          .commit();
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      setBookmarkedPosts((prev) => {
        const s = new Set(prev);
        bookmarkedPosts.has(postId) ? s.add(postId) : s.delete(postId);
        return s;
      });
    }
  };

  // ── ORIGINAL: share ───────────────────────────────────────
  const onShare = async (post) => {
    try {
      const bodyText = Array.isArray(post.body)
        ? post.body.map((b) => Array.isArray(b.children)
            ? b.children.map((c) => c.text).join("") : "").join("\n\n")
        : typeof post.body === "string" ? post.body : "";
      await Share.share({
        title: post.title,
        message: `${post.title}\n\n${bodyText}\n\nShared via Mailer Daemon`,
      });
    } catch (e) { console.error("Error sharing:", e); }
  };

  // ── ORIGINAL: render post card ────────────────────────────
  const renderItem = ({ item }) => {
    const description = Array.isArray(item.body)
      ? item.body.map((b) => Array.isArray(b.children)
          ? b.children.map((c) => c.text).join("") : "").join("\n\n")
      : typeof item.body === "string" ? item.body : "";
    const firstTag     = item.hashtags?.[0]?.hashtag;
    const sideBarColor = hashtagColorMap[firstTag] || "#FFC5C5";
    const hasImages    = Array.isArray(item.images) && item.images.some((img) => img?.asset?.url);
    const isBookmarked = bookmarkedPosts.has(item._id);

    return (
      <TouchableOpacity onPress={() => setSelectedPost(item)}>
        <View style={[styles.cardContainer, hasImages && { paddingBottom: 0 }]}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardCategory}>Category</Text>
            <Text style={styles.cardDescription} numberOfLines={3} ellipsizeMode="tail">
              {description || "No content available"}
            </Text>
            {hasImages && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10, marginBottom: 6 }}
                contentContainerStyle={{ paddingRight: 16 }}
                pagingEnabled decelerationRate="fast">
                {item.images.map((img, idx) => {
                  const imageUrl = img?.asset?.url;
                  if (!imageUrl) return null;
                  if (idx === 2 && item.images.length > 3) {
                    return (
                      <View key={idx} style={{ position: "relative", marginRight: 8 }}>
                        <Image source={{ uri: imageUrl }}
                          style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: "#fff" }}
                          resizeMode="contain" />
                        <View style={{ position:"absolute", top:0, left:0, width:70, height:70,
                          borderRadius:10, backgroundColor:"rgba(0,0,0,0.5)",
                          justifyContent:"center", alignItems:"center" }}>
                          <Text style={{ color:"#fff", fontWeight:"bold", fontSize:16 }}>
                            +{item.images.length - 3}
                          </Text>
                        </View>
                      </View>
                    );
                  }
                  if (idx > 2) return null;
                  return (
                    <Image key={idx} source={{ uri: imageUrl }}
                      style={{ width:70, height:70, borderRadius:10, marginRight:8, backgroundColor:"#fff" }}
                      resizeMode="contain" />
                  );
                })}
              </ScrollView>
            )}
            <View style={styles.cardFooter}>
              <View>
                {item.hashtags?.length
                  ? item.hashtags.map((t, i) => <Text key={i} style={styles.cardLabel}>{t.hashtag}</Text>)
                  : <Text style={styles.cardLabel}>No hashtags</Text>}
              </View>
              <Text style={styles.cardTime}>{new Date(item._createdAt).toLocaleString()}</Text>
            </View>
          </View>
          <View style={[styles.sideBarContainer, { backgroundColor: sideBarColor }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => toggleBookmark(item._id)}>
              <Icon name={isBookmarked ? "bookmark" : "bookmark-outline"} size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}
              onPress={() => Linking.openURL("https://www.instagram.com/md_iit_dhanbad?igsh=MXRjbml1emxmcmQwMg==")}>
              <FontAwesomeIcon5 name="instagram" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => onShare(item)}>
              <Icon name="share-social-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── ORIGINAL: filter & pagination ────────────────────────
  const filteredPosts = allPosts.filter((post) => {
    const matchSearch   = (post.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchHashtag  = selectedHashtag === "All" ||
      post.hashtags?.some((tag) => tag.hashtag === selectedHashtag);
    return matchSearch && matchHashtag;
  });
  const postsToRender = searchQuery || selectedHashtag !== "All" ? filteredPosts : visiblePosts;
  const allHashtags   = Array.from(new Set(allPosts.flatMap((p) => p.hashtags?.map((t) => t.hashtag) || [])));

  const loadMorePosts = () => {
    if (isLoading) return;
    const nextPage  = currentPage + 1;
    const start     = (nextPage - 1) * postsPerPage;
    const nextPosts = allPosts.slice(start, start + postsPerPage);
    if (nextPosts.length > 0) {
      setVisiblePosts((prev) => [...prev, ...nextPosts]);
      setCurrentPage(nextPage);
    }
  };
  const onRefresh = async () => { setRefreshing(true); await fetchAllPosts(); setRefreshing(false); };

  // ── Highlights: company card ──────────────────────────────
  const renderCompanyCard = ({ item, index }) => {
    const students    = item.students || [];
    const packageInfo = activeTab === "placement" ? item.package : item.stipend;
    const accentColor = activeTab === "placement" ? H.blue : H.green;
    const accentBg    = activeTab === "placement" ? H.blueBg : H.greenBg;

    return (
      <TouchableOpacity
        style={hStyles.companyCard}
        activeOpacity={0.8}
        onPress={() => setSelectedCompany({ ...item, students, packageInfo, type: activeTab })}
      >
        {/* Logo */}
        <View style={hStyles.logoBox}>
          {item.logoUrl
            ? <Image source={{ uri: item.logoUrl }} style={hStyles.logo} resizeMode="contain" />
            : <View style={[hStyles.logoFallback, { backgroundColor: accentColor + "18" }]}>
                <Text style={[hStyles.logoFallbackTxt, { color: accentColor }]}>
                  {(item.companyName || "?")[0].toUpperCase()}
                </Text>
              </View>
          }
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={hStyles.companyName} numberOfLines={1}>{item.companyName}</Text>
          {item.sector ? <Text style={hStyles.sector}>{item.sector}</Text> : null}
          <View style={hStyles.metaRow}>
            {packageInfo ? (
              <View style={[hStyles.badge, { backgroundColor: accentBg }]}>
                <Text style={[hStyles.badgeTxt, { color: accentColor }]}>
                  {activeTab === "placement" ? "💼 " : "📋 "}{packageInfo}
                </Text>
              </View>
            ) : null}
            <View style={[hStyles.badge, { backgroundColor: H.accentBg }]}>
              <Text style={[hStyles.badgeTxt, { color: H.accent }]}>
                👥 {students.length} students
              </Text>
            </View>
          </View>
        </View>

        {/* Year */}
        <View style={hStyles.yearPill}>
          <Text style={hStyles.yearTxt}>{item.year}</Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#CCC" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    );
  };

  // Tab underline position
  const underlineLeft = tabUnderline.interpolate({
    inputRange: [0, 1], outputRange: ["0%", "50%"],
  });

  // ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ══ HEADER ══════════════════════════════════════════ */}
      <View style={styles.header}>
        {/* Left: title */}
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>Welcome to Mailer Daemon</Text>
        </View>
        {/* Right: icons row */}
        <View style={styles.headerRightIcons}>
          {/* Search icon */}
          <TouchableOpacity
            onPress={() => setSearchVisible(!searchVisible)}
            style={{ marginRight: 8 }}
          >
            <Icon name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>


      {/* ── Search bar ───────────────────────────────────── */}
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
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Icon name="close" size={22} color="#777" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Post list ────────────────────────────────────── */}
      {isLoading && visiblePosts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      ) : (
        <FlatList
          data={postsToRender}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          onEndReachedThreshold={0.5}
          onEndReached={!searchQuery && selectedHashtag === "All" ? loadMorePosts : null}
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
              refreshing={refreshing} onRefresh={onRefresh}
              tintColor="#ff6b6b" colors={["#ff6b6b", "#feca57", "#1dd1a1"]}
              progressBackgroundColor="#fff"
            />
          }
          scrollEventThrottle={16}
        />
      )}

      {/* ── Floating hashtag button ───────────────────────── */}
      <FloatingButton
        hashtags={allHashtags}
        selectedHashtag={selectedHashtag}
        onSelectHashtag={setSelectedHashtag}
      />

      {/* ── Post detail modal (original) ─────────────────── */}
      <Modal
        visible={!!selectedPost} animationType="fade" transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedPost(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
              {selectedPost?.images?.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  pagingEnabled decelerationRate="fast" snapToInterval={280} style={{ marginVertical: 10 }}>
                  {selectedPost.images.map((img, idx) => {
                    const imageUrl = img?.asset?.url;
                    if (!imageUrl) return null;
                    return (
                      <TouchableOpacity key={idx} onPress={() => { setImageViewerIndex(idx); setIsImageViewerVisible(true); }}>
                        <Image source={{ uri: imageUrl }}
                          style={{ width: 270, height: 270, borderRadius: 10, marginRight: 10 }}
                          resizeMode="cover" />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
              <Text style={styles.modalDescription}>
                {Array.isArray(selectedPost?.body)
                  ? selectedPost.body.map((b) =>
                      Array.isArray(b.children) ? b.children.map((c) => c.text).join("") : ""
                    ).join("\n\n")
                  : typeof selectedPost?.body === "string" ? selectedPost.body : "No content available"}
              </Text>
              <Text style={styles.modalHashtags}>
                {selectedPost?.hashtags?.length
                  ? selectedPost.hashtags.map((tag) => tag.hashtag).join("\n")
                  : "No hashtags"}
              </Text>
              <Text style={styles.modalTime}>{new Date(selectedPost?._createdAt).toLocaleString()}</Text>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {selectedPost?.images?.length > 0 && (
        <ImageViewing
          images={selectedPost.images.map((img) => ({ uri: img.asset.url }))}
          imageIndex={imageViewerIndex}
          visible={isImageViewerVisible}
          onRequestClose={() => setIsImageViewerVisible(false)}
          presentationStyle="overFullScreen"
        />
      )}

      {/* ══════════════════════════════════════════════════════
          HIGHLIGHTS BOTTOM SHEET
      ══════════════════════════════════════════════════════ */}
      <Modal
        visible={highlightOpen} transparent animationType="none"
        onRequestClose={closeHighlights} statusBarTranslucent
      >
        <Pressable style={hStyles.overlay} onPress={closeHighlights}>
          <Animated.View
            style={[hStyles.sheet, { transform: [{ translateY: sheetAnim }] }]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>

              {/* Drag handle */}
              <View style={hStyles.handle} />

              {/* Header */}
              <View style={hStyles.sheetHeaderRow}>
                <View>
                  <Text style={hStyles.sheetTitle}>🌟 Highlights</Text>
                  <Text style={hStyles.sheetSub}>Campus Placement & Internship Results</Text>
                </View>
                <TouchableOpacity style={hStyles.xBtn} onPress={closeHighlights}>
                  <Icon name="close" size={18} color="#555" />
                </TouchableOpacity>
              </View>

              {/* ── Tabs ─────────────────────────────────── */}
              <View style={hStyles.tabWrapper}>
                {/* Animated underline */}
                <Animated.View style={[hStyles.tabUnderline, { left: underlineLeft }]} />
                <TouchableOpacity
                  style={hStyles.tabItem}
                  onPress={() => switchTab("placement")}
                  activeOpacity={0.8}
                >
                  <Text style={[hStyles.tabTxt, activeTab === "placement" && hStyles.tabTxtOn]}>
                    🎓 Placements
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={hStyles.tabItem}
                  onPress={() => switchTab("intern")}
                  activeOpacity={0.8}
                >
                  <Text style={[hStyles.tabTxt, activeTab === "intern" && hStyles.tabTxtOn]}>
                    🎒 Internships
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Search ───────────────────────────────── */}
              <View style={hStyles.searchRow}>
                <Ionicons name="search-outline" size={16} color={H.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={hStyles.searchInput}
                  placeholder={`Search ${activeTab === "placement" ? "placement" : "internship"} companies...`}
                  placeholderTextColor={H.textMuted}
                  value={companySearch}
                  onChangeText={setCompanySearch}
                  selectionColor={H.accent}
                />
                {companySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setCompanySearch("")}>
                    <Ionicons name="close-circle" size={16} color={H.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* ── Company list ─────────────────────────── */}
              {companyLoading ? (
                <View style={hStyles.centerBox}>
                  <ActivityIndicator size="large" color={H.accent} />
                  <Text style={hStyles.centerTxt}>Loading...</Text>
                </View>
              ) : companies.length === 0 ? (
                <View style={hStyles.centerBox}>
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>🏢</Text>
                  <Text style={hStyles.emptyTxt}>No companies found</Text>
                  <Text style={hStyles.emptySub}>
                    {companySearch
                      ? "Try a different search term"
                      : "Admin will add data soon"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={companies}
                  keyExtractor={(item) => item._id}
                  renderItem={renderCompanyCard}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                />
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ══════════════════════════════════════════════════════
          COMPANY DETAIL MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedCompany && (
        <Modal
          visible={!!selectedCompany} transparent animationType="slide"
          onRequestClose={() => setSelectedCompany(null)} statusBarTranslucent
        >
          <Pressable style={hStyles.overlay} onPress={() => setSelectedCompany(null)}>
            <View style={[hStyles.sheet, { maxHeight: "78%" }]}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View style={hStyles.handle} />

                {/* Company header */}
                <View style={hStyles.detailTop}>
                  {/* Logo */}
                  <View style={hStyles.detailLogoBox}>
                    {selectedCompany.logoUrl
                      ? <Image source={{ uri: selectedCompany.logoUrl }}
                          style={hStyles.detailLogo} resizeMode="contain" />
                      : <View style={[hStyles.logoFallback, {
                            backgroundColor: (selectedCompany.type === "placement" ? H.blue : H.green) + "18",
                            width: "100%", height: "100%",
                          }]}>
                          <Text style={[hStyles.logoFallbackTxt, {
                            color: selectedCompany.type === "placement" ? H.blue : H.green,
                          }]}>
                            {(selectedCompany.companyName || "?")[0].toUpperCase()}
                          </Text>
                        </View>
                    }
                  </View>

                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={hStyles.detailName}>{selectedCompany.companyName}</Text>
                    {selectedCompany.sector
                      ? <Text style={hStyles.detailSector}>{selectedCompany.sector}</Text>
                      : null}
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      {selectedCompany.packageInfo && (
                        <View style={[hStyles.badge, {
                          backgroundColor: selectedCompany.type === "placement" ? H.blueBg : H.greenBg
                        }]}>
                          <Text style={[hStyles.badgeTxt, {
                            color: selectedCompany.type === "placement" ? H.blue : H.green
                          }]}>
                            {selectedCompany.type === "placement" ? "💼 " : "📋 "}
                            {selectedCompany.packageInfo}
                          </Text>
                        </View>
                      )}
                      {/* Duration for internships */}
                      {selectedCompany.type === "intern" && selectedCompany.duration && (
                        <View style={[hStyles.badge, { backgroundColor: "#F5F5F5" }]}>
                          <Text style={[hStyles.badgeTxt, { color: H.textSub }]}>
                            ⏱ {selectedCompany.duration}
                          </Text>
                        </View>
                      )}
                      <View style={[hStyles.badge, { backgroundColor: H.accentBg }]}>
                        <Text style={[hStyles.badgeTxt, { color: H.accent }]}>
                          📅 {selectedCompany.year}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={hStyles.xBtn} onPress={() => setSelectedCompany(null)}>
                    <Icon name="close" size={18} color="#555" />
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: H.border, marginVertical: 14 }} />

                {/* Students header */}
                <View style={hStyles.studentsHeaderRow}>
                  <Text style={hStyles.studentsSectionTitle}>
                    {selectedCompany.type === "placement" ? "🎓 Placed Students" : "🎒 Interns Selected"}
                  </Text>
                  <View style={hStyles.countPill}>
                    <Text style={hStyles.countPillTxt}>{selectedCompany.students.length} selected</Text>
                  </View>
                </View>

                {/* Student list */}
                {selectedCompany.students.length === 0 ? (
                  <View style={hStyles.centerBox}>
                    <Text style={hStyles.emptyTxt}>No student data yet</Text>
                  </View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                    {selectedCompany.students.map((stu, idx) => (
                      <View key={idx} style={hStyles.studentRow}>
                        <View style={hStyles.studentAvatar}>
                          <Text style={hStyles.studentAvatarTxt}>
                            {(stu.name || "?")[0].toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={hStyles.studentName}>{stu.name}</Text>
                          <Text style={hStyles.studentBranch}>{stu.branch}</Text>
                        </View>
                        <View style={hStyles.numBadge}>
                          <Text style={hStyles.numBadgeTxt}>#{idx + 1}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default HomeScreen;

// ── Module-level store so App.js headerRight button can call openHighlights ──
export const highlightsStore = { open: null };

// ── ORIGINAL styles (100% unchanged) ─────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#f9f9f9",
    paddingHorizontal: 0, paddingBottom: 0,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingVertical: 12,
    backgroundColor: "#FFFFFF", paddingHorizontal: 16,
  },
  headerTitle:     { fontSize: 20, fontWeight: "700", color: "#333" },
  headerRightIcons:{ flexDirection: "row", alignItems: "center" },
  iconButton:      { paddingVertical: 12, paddingHorizontal: 10 },
  cardContainer: {
    flexDirection: "row", backgroundColor: "#FFFFFF",
    borderRadius: 12, marginBottom: 16, marginHorizontal: 16,
    overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  cardTextContainer: { flex: 3, paddingVertical: 16, paddingHorizontal: 20 },
  cardTitle:       { fontSize: 17, fontWeight: "bold", color: "#333333", marginBottom: 4 },
  cardCategory:    { fontSize: 10, fontStyle: "italic", color: "#666", marginBottom: 6 },
  cardDescription: { fontSize: 14, color: "#555", marginBottom: 10 },
  cardFooter:      { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  cardLabel:       { fontSize: 12, color: "#777" },
  cardTime:        { fontSize: 12, color: "#777" },
  sideBarContainer:{ flex: 0.5, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  loadingContainer:{ flex: 1, justifyContent: "center", alignItems: "center" },
  loadingFooter:   { padding: 10, alignItems: "center" },
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5",
    borderRadius: 8, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 10,
  },
  searchBox:       { flex: 1, height: 40, fontSize: 16, color: "#333" },
  clearButton:     { paddingLeft: 6 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20,
    width: "100%", maxHeight: "90%",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
  },
  modalTitle:       { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#222" },
  modalDescription: { fontSize: 15, color: "#444", marginBottom: 15, lineHeight: 22 },
  modalHashtags:    { fontSize: 14, color: "#007AFF", marginBottom: 12 },
  modalTime:        { fontSize: 12, color: "#888", marginBottom: 10 },
});

// ── Highlights-only styles (new) ──────────────────────────
const hStyles = StyleSheet.create({
  // Sheet
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingBottom: 8, maxHeight: "88%",
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 24,
  },
  handle: {
    width: 40, height: 4, backgroundColor: "#E0E0E0",
    borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 14,
  },
  sheetHeaderRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 14,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: H.text },
  sheetSub:   { fontSize: 12, color: H.textMuted, marginTop: 2 },
  xBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center",
  },

  // Tabs
  tabWrapper: {
    flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#F0F0F0",
    marginBottom: 14, position: "relative",
  },
  tabUnderline: {
    position: "absolute", bottom: -2, height: 2,
    width: "50%", backgroundColor: H.accent,
  },
  tabItem:  { flex: 1, alignItems: "center", paddingBottom: 10 },
  tabTxt:   { fontSize: 14, fontWeight: "600", color: H.textMuted },
  tabTxtOn: { color: H.accent, fontWeight: "800" },

  // Search
  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F5F5F5", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: H.text },

  // Company card
  companyCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#F0F0F0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  logoBox: {
    width: 50, height: 50, borderRadius: 12, backgroundColor: "#F8F8F8",
    alignItems: "center", justifyContent: "center",
    marginRight: 12, borderWidth: 1, borderColor: "#F0F0F0", overflow: "hidden",
  },
  logo:           { width: 44, height: 44 },
  logoFallback:   { alignItems: "center", justifyContent: "center" },
  logoFallbackTxt:{ fontSize: 20, fontWeight: "900" },
  companyName:    { fontSize: 15, fontWeight: "700", color: H.text, marginBottom: 2 },
  sector:         { fontSize: 11, color: H.textMuted, marginBottom: 5 },
  metaRow:        { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  badgeTxt: { fontSize: 11, fontWeight: "700" },
  yearPill: {
    backgroundColor: "#F5F5F5", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, marginLeft: 6,
  },
  yearTxt: { fontSize: 11, fontWeight: "700", color: H.textSub },

  // Empty / loading
  centerBox: { alignItems: "center", paddingVertical: 40 },
  centerTxt: { fontSize: 13, color: H.textMuted, marginTop: 10 },
  emptyTxt:  { fontSize: 15, fontWeight: "700", color: H.textSub },
  emptySub:  { fontSize: 12, color: H.textMuted, marginTop: 4 },

  // Company detail
  detailTop: { flexDirection: "row", alignItems: "flex-start" },
  detailLogoBox: {
    width: 64, height: 64, borderRadius: 14, backgroundColor: "#F8F8F8",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#F0F0F0", overflow: "hidden",
  },
  detailLogo: { width: 58, height: 58 },
  detailName:   { fontSize: 18, fontWeight: "800", color: H.text },
  detailSector: { fontSize: 12, color: H.textMuted, marginTop: 2 },

  // Students
  studentsHeaderRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  studentsSectionTitle: { fontSize: 15, fontWeight: "800", color: H.text },
  countPill: {
    backgroundColor: "#FFF3EB", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  countPillTxt: { fontSize: 12, fontWeight: "700", color: H.accent },
  studentRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 12,
  },
  studentAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#FFF3EB", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#FFCC99",
  },
  studentAvatarTxt: { fontSize: 16, fontWeight: "800", color: H.accent },
  studentName:   { fontSize: 14, fontWeight: "700", color: H.text },
  studentBranch: { fontSize: 12, color: H.textMuted, marginTop: 2 },
  numBadge: {
    backgroundColor: "#F5F5F5", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  numBadgeTxt: { fontSize: 11, fontWeight: "700", color: H.textSub },
});