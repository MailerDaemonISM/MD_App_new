// ============================================================
// FILE: Screens/Marketplace/MarketplaceExplore.js
// DESIGN: Dark luxury — grid of cards, bottom sheet detail modal
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, Modal, Pressable, ScrollView, Linking,
  RefreshControl, Alert, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { fetchMarketplaceItems } from '../../api/marketplace';

const { width, height } = Dimensions.get('window');

const C = {
  bg:        '#0D0F14',
  surface:   '#161A23',
  card:      '#1C2130',
  border:    '#252B3B',
  accent:    '#C8F53C',
  text:      '#EAEDF5',
  textSub:   '#7A8099',
  textMuted: '#4A5168',
  red:       '#FF4D6A',
  green:     '#3DFFA0',
};

const CATEGORIES = ['All','Electronics','Books','Clothing','Furniture','Sports','Stationery','Other'];

const CAT_COLORS = {
  All: '#C8F53C', Electronics: '#4D9FFF', Books: '#9B72FF',
  Clothing: '#FF8C42', Furniture: '#3DFFA0', Sports: '#FFD166',
  Stationery: '#C8F53C', Other: '#7A8099',
};

function AnimatedCard({ children, index }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [0.96, 1] }) }] }}>
      {children}
    </Animated.View>
  );
}

export default function MarketplaceExplore() {
  const route = useRoute();
  const initialCategory = route.params?.initialCategory || 'All';
  const openItem        = route.params?.openItem        || null;

  const [allItems,         setAllItems]         = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isLoading,        setIsLoading]        = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [selectedItem,     setSelectedItem]     = useState(openItem);
  const slideAnim = useRef(new Animated.Value(height)).current;

  const loadItems = async () => {
    try { setAllItems(await fetchMarketplaceItems()); }
    catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadItems(); }, []);
  useEffect(() => { if (openItem) openModal(openItem); }, [openItem]);

  const openModal = (item) => {
    setSelectedItem(item);
    Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
  };
  const closeModal = () => {
    Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(() => setSelectedItem(null));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const filteredItems = selectedCategory === 'All' ? allItems : allItems.filter(i => i.category === selectedCategory);

  const handleWhatsApp = (number) => {
    const url = `https://wa.me/91${number}?text=Hi! I saw your listing on Mailer Daemon Marketplace and I'm interested.`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp not found on this device.'));
  };
  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(() => Alert.alert('Error', 'Could not make a call.'));
  };

  const renderCard = ({ item, index }) => {
    const url = item.images?.[0]?.asset?.url;
    const catColor = CAT_COLORS[item.category] || C.textSub;
    return (
      <AnimatedCard index={index}>
        <TouchableOpacity style={styles.card} activeOpacity={0.87} onPress={() => openModal(item)}>
          <View style={styles.cardImgWrap}>
            {url
              ? <Image source={{ uri: url }} style={styles.cardImg} resizeMode="cover" />
              : <View style={[styles.cardImg, styles.noImg]}><Text style={{fontSize:36}}>📦</Text></View>
            }
            <LinearGradient colors={['transparent', 'rgba(13,15,20,0.85)']} style={styles.cardImgOverlay} />
            <View style={[styles.cardCatBadge, { backgroundColor: catColor + '22', borderColor: catColor + '55' }]}>
              <Text style={[styles.cardCatText, { color: catColor }]}>{item.category}</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.cardFootRow}>
              <Text style={styles.cardPrice}>₹{item.price}</Text>
              <View style={styles.cardSellerRow}>
                <Ionicons name="person-circle-outline" size={12} color={C.textMuted} />
                <Text style={styles.cardSeller} numberOfLines={1}> {item.sellerName}</Text>
              </View>
            </View>
            {item.location
              ? <Text style={styles.cardLoc} numberOfLines={1}>📍 {item.location}</Text>
              : null
            }
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  return (
    <View style={styles.root}>
      {/* Category filter bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map(cat => {
            const color = CAT_COLORS[cat] || C.textSub;
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, active && { backgroundColor: color, borderColor: color }]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterChipTxt, active && { color: C.bg }]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count */}
      {!isLoading && (
        <Text style={styles.countLabel}>{filteredItems.length} LISTING{filteredItems.length !== 1 ? 'S' : ''}</Text>
      )}

      {isLoading ? (
        <View style={styles.centerBox}><ActivityIndicator size="large" color={C.accent} /></View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={{fontSize:54, marginBottom:12}}>🛒</Text>
          <Text style={styles.emptyTxt}>No listings here yet.</Text>
          <Text style={[styles.emptyTxt, {fontSize:12, marginTop:4, color: C.textMuted}]}>Be the first to add one!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderCard}
          keyExtractor={i => i._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        />
      )}

      {/* ── Detail Modal ────────────────────────────────── */}
      <Modal visible={!!selectedItem} transparent animationType="none" onRequestClose={closeModal}>
        <Pressable style={styles.modalBg} onPress={closeModal}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable onPress={e => e.stopPropagation()}>
              {/* Drag handle */}
              <View style={styles.dragHandle} />

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Images */}
                {selectedItem?.images?.length > 0 && (
                  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {selectedItem.images.map((img, idx) => {
                      const url = img?.asset?.url;
                      if (!url) return null;
                      return (
                        <View key={idx} style={styles.modalImgWrap}>
                          <Image source={{ uri: url }} style={styles.modalImg} resizeMode="cover" />
                          <LinearGradient colors={['transparent', 'rgba(20,22,30,0.6)']} style={StyleSheet.absoluteFill} />
                        </View>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Sold badge */}
                {selectedItem?.sold && (
                  <View style={styles.soldBadge}>
                    <Text style={styles.soldBadgeTxt}>● SOLD</Text>
                  </View>
                )}

                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
                  <Text style={styles.modalPrice}>₹{selectedItem?.price}</Text>
                </View>

                <View style={styles.modalMetaRow}>
                  {selectedItem?.category && (
                    <View style={[styles.modalCatBadge, { backgroundColor: (CAT_COLORS[selectedItem.category] || C.textSub) + '22', borderColor: (CAT_COLORS[selectedItem.category] || C.textSub) + '55' }]}>
                      <Text style={[styles.modalCatTxt, { color: CAT_COLORS[selectedItem.category] || C.textSub }]}>{selectedItem.category}</Text>
                    </View>
                  )}
                  {selectedItem?.location && (
                    <Text style={styles.modalLoc}>📍 {selectedItem.location}</Text>
                  )}
                </View>

                {selectedItem?.description ? (
                  <View style={styles.descBox}>
                    <Text style={styles.descLabel}>ABOUT THIS ITEM</Text>
                    <Text style={styles.descTxt}>{selectedItem.description}</Text>
                  </View>
                ) : null}

                {/* Seller */}
                <View style={styles.sellerCard}>
                  <View style={styles.sellerAvatarBox}>
                    <Text style={styles.sellerAvatarTxt}>
                      {(selectedItem?.sellerName || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.sellerName}>{selectedItem?.sellerName}</Text>
                    <Text style={styles.sellerLabel}>Seller</Text>
                  </View>
                  <View style={styles.sellerOnlineDot} />
                </View>

                {/* CTA Buttons */}
                <View style={styles.ctaRow}>
                  {selectedItem?.whatsapp ? (
                    <TouchableOpacity style={styles.waBtn} activeOpacity={0.85} onPress={() => handleWhatsApp(selectedItem.whatsapp)}>
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                      <Text style={styles.ctaBtnTxt}>WhatsApp</Text>
                    </TouchableOpacity>
                  ) : null}
                  {selectedItem?.contact ? (
                    <TouchableOpacity style={styles.callBtn} activeOpacity={0.85} onPress={() => handleCall(selectedItem.contact)}>
                      <Ionicons name="call" size={18} color={C.bg} />
                      <Text style={[styles.ctaBtnTxt, { color: C.bg }]}>Call</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Text style={styles.postedAt}>
                  Listed {selectedItem?.createdAt
                    ? new Date(selectedItem.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : ''}
                </Text>
              </ScrollView>

              <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                <Ionicons name="close" size={16} color={C.text} />
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  filterBar: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  filterChipTxt: { fontSize: 12, fontWeight: '700', color: C.textSub },
  countLabel: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontSize: 15, color: C.textSub, fontWeight: '600' },
  row: { justifyContent: 'space-between', marginBottom: 12 },

  card: { width: (width - 36) / 2, backgroundColor: C.card, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  cardImgWrap: { position: 'relative' },
  cardImg: { width: '100%', height: 136, backgroundColor: C.surface },
  cardImgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  cardCatBadge: { position: 'absolute', top: 10, left: 10, borderRadius: 6, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  cardCatText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8, lineHeight: 18 },
  cardFootRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardPrice: { fontSize: 16, fontWeight: '900', color: C.accent },
  cardSellerRow: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  cardSeller: { fontSize: 10, color: C.textMuted, maxWidth: 60 },
  cardLoc: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  noImg: { alignItems: 'center', justifyContent: 'center' },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: height * 0.92, padding: 20, borderTopWidth: 1, borderColor: C.border },
  dragHandle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalImgWrap: { width: width - 40, height: 230, borderRadius: 16, overflow: 'hidden', marginRight: 12, backgroundColor: C.card },
  modalImg: { width: '100%', height: '100%' },
  soldBadge: { alignSelf: 'flex-start', backgroundColor: C.red + '22', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10, borderWidth: 1, borderColor: C.red + '44' },
  soldBadgeTxt: { color: C.red, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: C.text, flex: 1, marginRight: 12, lineHeight: 26 },
  modalPrice: { fontSize: 24, fontWeight: '900', color: C.accent },
  modalMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  modalCatBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  modalCatTxt: { fontSize: 12, fontWeight: '800' },
  modalLoc: { fontSize: 13, color: C.textSub },
  descBox: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  descLabel: { fontSize: 10, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  descTxt: { fontSize: 14, color: C.textSub, lineHeight: 22 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  sellerAvatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent + '22', borderWidth: 2, borderColor: C.accent + '44', alignItems: 'center', justifyContent: 'center' },
  sellerAvatarTxt: { fontSize: 18, fontWeight: '900', color: C.accent },
  sellerName: { fontSize: 15, fontWeight: '800', color: C.text },
  sellerLabel: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  sellerOnlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.green, borderWidth: 2, borderColor: C.card },
  ctaRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  waBtn: { flex: 1, backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14, gap: 8 },
  callBtn: { flex: 1, backgroundColor: C.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14, gap: 8 },
  ctaBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  postedAt: { fontSize: 11, color: C.textMuted, textAlign: 'center' },
  closeBtn: { position: 'absolute', top: 14, right: 14, backgroundColor: C.card, borderRadius: 20, padding: 8, borderWidth: 1, borderColor: C.border },
});