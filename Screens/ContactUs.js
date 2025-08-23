// screens/ContactUs.js
import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";

const ContactUs = () => {
  return (
    <ScrollView className="flex-1 bg-white px-5 py-8">
 
      <Text className="text-xl font-bold mb-4">Important Contacts</Text>

      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
        <Image
          source={{
            uri: "https://img.icons8.com/ios-filled/50/000000/search.png",
          }}
          className="w-5 h-5 opacity-50"
        />
        <TextInput
          placeholder="Search Contacts"
          placeholderTextColor="#9ca3af"
          className="ml-2 flex-1 text-gray-700"
        />
      </View>
     
      <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-2xl px-5 py-4 mb-4">
        <Image
          source={{
            uri: "https://img.icons8.com/ios/50/000000/department.png",
          }}
          className="w-7 h-7 mr-4"
        />
        <Text className="text-lg text-gray-700">Administration</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-2xl px-5 py-4 mb-4">
        <Image
          source={{
            uri: "https://img.icons8.com/ios/50/000000/training.png",
          }}
          className="w-7 h-7 mr-4"
        />
        <Text className="text-lg text-gray-700">Faculty</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-2xl px-5 py-4 mb-4">
        <Image
          source={{
            uri: "https://img.icons8.com/ios/50/000000/security-checked.png",
          }}
          className="w-7 h-7 mr-4"
        />
        <Text className="text-lg text-gray-700">Wardens</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center bg-gray-100 rounded-2xl px-5 py-4 mb-6">
        <Image
          source={{
            uri: "https://img.icons8.com/ios/50/000000/conference.png",
          }}
          className="w-7 h-7 mr-4"
        />
        <Text className="text-lg text-gray-700">Gymkhana</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ContactUs;
