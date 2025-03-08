import React from 'react';
import { TouchableOpacity, Image, Text, View, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';

import HomeScreen from "./Screens/HomeScreen";
import MDHashtags from "./Screens/MDHashtags";
import AboutUs from './Screens/AboutUS';
import ContactUs from './Screens/ContactUs';
import MDLostnFound from './Screens/MDLost&Found';
import MDPosts from './Screens/MDPosts';
import Placementor from './Screens/Placementor';
import Details from './Screens/Details';

const Drawer = createDrawerNavigator();

const open_instititute_web = () => {
  Linking.openURL('https://www.iitism.ac.in/');
};
const open_parent_portal = () => {
  Linking.openURL('https://parent.iitism.ac.in/index.php/parent_portal/portal0');
};

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, borderBottomWidth: 2, borderColor: 'gray', marginVertical: 10, height: 80 }}>
        <Image
          source={require('./assets/md.png')}
          style={{ height: 44, width: 44, borderRadius: 22, marginLeft: 10 }}
        />
        <Text style={{ fontWeight: 'bold', marginLeft: 10, fontSize: 24 }}>Mailer Daemon</Text>
      </View>
      <View style={{ marginTop: 20, borderBottomWidth: 2, borderColor: 'gray', marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
            source={require('./assets/home.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('HomeScreen')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Home</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
            source={require('./assets/hashtags.png')}
            style={{ height: 24, width: 24, borderRadius: 12, marginLeft: 20, opacity: 0.5 }}
          />
          <TouchableOpacity onPress={() => props.navigation.navigate('MDHashtags')}>
            <Text style={{ fontSize: 16, marginLeft: 20, color: 'gray' }}>Hashtags</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
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
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 28, marginBottom: 10 }}>
          <Image
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
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="HomeScreen" drawerContent={CustomDrawerContent}>
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
