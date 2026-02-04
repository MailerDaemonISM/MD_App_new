import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BlockedUsersScreen() {
  const [blockedList, setBlockedList] = useState([]);

  useEffect(() => {
    loadBlocked();
  }, []);

  const loadBlocked = async () => {
    const blocked = await AsyncStorage.getItem("blockedUsers");
    if (blocked) setBlockedList(JSON.parse(blocked));
  };

  const unblockUser = async (userId) => {
    const newList = blockedList.filter(id => id !== userId);
    setBlockedList(newList);
    await AsyncStorage.setItem("blockedUsers", JSON.stringify(newList));
    Alert.alert("Success", "User unblocked. Pull down to refresh your feed.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Restricted Accounts</Text>
      <Text style={styles.headerSub}>Users you've hidden from your feed</Text>

      <FlatList
        data={blockedList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.userLabel}>Account ID</Text>
              <Text style={styles.userIdText}>{item.slice(0, 18)}...</Text>
            </View>
            <TouchableOpacity 
              style={styles.unblockBtn} 
              onPress={() => unblockUser(item)}
            >
              <Text style={styles.unblockText}>Restore</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your block list is currently clean.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#666', marginBottom: 25 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  userIdText: { fontSize: 15, color: '#333', fontWeight: '500' },
  unblockBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  unblockText: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#CCC', fontSize: 16 }
});