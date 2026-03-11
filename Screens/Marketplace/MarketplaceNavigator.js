
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
        headerStyle: {
          backgroundColor: C.bg,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        },
        headerTitleStyle: {
          color: C.text,
          fontWeight: '800',
          fontSize: 16,
          letterSpacing: 0.3,
        },
        headerTintColor: C.text,

        // Drawer hamburger
        headerLeft: () => <DrawerMenuButton />,

        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: styles.tabLabel,

        tabBarIcon: ({ focused, color }) => {
          const map = {
            MarketplaceHome: focused ? 'home' : 'home-outline',
            MarketplaceExplore: focused ? 'search' : 'search-outline',
            MarketplaceAddPost: 'add',
            MarketplaceProfile: focused ? 'person' : 'person-outline',
          };

          // Special Add Post button
          if (route.name === 'MarketplaceAddPost') {
            return (
              <View style={[styles.iconContainer, styles.addIcon, focused && styles.addIconActive]}>
                <Ionicons name="add" size={26} color={focused ? C.bg : C.accent} />
              </View>
            );
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={map[route.name]} size={26} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="MarketplaceHome"
        component={MarketplaceHome}
        options={{ title: 'Home', headerTitle: '🛍️  Marketplace' }}
      />

      <Tab.Screen
        name="MarketplaceExplore"
        component={MarketplaceExplore}
        options={{ title: 'Explore', headerTitle: 'Explore' }}
      />

      <Tab.Screen
        name="MarketplaceAddPost"
        component={MarketplaceAddPost}
        options={{ title: 'Add Post', headerTitle: 'New Listing' }}
      />

      <Tab.Screen
        name="MarketplaceProfile"
        component={MarketplaceProfile}
        options={{ title: 'Profile', headerTitle: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // Hamburger button
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
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  iconContainer: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add button
  addIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
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
