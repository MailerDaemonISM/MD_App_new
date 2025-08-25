// screens/HomeScreen.js
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Dropdown } from "react-native-element-dropdown";
import { FontAwesome } from "@expo/vector-icons";
import { setLostFoundData } from '../api/lost_found';
import { Alert } from "react-native"; 


const data = [
  { label: "Lost", value: "lost" },
  { label: "Found", value: "found" },
  // add more options here
];



const MDLostnFound = ({ navigation }) => {

  const [lostorfound, setSelectedValue] = useState("");
  const [name, setname] = useState("");
  const [description, setDesc] = useState("");
  const [location, setlocation] = useState("");
  const [contact, setcontact] = useState("");
  const [title, setTitle] = useState("Lost Object");
  const [uri, seturi] = useState("");
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri);
      seturi(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };
  const Navigation = useNavigation();




  return (
    <View className="mt-8 flex flex-row w-full mr-0 ml-0 ">
      <View className="h-1/1 w-3/4 flex flex-col align-center bg-white ml-5  border-white rounded-l-3xl  ">
        <Text className="text-2xl text-black text-center mt-2">Enter Details</Text>
        <TextInput
          placeholder="Enter Your Name"
          className="mb-4 h-10 w-2/3 bg-white text-center ml-12 mt-5 border border-gray-400 bg-white-100 rounded-lg "
          onChangeText={(e) => setname(e)}
        />

        <TextInput
          placeholder="Title For Your Post"
          className="mb-4 h-10 w-2/3 bg-white text-center ml-12 mt-5 border border-gray-400 bg-white-100 rounded-lg "
          onChangeText={(e) => setTitle(e)}
        />

        <TextInput
          onChangeText={(e) => {
            const wordcounter = e.split(" ").length;
            if (wordcounter <= 30) {
              setDesc(e);
            } else {
              Alert.alert("Desc. Too Long", "Please Explain Briefly");
            }
          }}
          placeholder="Description"
          className="mb-0 h-10 w-2/3 bg-white text-center ml-12 mt-2 border border-gray-400 bg-white-100 rounded-lg"
        />

        <View
          className="w-4/5 h-auto ml-8 mt-4  "
        >

          <Dropdown
            className="w-4/5 border border-gray-400  rounded-xl mt-4 mb-5 ml-5 mr-3 h-auto text-center"
            data={data}
            labelField="label"
            valueField="value"
            placeholder="Lost / Found"
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.placeholderStyle}
            value={lostorfound}
            onChange={(item) => setSelectedValue(item.value)}
          />
        </View>

        <TextInput
          className="mb-4 h-10 w-2/3 bg-white text-center ml-12 mt-2 border border-gray-400 bg-white-100 rounded-lg"
          placeholder="Location"
          onChangeText={(e) => setlocation(e)}
        />

        <TextInput
          className="mb-4 h-10 w-2/3 bg-white text-center ml-12 mt-2 border border-gray-400 bg-white-100 rounded-lg"
          keyboardType="numeric"
          placeholder="Contact Number"
          onChangeText={(e) => setcontact(e)}
        />

        {uri && <Image source={{ uri: uri }} style={styles.image} className="mt-5" />}



        <TouchableOpacity onPress={pickImageAsync} className="w-3/4 mb-6 ml-9 mt-6 border border-gray-400 border-1 rounded-xl bg-gray-400 h-10 flex justify-center  ">
          <Text
            className="text-lg text-white align-cetner text-bold text-center font-bold"
          >
            Upload An Image
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-red-200 border rounded-r-lg border-red-200 mr-0 flex justify-center">
        <View>
          <FontAwesome
            name="send"
            size={24}
            color="black"
            style={{ padding: 15 }}
            onPress={() => {
              // --- validation ---
              if (!name.trim()) {
                Alert.alert("Validation Error", "Name is required");
                return;
              }
              if (!title.trim()) {
                Alert.alert("Validation Error", "Title is required");
                return;
              }
              if (!lostorfound) {
                Alert.alert("Validation Error", "Please select Lost / Found");
                return;
              }
              if (!contact.match(/^\d{10}$/)) {
                Alert.alert("Validation Error", "Enter a valid 10-digit phone number");
                return;
              }

              // --- if all good, prepare data ---
              var res = {
                type: lostorfound,
                body: description,
                name,
                location,
                contact,
                uri,
                approved: false,
                title,
              };

              console.log("Submitting:", res);

              setLostFoundData(res, () => {
                // Reset form fields on success
                setSelectedValue("");
                setname("");
                setDesc("");
                setlocation("");
                setcontact("");
                setTitle("Lost Object");
                seturi("");
              });
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default MDLostnFound;


const styles = StyleSheet.create({
  image: {
    height: 200,
    width: 250,
    borderRadius: 25,
    alignSelf: "center",
  },
  sendButtonContainer: {
    backgroundColor: "#FFC5C5",
    width: "15%",
    height: "100%",
    marginRight: "0%",
    marginVertical: "0.5%",
    borderRadius: 25,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    display: "flex",
    justifyContent: "flex-end",
  },
  placeholderStyle: {
    color: "grey",
    textAlign: "center",
  },
});