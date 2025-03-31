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

import HomeScreen from "./Screens/HomeScreen";
import MDHashtags from "./Screens/MDHashtags";
import AboutUs from "./Screens/AboutUS";
import ContactUs from "./Screens/ContactUs";
import MDLostnFound from "./Screens/MDLost&Found";
import MDPosts from "./Screens/MDPosts";
import Placementor from "./Screens/Placementor";
import Details from "./Screens/Details";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const open_instititute_web = () => {
  Linking.openURL("https://www.iitism.ac.in/");
};
const open_parent_portal = () => {
  Linking.openURL(
    "https://parent.iitism.ac.in/index.php/parent_portal/portal0"
  );
};

const CustomDrawerContent = (props) => {
  //console.log(props);
  return (
    <DrawerContentScrollView {...props}>
      <View className="flex flex-row items-center  mt-5 border-b-2 border-gray-300 my-2 h-20">
        <Image
          source={require("./assets/md.png")} // Replace with your image URL
          className="h-11 w-11  border-radius-50 ml-4 "
        />
        <Text className="font-bold ml-2 text-2xl ">Mailer Daemon</Text>
      </View>

      <View className="mt-5 border-b-2 border-gray-300 my-2 h-100">
        <View className="flex flex-row items-center h-7 mb-2">
          <Image
            source={require("./assets/home.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("HomeScreen")}
          >
            <Text className="text-base ml-6 text-gray-400">Home</Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row items-center h-7 mb-2">
          <Image
            source={require("./assets/hashtags.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("MDHashtags")}
          >
            <Text className="text-base ml-6 text-gray-400">Hashtags</Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row items-center h-7 mb-5">
          <Image
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
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center h-7 mb-5">
          <Image
            source={require("./assets/contactUs.png")} // Replace with your image URL
            className="h-6 w-6  border-radius-50 ml-7 opacity-50"
          />
          <TouchableOpacity
            onPress={() => props.navigation.navigate("ContactUs")}
          >
            <Text className="text-base ml-6 text-gray-400">Contact Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={CustomDrawerContent}
      >
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