import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import { setLostFoundData } from "../api/lost_found";

const data = [
  { label: "Lost", value: "lost" },
  { label: "Found", value: "found" },
];

const MDLostnFound = () => {
  const [lostorfound, setSelectedValue] = useState("");
  const [name, setname] = useState("");
  const [description, setDesc] = useState("");
  const [location, setlocation] = useState("");
  const [contact, setcontact] = useState("");
  const [title, setTitle] = useState("");
  const [uri, seturi] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload images!"
        );
      }
    }
  };

  const pickImageAsync = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        seturi(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (isUploading) return;

    // Validations
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

    setIsUploading(true);

    const res = {
      type: lostorfound,
      body: description,
      name,
      location,
      contact,
      uri,
      approved: false,
      title,
    };

    try {
      await setLostFoundData(res, () => {
        setSelectedValue("");
        setname("");
        setDesc("");
        setlocation("");
        setcontact("");
        setTitle("Lost Object");
        seturi("");
      });
      Alert.alert("Success", "Your post has been submitted successfully and will be reviewed by a member of our team!");
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.headerText}>📌 Lost & Found</Text>
        <Text style={styles.subText}>Fill out the details below</Text>

        <TextInput
          placeholder="Your Name"
          style={styles.input}
          onChangeText={setname}
          value={name}
        />

        <TextInput
          placeholder="Title (e.g. Lost Wallet)"
          style={styles.input}
          onChangeText={setTitle}
          value={title}
        />

        <TextInput
          placeholder="Short Description"
          style={[styles.input, styles.descriptionInput]}
          value={description}
          multiline
          numberOfLines={3}
          onChangeText={(e) => {
            const wordcounter = e.trim().split(/\s+/).length;
            if (wordcounter <= 30) {
              setDesc(e);
            } else {
              Alert.alert("Too Long", "Please keep description brief.");
            }
          }}
        />

        <Dropdown
          style={styles.dropdown}
          data={data}
          labelField="label"
          valueField="value"
          placeholder="Lost / Found"
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.placeholderStyle}
          value={lostorfound}
          onChange={(item) => setSelectedValue(item.value)}
        />

        <TextInput
          placeholder="Location (e.g. Library, Hostel)"
          style={styles.input}
          onChangeText={setlocation}
          value={location}
        />

        <TextInput
          placeholder="Contact Number"
          style={styles.input}
          keyboardType="numeric"
          onChangeText={setcontact}
          value={contact}
        />

        {uri ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <TouchableOpacity
            onPress={pickImageAsync}
            style={styles.uploadBox}
            disabled={isUploading}
          >
            <Text style={styles.uploadBoxText}>📷 Upload an Image</Text>
          </TouchableOpacity>
        )}

        {uri ? (
          <TouchableOpacity
            onPress={pickImageAsync}
            style={styles.changeImageButton}
          >
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, isUploading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isUploading}
        >
          <Text style={styles.submitButtonText}>
            {isUploading ? "Submitting..." : "Submit Post"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MDLostnFound;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    color: "#1e293b",
  },
  subText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    fontSize: 15,
    backgroundColor: "#f8fafc",
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  dropdown: {
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
  },
  placeholderStyle: {
    color: "#64748b",
    fontSize: 15,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#94a3b8",
    borderRadius: 12,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    backgroundColor: "#f1f5f9",
  },
  uploadBoxText: {
    color: "#475569",
    fontSize: 16,
  },
  image: {
    height: 200,
    borderRadius: 12,
    marginVertical: 12,
  },
  changeImageButton: {
    alignSelf: "center",
    marginBottom: 16,
  },
  changeImageText: {
    color: "#3b82f6",
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
});
