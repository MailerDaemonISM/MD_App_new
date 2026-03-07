// ============================================================
// FILE: Screens/Marketplace/MarketplaceHome.js
// DESIGN: Dark luxury — deep navy/charcoal base, electric lime
//         accent, sharp card shadows, bold typography.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, FlatList, ActivityIndicator,
  RefreshControl, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { fetchMarketplaceItems } from '../../api/marketplace';

const { width } = Dimensions.get('window');

// ── Design tokens ──────────────────────────────────────────
const C = {
  bg:        '#0D0F14',
  surface:   '#161A23',
  card:      '#1C2130',
  border:    '#252B3B',
  accent:    '#C8F53C',   // electric lime
  accentDim: '#9EC42B',
  text:      '#EAEDF5',
  textSub:   '#7A8099',
  textMuted: '#4A5168',
  red:       '#FF4D6A',
  blue:      '#4D9FFF',
  purple:    '#9B72FF',
  orange:    '#FF8C42',
  green:     '#3DFFA0',
  yellow:    '#FFD166',
};

const CATEGORIES = [
  { label: 'Electronics', icon: '💻', color: C.blue,   bg: '#0D2240' },
  { label: 'Books',       icon: '📚', color: C.purple, bg: '#1A0D40' },
  { label: 'Clothing',    icon: '👕', color: C.orange, bg: '#402010' },
  { label: 'Furniture',   icon: '🪑', color: C.green,  bg: '#0D3020' },
  { label: 'Sports',      icon: '⚽', color: C.yellow, bg: '#403010' },
  { label: 'Stationery',  icon: '✏️', color: C.accent, bg: '#253010' },
  { label: 'Other',       icon: '📦', color: C.textSub,bg: '#1A1F2E' },
];

function AnimatedCard({ children, index }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,     { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateY,  { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function MarketplaceHome() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems]       = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const loadItems = async () => {
    try {
      const items = await fetchMarketplaceItems();
      setAllItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const trendingItems = allItems.slice(0, 8);
  const filteredItems = searchQuery
    ? allItems.filter(i =>
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderTrendingCard = ({ item, index }) => {
    const url = item.images?.[0]?.asset?.url;
    return (
      <AnimatedCard index={index}>
        <TouchableOpacity
          style={styles.trendCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('MarketplaceExplore', { openItem: item })}
        >
          <View style={styles.trendImgWrap}>
            {url
              ? <Image source={{ uri: url }} style={styles.trendImg} resizeMode="cover" />
              : <View style={[styles.trendImg, styles.noImg]}><Text style={{fontSize:32}}>📦</Text></View>
            }
            <LinearGradient
              colors={['transparent', 'rgba(13,15,20,0.9)']}
              style={styles.trendImgOverlay}
            />
            <View style={styles.trendPricePill}>
              <Text style={styles.trendPriceText}>₹{item.price}</Text>
            </View>
          </View>
          <View style={styles.trendBody}>
            <Text style={styles.trendTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.trendCat}>{item.category}</Text>
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
        }
      >
        {/* ── Hero Header ──────────────────────────────────── */}
        <Animated.View style={[styles.hero, { opacity: headerAnim }]}>
          <LinearGradient
            colors={['#1C2130', '#0D0F14']}
            style={styles.heroBg}
          >
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroLabel}>IIT DHANBAD</Text>
                <Text style={styles.heroTitle}>Marketplace</Text>
              </View>
              <TouchableOpacity
                style={styles.heroExploreBtn}
                onPress={() => navigation.navigate('MarketplaceExplore')}
              >
                <Text style={styles.heroExploreTxt}>Browse All</Text>
                <Ionicons name="arrow-forward" size={14} color={C.bg} />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroSub}>
              Buy &amp; sell within your campus community
            </Text>
            <View style={styles.heroDivider} />
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{allItems.length}</Text>
                <Text style={styles.heroStatLabel}>Active Listings</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{CATEGORIES.length}</Text>
                <Text style={styles.heroStatLabel}>Categories</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>Free</Text>
                <Text style={styles.heroStatLabel}>To List</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Search ───────────────────────────────────────── */}
        <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
          <Ionicons name="search-outline" size={17} color={searchFocused ? C.accent : C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items, categories..."
            placeholderTextColor={C.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            selectionColor={C.accent}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Search Results ───────────────────────────────── */}
        {searchQuery.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {filteredItems.length} RESULT{filteredItems.length !== 1 ? 'S' : ''} FOR "{searchQuery.toUpperCase()}"
            </Text>
            {filteredItems.length === 0
              ? <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTxt}>Nothing found</Text>
                </View>
              : filteredItems.map((item, i) => {
                  const url = item.images?.[0]?.asset?.url;
                  return (
                    <AnimatedCard key={item._id} index={i}>
                      <TouchableOpacity
                        style={styles.searchCard}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('MarketplaceExplore', { openItem: item })}
                      >
                        {url
                          ? <Image source={{ uri: url }} style={styles.searchImg} resizeMode="cover" />
                          : <View style={[styles.searchImg, styles.noImg]}><Text>📦</Text></View>
                        }
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.searchTitle} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.searchCat}>{item.category}</Text>
                          <Text style={styles.searchPrice}>₹{item.price}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
                      </TouchableOpacity>
                    </AnimatedCard>
                  );
                })
            }
          </View>
        ) : (
          <>
            {/* ── Categories ───────────────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>CATEGORIES</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 4, gap: 10 }}
              >
                {CATEGORIES.map((cat, i) => (
                  <AnimatedCard key={cat.label} index={i}>
                    <TouchableOpacity
                      style={[styles.catChip, { backgroundColor: cat.bg, borderColor: cat.color + '40' }]}
                      activeOpacity={0.82}
                      onPress={() => navigation.navigate('MarketplaceExplore', { initialCategory: cat.label })}
                    >
                      <Text style={styles.catChipIcon}>{cat.icon}</Text>
                      <Text style={[styles.catChipLabel, { color: cat.color }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  </AnimatedCard>
                ))}
              </ScrollView>
            </View>

            {/* ── Category Grid (big cards) ─────────────────── */}
            <View style={styles.section}>
              <View style={styles.catGrid}>
                {CATEGORIES.slice(0, 6).map((cat, i) => (
                  <AnimatedCard key={cat.label} index={i}>
                    <TouchableOpacity
                      style={[styles.catGridCard, { borderColor: cat.color + '30' }]}
                      activeOpacity={0.82}
                      onPress={() => navigation.navigate('MarketplaceExplore', { initialCategory: cat.label })}
                    >
                      <View style={[styles.catGridIconBg, { backgroundColor: cat.bg }]}>
                        <Text style={{ fontSize: 26 }}>{cat.icon}</Text>
                      </View>
                      <Text style={[styles.catGridLabel]}>{cat.label}</Text>
                      <View style={[styles.catGridArrow, { backgroundColor: cat.color + '20' }]}>
                        <Ionicons name="arrow-forward" size={12} color={cat.color} />
                      </View>
                    </TouchableOpacity>
                  </AnimatedCard>
                ))}
              </View>
            </View>

            {/* ── Trending ─────────────────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>TRENDING NOW</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MarketplaceExplore')}>
                  <Text style={styles.seeAll}>SEE ALL →</Text>
                </TouchableOpacity>
              </View>
              {isLoading
                ? <ActivityIndicator color={C.accent} style={{ marginVertical: 24 }} />
                : trendingItems.length === 0
                  ? <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>🛒</Text>
                      <Text style={styles.emptyTxt}>No listings yet. Be the first!</Text>
                    </View>
                  : <FlatList
                      data={trendingItems}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={i => i._id}
                      renderItem={renderTrendingCard}
                      contentContainerStyle={{ paddingRight: 16, gap: 12 }}
                    />
              }
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Hero
  hero: { marginBottom: 4 },
  heroBg: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  heroLabel: { fontSize: 10, fontWeight: '800', color: C.accent, letterSpacing: 2, marginBottom: 2 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  heroSub:   { fontSize: 13, color: C.textSub, marginBottom: 16 },
  heroExploreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.accent, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  heroExploreTxt: { fontSize: 12, fontWeight: '800', color: C.bg },
  heroDivider: { height: 1, backgroundColor: C.border, marginBottom: 16 },
  heroStats:   { flexDirection: 'row', alignItems: 'center' },
  heroStat:    { flex: 1, alignItems: 'center' },
  heroStatNum: { fontSize: 20, fontWeight: '900', color: C.accent },
  heroStatLabel: { fontSize: 10, color: C.textMuted, marginTop: 2, letterSpacing: 0.5 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: C.border },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 14,
    marginHorizontal: 16, marginVertical: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: C.border,
    gap: 10,
  },
  searchWrapFocused: { borderColor: C.accent + '60' },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  // Sections
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, marginBottom: 14 },
  seeAll: { fontSize: 10, fontWeight: '800', color: C.accent, letterSpacing: 1 },

  // Category chips (horizontal scroll)
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderRadius: 24, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1,
  },
  catChipIcon:  { fontSize: 16 },
  catChipLabel: { fontSize: 13, fontWeight: '700' },

  // Category grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catGridCard: {
    width: (width - 42) / 2,
    backgroundColor: C.surface, borderRadius: 16,
    padding: 16, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  catGridIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catGridLabel:  { flex: 1, fontSize: 14, fontWeight: '700', color: C.text },
  catGridArrow:  { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  // Trending cards
  trendCard: { width: 160, backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  trendImgWrap: { position: 'relative' },
  trendImg:     { width: '100%', height: 120, backgroundColor: C.surface },
  trendImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50 },
  trendPricePill: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: C.accent, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  trendPriceText: { fontSize: 11, fontWeight: '900', color: C.bg },
  trendBody:  { padding: 10 },
  trendTitle: { fontSize: 12, fontWeight: '700', color: C.text, marginBottom: 3 },
  trendCat:   { fontSize: 10, color: C.textSub },

  noImg: { alignItems: 'center', justifyContent: 'center' },

  // Search results
  searchCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 14,
    marginBottom: 10, padding: 12,
    borderWidth: 1, borderColor: C.border,
    gap: 0,
  },
  searchImg:   { width: 60, height: 60, borderRadius: 12, backgroundColor: C.card },
  searchTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  searchCat:   { fontSize: 11, color: C.accent, marginTop: 3 },
  searchPrice: { fontSize: 14, fontWeight: '900', color: C.red, marginTop: 4 },

  emptyBox: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTxt:  { fontSize: 14, color: C.textMuted },
});