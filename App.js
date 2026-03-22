// App.js
import React from "react";
import mobileAds from 'react-native-google-mobile-ads';
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import MDPosts from "./Screens/MDPosts";
import MDHashtags from "./Screens/MDHashtags";
import AboutUs from "./Screens/AboutUS";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
import ImportantContacts from "./Screens/ImportantContacts";
import MDLostnFound from "./Screens/MDLost&Found";
import Placementor from "./Screens/Placementor";
import Details from "./Screens/Details";
import AcademicCalendar from "./Screens/AcadCal";
import CampusMap from "./Screens/CampusMap";
import ATSScreen from "./Screens/ATS";
import UserScreen from "./Screens/UserScreen";
import Clubs from "./Screens/clubs";
import { useEffect } from "react";
import SubredditScreen from "./Screens/SubredditScreen";
import SignInScreen from "./Screens/sign-in";
import { OneSignal } from "react-native-onesignal";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { tokenCache } from "./utils/cache";
import CustomDrawerContent from "./Screens/CustomDrawer";
import HomeScreen from "./Screens/HomeScreen";
import MarketplaceNavigator from "./Screens/Marketplace/MarketplaceNavigator";
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-expo";
import { ActivityIndicator, View, StatusBar } from "react-native";
//import TrackingScreen from "./Screens/TrackingScreen";
import { supabase } from "./api/supabase";
import useAppUpdate from './utils/useAppUpdate';
import UpdateModal from './components/updateModal';

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
      <Drawer.Screen name="ImportantContacts" component={ImportantContacts} />
      <Drawer.Screen name="AboutUs" component={AboutUs} />
      <Drawer.Screen name="Details" component={Details} />
      {/* <Drawer.Screen name="Track Toto" component={TrackingScreen} /> */}
      <Drawer.Screen name="reddit" component={SubredditScreen} options={{ title: "Reddit" }}/>
      <Drawer.Screen name="ATS" component={ATSScreen} />
   {/* ✅ NEW — Marketplace (headerShown:false so the inner
           bottom tab navigator controls its own header)     */}
      <Drawer.Screen
        name="Marketplace"
        component={MarketplaceNavigator}
        options={{ title: "Marketplace", headerShown: false }}
      />
    </Drawer.Navigator>  );
}

// Auth stack for signed-out users
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}
const clerkFrontendApi = "auth.appmailerdaemon.online";

export default function App() {

  const { show, force, dismiss } = useAppUpdate();



//notif

  React.useEffect(() => {
   OneSignal.initialize("0ba6ad7c-e7c9-4ade-893c-2ce28b53cf70");

  OneSignal.Notifications.requestPermission(true);

  }, []);
console.log("init2");

  // Initialize Mobile Ads SDK
  React.useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob initialized successfully');
      })
      .catch(error => {
        console.log('AdMob initialization error:', error);
      });
  }, []);

  useEffect(() => {
    console.log("init");
    async function testConnection() {
      const { data, error } = await supabase.from('posts').select('*').limit(1);
      if (error) {
        console.log("Connection Error ❌:", error.message);
      } else {
        console.log("Connection Success ✅:", data);
      }
    }
    testConnection();
  }, []);
  
  return (
    <>
    <UpdateModal visible={show} force={force} onDismiss={dismiss} />
    <QueryClientProvider client={queryClient}>
      <ClerkProvider
        publishableKey="pk_live_Y2xlcmsuYXBwbWFpbGVyZGFlbW9uLm9ubGluZSQ"
        frontendApi={clerkFrontendApi}
        tokenCache={tokenCache}
      >
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor="#ffffff" />


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
    </QueryClientProvider>
    </>
  );
}
