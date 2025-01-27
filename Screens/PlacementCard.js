import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking, Image } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const PlacementCard = ({ 
  image, 
  title, 
  companyName, 
  role, 
  year,  
  students = [], 
  facebookLink 
}) => {
  const [bookmarked, setBookmarked] = useState(false);

  // Handle Share button
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title || "Placement Details"}\nCompany: ${companyName || "N/A"}\nRole: ${role || "N/A"}\nJoin us for more updates!`,
      });
    } catch (error) {
      console.error("Error sharing:", error.message);
    }
  };

  // Handle Bookmark toggle
  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  // Handle Facebook button click
  const openFacebook = () => {
    if (facebookLink) {
      Linking.openURL(facebookLink).catch((err) =>
        console.error("Failed to open Facebook link:", err)
      );
    } else {
      console.error("Facebook link not provided");
    }
  };

  return (
    <View style={styles.card}>
      {/* Left Content */}
      <Image source={image} style={styles.companyLogo} resizeMode="contain" />
      <View style={styles.content}>
        <Text style={styles.title}>{title || "Placement Details"}</Text>
        <Text style={styles.detail}>Company: {companyName || "N/A"}</Text>
        <Text style={styles.detail}>Role: {role || "N/A"}</Text>
        <Text style={styles.detail}>Year: {year || "N/A"}</Text>
        {students.length > 0 && (<>
    <Text style={styles.studentsHeading}>Students:</Text>
    {students.map((student, index) => (
      <Text key={index} style={styles.student}>
        {index + 1}. {student}
      </Text>
    ))}
  </>
)}
      </View>

      {/* Right Strip */}
      <View style={styles.rightStrip}>
        <TouchableOpacity onPress={handleShare} style={styles.icon}>
          <Feather name="share-2" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleBookmark} style={styles.icon}>
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={bookmarked ? "#000000" : "#000000"} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={openFacebook} style={styles.icon}>
          <Ionicons name="logo-facebook" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <Ionicons name="globe-outline" size={20} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    overflow: "hidden",
  },
  companyLogo: {
    flex: 1, 
    aspectRatio: 1,
    margin: 16,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 2,
    padding: 20,
    paddingRight:20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  type: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 10,
  },
  detail: {
    fontSize: 15,
    color: "#000000",
    marginBottom: 10,
  },
  studentsHeading: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 10,
  },
  student: {
    fontSize: 15,
    color: "#000000",
  },
  message: {
    fontSize: 15,
    color: "#000000",
    marginTop: 10,
  },
  rightStrip: {
    width: 40,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#98DDFF",
    padding: 8,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  icon: {
    marginVertical: 12,
  },
});

export default PlacementCard;
