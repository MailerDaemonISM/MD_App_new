// App.js
import React from "react";
import { Text, Image, View, TouchableOpacity, Linking } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./Screens/HomeScreen";
import MDHashtags from "./Screens/MDHashtags";
import AboutUs from "./Screens/AboutUS";
import ContactUs from "./Screens/ContactUs";
import MDLostnFound from "./Screens/MDLost&Found";
import MDPosts from "./Screens/MDPosts";
import Placementor from "./Screens/Placementor";
import Details from "./Screens/Details";

import SignInScreen from "./app/auth/sign-in";
import SignUpScreen from "./app/auth/sign-up";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { tokenCache } from "./utils/cache";
import CustomDrawerContent from "./Screens/CustomDrawer";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();



// drawer navigator for signed-in users
function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={CustomDrawerContent}>
      <Drawer.Screen name="HomeScreen" component={HomeScreen} />
      <Drawer.Screen name="MDHashtags" component={MDHashtags} />
      <Drawer.Screen name="MDPosts" component={MDPosts} />
      <Drawer.Screen name="MDLostnFound" component={MDLostnFound} />
      <Drawer.Screen name="Placementor" component={Placementor} />
      <Drawer.Screen name="ContactUs" component={ContactUs} />
      <Drawer.Screen name="AboutUs" component={AboutUs} />
      <Drawer.Screen name="Details" component={Details} />
    </Drawer.Navigator>
  );
}

// auth stack for signed-out users
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignUp" component={SignUpScreen} />
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
        <SignedIn>
          <DrawerNavigator />
        </SignedIn>
        <SignedOut>
          {console.log("User is signed out")}
          <AuthStack />
        </SignedOut>
      </NavigationContainer>
    </ClerkProvider>
  );
}
