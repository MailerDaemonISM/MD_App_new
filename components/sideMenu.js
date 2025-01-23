import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, Image, View, Linking } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

const openInstituteWeb = () => {
  Linking.openURL('https://www.iitism.ac.in/');
};
const openParentPortal = () => {
  Linking.openURL('https://parent.iitism.ac.in/index.php/parent_portal/portal0');
};

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      {/* Header */}
      <View className="flex-row items-center mt-5 border-b-2 border-gray-300 py-4">
        <Image
          source={require('../assets/md.png')}
          className="h-12 w-12 rounded-full ml-4"
        />
        <Text className="font-bold text-lg ml-4">Mailer Daemon</Text>
      </View>

      {/* Navigation Options */}
      <View className="mt-5 border-b-2 border-gray-300 pb-4">
        <DrawerItem
          icon={require('../assets/home.png')}
          label="Home"
          onPress={() => props.navigation.navigate('HomeScreen')}
        />
        <DrawerItem
          icon={require('../assets/hashtags.png')}
          label="Hashtags"
          onPress={() => props.navigation.navigate('MDHashtags')}
        />
        <DrawerItem
          icon={require('../assets/lostandfound.png')}
          label="Lost and Found"
          onPress={() => props.navigation.navigate('MDLostnFound')}
        />
      </View>

      {/* External Links */}
      <View className="mt-5 border-b-2 border-gray-300 pb-4">
        <DrawerItem
          icon={require('../assets/institution.png')}
          label="Institute Website"
          onPress={openInstituteWeb}
        />
        <DrawerItem
          icon={require('../assets/ParentPortal.png')}
          label="Parent Portal"
          onPress={openParentPortal}
        />
      </View>

      {/* Additional Options */}
      <View className="mt-5">
        <DrawerItem
          icon={require('../assets/aboutUs.png')}
          label="About Us"
          onPress={() => props.navigation.navigate('AboutUs')}
        />
        <DrawerItem
          icon={require('../assets/contactUs.png')}
          label="Contact Us"
          onPress={() => props.navigation.navigate('ContactUs')}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerItem = ({ icon, label, onPress }) => {
  return (
    <View className="flex-row items-center my-2">
      <Image source={icon} className="h-6 w-6 ml-4 opacity-50" />
      <TouchableOpacity onPress={onPress}>
        <Text className="ml-6 text-base text-gray-500">{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDrawerContent;
