// ============================================================
// FILE: Screens/Marketplace/MarketplaceNavigator.js
// DESIGN: Dark bottom tab bar matching the luxury dark theme
// ============================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';

import MarketplaceHome    from './MarketplaceHome';
import MarketplaceExplore from './MarketplaceExplore';
import MarketplaceAddPost from './MarketplaceAddPost';
import MarketplaceProfile from './MarketplaceProfile';

const Tab = createBottomTabNavigator();

const C = {
  bg:      '#0D0F14',
  surface: '#161A23',
  border:  '#252B3B',
  accent:  '#C8F53C',
  text:    '#EAEDF5',
  muted:   '#4A5168',
};

// Hamburger button that opens the parent drawer from inside the tab navigator
function DrawerMenuButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      style={styles.menuBtn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.menuLineTop} />
      <View style={styles.menuLineMid} />
      <View style={styles.menuLineBot} />
    </TouchableOpacity>
  );
}

export default function MarketplaceNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:      { backgroundColor: C.bg, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: C.border },
        headerTitleStyle: { color: C.text, fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
        headerTintColor:  C.text,
        // ✅ Hamburger on every tab screen header
        headerLeft: () => <DrawerMenuButton />,
        tabBarStyle:      styles.tabBar,
        tabBarActiveTintColor:   C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const map = {
            MarketplaceHome:    focused ? 'home'       : 'home-outline',
            MarketplaceExplore: focused ? 'search'     : 'search-outline',
            MarketplaceAddPost: 'add',
            MarketplaceProfile: focused ? 'person'     : 'person-outline',
          };
          if (route.name === 'MarketplaceAddPost') {
            return (
              <View style={[styles.addIcon, focused && styles.addIconActive]}>
                <Ionicons name="add" size={24} color={focused ? C.bg : C.accent} />
              </View>
            );
          }
          return <Ionicons name={map[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="MarketplaceHome"    component={MarketplaceHome}    options={{ title: 'Home',     headerTitle: '🛍️  Marketplace' }} />
      <Tab.Screen name="MarketplaceExplore" component={MarketplaceExplore} options={{ title: 'Explore',  headerTitle: 'Explore' }} />
      <Tab.Screen name="MarketplaceAddPost" component={MarketplaceAddPost} options={{ title: 'Add Post', headerTitle: 'New Listing' }} />
      <Tab.Screen name="MarketplaceProfile" component={MarketplaceProfile} options={{ title: 'Profile',  headerTitle: 'My Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // Hamburger menu button
  menuBtn: {
    marginLeft: 16,
    justifyContent: 'center',
    gap: 4,
    width: 24,
    height: 24,
  },
  menuLineTop: { width: 22, height: 2, backgroundColor: C.text, borderRadius: 2 },
  menuLineMid: { width: 16, height: 2, backgroundColor: C.text, borderRadius: 2 },
  menuLineBot: { width: 22, height: 2, backgroundColor: C.text, borderRadius: 2 },

  // Tab bar
  tabBar: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.accent + '18',
    borderWidth: 1.5,
    borderColor: C.accent + '55',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addIconActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
});