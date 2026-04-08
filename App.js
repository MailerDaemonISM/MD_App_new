// ============================================================
// FILE: App.js  — REPLACE your existing App.js
// ============================================================

import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import {
  TouchableOpacity, Text, StyleSheet, Animated, View,
  ActivityIndicator,
} from "react-native";
import MDPosts from "./Screens/MDPosts";
import MDHashtags from "./Screens/MDHashtags";
import AboutUs from "./Screens/AboutUS";
import ImportantContacts from "./Screens/ImportantContacts";
import MDLostnFound from "./Screens/MDLost&Found";
import Placementor from "./Screens/Placementor";
import Details from "./Screens/Details";
import AcademicCalendar from "./Screens/AcadCal";
import CampusMap from "./Screens/CampusMap";
import UserScreen from "./Screens/UserScreen";
import Clubs from "./Screens/clubs";
import SignInScreen from "./Screens/sign-in";
import MarketplaceNavigator from "./Screens/Marketplace/MarketplaceNavigator";
import { ClerkProvider, SignedIn, SignedOut, ClerkLoading } from "@clerk/clerk-expo";
import { tokenCache } from "./utils/cache";
import CustomDrawerContent from "./Screens/CustomDrawer";
import HomeScreen, { highlightsStore } from "./Screens/HomeScreen";
import { StatusBar } from "expo-status-bar";

const Drawer = createDrawerNavigator();
const Stack  = createStackNavigator();

// ── Pulsing Highlights header button ──────────────────────
// openHighlights is a ref function set by HomeScreen so the
// button in the drawer header can trigger the sheet inside HomeScreen
function HighlightsHeaderButton({ onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0,  duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }], marginRight: 14 }}>
      <TouchableOpacity
        style={btnStyles.btn}
        onPress={onPress}
        activeOpacity={0.82}
      >
        <Text style={btnStyles.star}>⭐</Text>
        <Text style={btnStyles.txt}>Highlights</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const btnStyles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6600",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    gap: 4,
    // shadow so it pops against the white header
    shadowColor: "#FF6600",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  star: { fontSize: 11 },
  txt:  { fontSize: 12, fontWeight: "800", color: "#fff" },
});



function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{ headerShown: true }}
    >
      {/* HomeScreen — with Highlights button in the drawer header */}
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: "Posts",
          headerRight: () => (
            <HighlightsHeaderButton
              onPress={() => {
                if (highlightsStore.open) {
                  highlightsStore.open();
                }
              }}
            />
          ),
        }}
      />

      {/* All other screens unchanged */}
      <Drawer.Screen name="MDHashtags"       component={MDHashtags} />
      <Drawer.Screen name="AcademicCalendar" component={AcademicCalendar} />
      <Drawer.Screen name="map"              component={CampusMap}  options={{ title: "Campus Map" }} />
      <Drawer.Screen name="clubs"            component={Clubs}      options={{ title: "Clubs & NGOs" }} />
      <Drawer.Screen name="MDLostnFound"     component={MDLostnFound} />
      <Drawer.Screen name="Placementor"      component={Placementor} />
      <Drawer.Screen name="UserScreen"       component={UserScreen}  options={{ title: "Saved Posts" }} />
      <Drawer.Screen name="ImportantContacts" component={ImportantContacts} />
      <Drawer.Screen name="AboutUs"          component={AboutUs} />
      <Drawer.Screen name="Details"          component={Details} />
      <Drawer.Screen
        name="Marketplace"
        component={MarketplaceNavigator}
        options={{ title: "Marketplace", headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}



export default function App() {
  return (
    <ClerkProvider
      publishableKey="pk_test_YWRlcXVhdGUtcGFuZ29saW4tNzYuY2xlcmsuYWNjb3VudHMuZGV2JA"
      tokenCache={tokenCache}
    >
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <ClerkLoading>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        </ClerkLoading>
        <SignedIn>
          <DrawerNavigator />
        </SignedIn>
        <SignedOut>
          <AuthStack />
        </SignedOut>
      </NavigationContainer>
    </ClerkProvider>
  );
}