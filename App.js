// App.js
import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

import SignInScreen from "./app/auth/sign-in";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { tokenCache } from "./utils/cache";
import CustomDrawerContent from "./Screens/CustomDrawer";
import HomeScreen from "./Screens/HomeScreen";

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
      <Drawer.Screen name="map" component={CampusMap} />
      <Drawer.Screen name="clubs" component={Clubs} options={{ title: "Clubs Of IIT (ISM)" }} />
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
  useEffect(() => {
    registerForPushNotificationsAsync();

    const subRecv = Notifications.addNotificationReceivedListener(n => {
      console.log('Notification received on device:', n);
    });
    const subResp = Notifications.addNotificationResponseReceivedListener(r => {
      console.log('Notification response:', r);
    });

    return () => {
      subRecv.remove();
      subResp.remove();
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    if (!Constants.isDevice) {
      Alert.alert('Push notifications require a physical device.');
      return;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permission not granted for notifications');
      return;
    }
    const tokenObj = await Notifications.getExpoPushTokenAsync();
    const token = tokenObj.data;
    console.log('Expo Push Token:', token);
    // optional: send token to your backend register-token or just copy it and use send-test
    await fetch('http://<your-local-or-ngrok-host>:3000/api/register-token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expoPushToken: token, notificationsEnabled: true })
    });
  }

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
