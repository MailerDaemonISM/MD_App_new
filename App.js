<<<<<<< HEAD
import React from 'react';
import { TouchableOpacity, Image, Text, View, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
=======
// App.js
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, Image, View, Linking } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489

import HomeScreen from "./Screens/HomeScreen";
import MDHashtags from "./Screens/MDHashtags";
import AboutUs from "./Screens/AboutUS";
import ContactUs from "./Screens/ContactUs";
import MDLostnFound from "./Screens/MDLost&Found";
import MDPosts from "./Screens/MDPosts";
import Placementor from "./Screens/Placementor";
import Details from "./Screens/Details";

const Drawer = createDrawerNavigator();
<<<<<<< HEAD

const open_instititute_web = () => {
  Linking.openURL('https://www.iitism.ac.in/');
};
const open_parent_portal = () => {
  Linking.openURL('https://parent.iitism.ac.in/index.php/parent_portal/portal0');
=======
const Stack = createStackNavigator();

const open_instititute_web = () => {
  Linking.openURL("https://www.iitism.ac.in/");
};
const open_parent_portal = () => {
  Linking.openURL(
    "https://parent.iitism.ac.in/index.php/parent_portal/portal0"
  );
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489
};

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
<<<<<<< HEAD
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, borderBottomWidth: 2, borderColor: 'gray', marginVertical: 10, height: 80 }}>
        <Image
          source={require('./assets/md.png')}
          style={{ height: 44, width: 44, borderRadius: 22, marginLeft: 10 }}
=======
      <View className="flex flex-row items-center  mt-5 border-b-2 border-gray-300 my-2 h-20">
        <Image
          source={require("./assets/md.png")} // Replace with your image URL
          className="h-11 w-11  border-radius-50 ml-4 "
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489
        />
        <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 24 }}>Mailer Daemon</Text>
      </View>
      <View style={{ marginTop: 20, borderBottomWidth: 2, borderColor: 'gray', marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
<<<<<<< HEAD
            source={require('./assets/home.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('HomeScreen')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Home</Text>
=======
            source={require("./assets/home.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("HomeScreen")}
          >
            <Text className="text-base ml-6 text-gray-400">Home</Text>
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
<<<<<<< HEAD
            source={require('./assets/hashtags.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('MDHashtags')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Hashtags</Text>
=======
            source={require("./assets/hashtags.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("MDHashtags")}
          >
            <Text className="text-base ml-6 text-gray-400">Hashtags</Text>
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
<<<<<<< HEAD
            source={require('./assets/lostandfound.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('MDLostnFound')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Lost and Found</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
            source={require('./assets/lostandfound.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('Placementor')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Placementor</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginTop: 20, borderBottomWidth: 2, borderColor: 'gray', marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
            source={require('./assets/institution.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={open_instititute_web}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Institute Website</Text>
=======
            source={require("./assets/lostandfound.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("MDLostnFound")}
          >
            <Text className="text-base ml-6 text-gray-400">Lost and Found</Text>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center h-7 mb-5">
          {/* <Image
            source={require('./assets/lostandfound.png')} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50" 
          /> */}
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
            }}
            className="h-6 w-6 border-radius-50 ml-7 opacity-50"
          />

          <TouchableOpacity
            onPress={() => props.navigation.navigate("Placementor")}
          >
            <Text className="text-base ml-6 text-gray-400">Placementor</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-5 border-b-2 border-gray-300 my-2 h-100">
        <View className="flex flex-row items-center h-7 mb-2">
          <Image
            source={require("./assets/institution.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50 "
          />
          <TouchableOpacity onPress={open_instititute_web}>
            <Text className="text-base ml-6 text-gray-400">
              Institute Website
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row items-center h-7 mb-2">
          <Image
            source={require("./assets/ParentPortal.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity onPress={open_parent_portal}>
            <Text className="text-base ml-6 text-gray-400">Parent Portal</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-5  my-2 h-100">
        <View className="flex flex-row items-center h-7 mb-2">
          <Image
            source={require("./assets/aboutUs.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("AboutUs")}
          >
            <Text className="text-base ml-6 text-gray-400">About Us</Text>
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
<<<<<<< HEAD
            source={require('./assets/ParentPortal.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={open_parent_portal}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Parent Portal</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginTop: 20, marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
            source={require('./assets/aboutUs.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('AboutUs')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>About Us</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
            source={require('./assets/contactUs.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('ContactUs')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Contact Us</Text>
=======
            source={require("./assets/contactUs.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("ContactUs")}
          >
            <Text className="text-base ml-6 text-gray-400">Contact Us</Text>
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
<<<<<<< HEAD
      <Drawer.Navigator initialRouteName="HomeScreen" drawerContent={CustomDrawerContent}>
=======
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={CustomDrawerContent}
      >
>>>>>>> 6a3382d346a3d3dd5747b2dfd0aaf1c2238fe489
        <Drawer.Screen name="HomeScreen" component={HomeScreen} />
        <Drawer.Screen name="MDHashtags" component={MDHashtags} />
        <Drawer.Screen name="MDPosts" component={MDPosts} />
        <Drawer.Screen name="MDLostnFound" component={MDLostnFound} />
        <Drawer.Screen name="Placementor" component={Placementor} />
        <Drawer.Screen name="ContactUs" component={ContactUs} />
        <Drawer.Screen name="AboutUs" component={AboutUs} />
        <Drawer.Screen name="Details" component={Details} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;
