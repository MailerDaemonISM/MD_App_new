// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import MDPosts from "./Screens/MDPosts";
import MDHashtags from "./Screens/MDHashtags";
import AboutUs from "./Screens/AboutUS";
import ContactUs from "./Screens/ContactUs";
import MDLostnFound from "./Screens/MDLost&Found";
import Placementor from "./Screens/Placementor";
import Details from "./Screens/Details";
import AcademicCalendar from "./Screens/AcadCal";
import CampusMap from "./Screens/CampusMap";
import UserScreen from "./Screens/UserScreen";
import Clubs from "./Screens/clubs";

import SignInScreen from "./Screens/sign-in";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { tokenCache } from "./utils/cache";
import CustomDrawerContent from "./Screens/CustomDrawer";
import HomeScreen from "./Screens/HomeScreen";

import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Drawer navigator for signed-in users
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{ headerShown: true }}
    >
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Posts" }}
      />
      <Drawer.Screen name="MDHashtags" component={MDHashtags} />
      <Drawer.Screen name="AcademicCalendar" component={AcademicCalendar} />
      <Drawer.Screen name="map" component={CampusMap} options={{ title: "Campus Map" }} />
      <Drawer.Screen name="clubs" component={Clubs} options={{ title: "Clubs & NGOs" }} />
      <Drawer.Screen name="MDLostnFound" component={MDLostnFound} />
      <Drawer.Screen name="Placementor" component={Placementor} />
      <Drawer.Screen name="UserScreen" component={UserScreen} options={{ title: "Saved Posts" }} />
      <Drawer.Screen name="ContactUs" component={ContactUs} />
      <Drawer.Screen name="AboutUs" component={AboutUs} />
      <Drawer.Screen name="Details" component={Details} />
    </Drawer.Navigator>
  );
}

// Auth stack for signed-out users
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

        <ClerkLoading>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
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
