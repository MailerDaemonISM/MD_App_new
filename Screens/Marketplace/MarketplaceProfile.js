// ============================================================
// FILE: Screens/Marketplace/MarketplaceProfile.js
// DESIGN: Dark luxury — profile header with stats, listing cards
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Alert, RefreshControl, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMyListings, markItemAsSold, deleteMarketplaceListing } from '../../api/marketplace';

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
  orange:    '#FF8C42',
};

export default function MarketplaceProfile() {
  const { user } = useUser();
  const [listings,   setListings]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const loadListings = async () => {
    if (!user?.id) return;
    try {
      setListings(await fetchMyListings(user.id));
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useFocusEffect(
    useCallback(() => {
      loadListings();
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const handleMarkSold = (item) => {
    Alert.alert('Mark as Sold?', `"${item.title}" will be marked as sold.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Sold', onPress: async () => {
          try {
            await markItemAsSold(item._id);
            setListings(prev => prev.map(i => i._id === item._id ? { ...i, sold: true } : i));
          } catch { Alert.alert('Error', 'Could not update item.'); }
        }
      },
    ]);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Listing?', `"${item.title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteMarketplaceListing(item._id);
            setListings(prev => prev.filter(i => i._id !== item._id));
          } catch { Alert.alert('Error', 'Could not delete listing.'); }
        }
      },
    ]);
  };

  const total  = listings.length;
  const active = listings.filter(i => i.approved && !i.sold).length;
  const sold   = listings.filter(i => i.sold).length;
  const pending = listings.filter(i => !i.approved && !i.sold).length;

  const getStatus = (item) => {
    if (item.sold)     return { label: 'SOLD',    color: C.red };
    if (item.approved) return { label: 'LIVE',    color: C.green };
    return                    { label: 'PENDING', color: C.orange };
  };

  const renderItem = ({ item, index }) => {
    const url    = item.images?.[0]?.asset?.url;
    const status = getStatus(item);
    return (
      <Animated.View style={{ opacity: 1 }}>
        <View style={[styles.card, item.sold && { opacity: 0.6 }]}>
          <View style={styles.cardImgSide}>
            {url
              ? <Image source={{ uri: url }} style={styles.cardImg} resizeMode="cover" />
              : <View style={[styles.cardImg, styles.noImg]}><Text style={{fontSize:28}}>📦</Text></View>
            }
            <View style={[styles.statusPill, { backgroundColor: status.color + '22', borderColor: status.color + '55' }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusTxt, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardPrice}>₹{item.price}</Text>
            <Text style={styles.cardCat}>{item.category}</Text>

            <View style={styles.actionRow}>
              {!item.sold && item.approved && (
                <TouchableOpacity style={styles.soldBtn} onPress={() => handleMarkSold(item)} activeOpacity={0.85}>
                  <Ionicons name="checkmark" size={12} color={C.bg} />
                  <Text style={styles.soldBtnTxt}>Sold</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.85}>
                <Ionicons name="trash-outline" size={12} color={C.red} />
                <Text style={styles.deleteBtnTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={i => i._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        ListHeaderComponent={
          <>
            {/* ── Profile Header ──────────────────────────── */}
            <Animated.View style={[styles.profileHeader, { opacity: headerAnim }]}>
              <LinearGradient colors={['#1C2130', '#0D0F14']} style={styles.profileGradient}>
                <View style={styles.avatarWrap}>
                  {user?.imageUrl
                    ? <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                    : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitial}>
                          {(user?.fullName || user?.username || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                    )
                  }
                  <View style={styles.avatarAccentRing} />
                </View>

                <Text style={styles.profileName}>{user?.fullName || user?.username || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.emailAddresses?.[0]?.emailAddress || ''}</Text>

                {/* Stats */}
                <View style={styles.statsRow}>
                  {[
                    { num: total,   lbl: 'Total',   color: C.accent  },
                    { num: active,  lbl: 'Active',  color: C.green   },
                    { num: pending, lbl: 'Pending', color: C.orange  },
                    { num: sold,    lbl: 'Sold',    color: C.red     },
                  ].map((s, i) => (
                    <React.Fragment key={s.lbl}>
                      {i > 0 && <View style={styles.statsDivider} />}
                      <View style={styles.statBox}>
                        <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
                        <Text style={styles.statLbl}>{s.lbl}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              </LinearGradient>
            </Animated.View>

            <Text style={styles.sectionLabel}>MY LISTINGS</Text>

            {isLoading && (
              <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 40 }} />
            )}

            {!isLoading && listings.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTxt}>No listings yet</Text>
                <Text style={styles.emptySub}>Tap "Add Post" to sell your first item</Text>
              </View>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Profile Header
  profileHeader: { marginBottom: 4 },
  profileGradient: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: C.accent },
  avatarFallback: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.accent + '22', borderWidth: 2, borderColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 34, fontWeight: '900', color: C.accent },
  avatarAccentRing: {
    position: 'absolute', bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.accent, borderWidth: 2, borderColor: C.bg,
  },
  profileName:  { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 3 },
  profileEmail: { fontSize: 12, color: C.textMuted, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 10, borderWidth: 1, borderColor: C.border, width: '100%' },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900' },
  statLbl: { fontSize: 9, color: C.textMuted, marginTop: 3, letterSpacing: 0.5, fontWeight: '700' },
  statsDivider: { width: 1, height: 32, backgroundColor: C.border },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.textMuted, letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },

  // Cards
  card: {
    flexDirection: 'row', backgroundColor: C.card,
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    height: 120,
  },
  cardImgSide: { width: 110, height: 120, position: 'relative' },
  cardImg: { width: 110, height: 120, backgroundColor: C.surface },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  statusPill: {
    position: 'absolute', bottom: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 2, lineHeight: 18 },
  cardPrice: { fontSize: 17, fontWeight: '900', color: C.accent, marginBottom: 1 },
  cardCat:   { fontSize: 11, color: C.textSub, marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  soldBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.green, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9,
  },
  soldBtnTxt: { color: C.bg, fontSize: 12, fontWeight: '800' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.red + '18', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9,
    borderWidth: 1, borderColor: C.red + '40',
  },
  deleteBtnTxt: { color: C.red, fontSize: 12, fontWeight: '800' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTxt:  { fontSize: 16, color: C.textSub, fontWeight: '700' },
  emptySub:  { fontSize: 13, color: C.textMuted, marginTop: 5 },
});