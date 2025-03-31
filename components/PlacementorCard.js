import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const PlacementCard = ({ item, navigateToDetails }) => {
  const getImageUrl = (image) => {
    if (!image || !image.asset || !image.asset._ref) return null;

    const imageId = image.asset._ref.split("-")[1];
    const dimensions = image.asset._ref.split("-")[2];
    const format = image.asset._ref.split("-")[3];

    return `https://cdn.sanity.io/images/zltsypm6/production/${imageId}-${dimensions}.${format}`;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigateToDetails(item.company_name, item.year, item.url)
      }
    >
      <Image source={{ uri: getImageUrl(item.image) }} style={styles.companyLogo} />

      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.detail}>Role: {item.role}</Text>
        <Text>On Campus</Text>
        <Text>Year : {item.year}</Text>
      </View>

      <View style={styles.iconsContainer}>
        {/* Icons */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: "row", padding: 10 },
});

export default PlacementCard;
