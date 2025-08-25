// screens/Screen1.js (MDHashtags)
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { hashtags } from "./hashtags";

const MDHashtags = () => {
  const renderItem = ({ item, index }) => {
    const isLeft = index % 2 === 0;

    return (
      <View
        style={[
          styles.row,
          { flexDirection: isLeft ? "row" : "row-reverse" },
        ]}
      >
        {/* Timeline & Glow Dot */}
        <View style={styles.timelineWrapper}>
          <View
            style={[
              styles.glow,
              { backgroundColor: item.color, shadowColor: item.color },
            ]}
          />
          <View
            style={[
              styles.dot,
              { borderColor: item.color, shadowColor: item.color },
            ]}
          />
        </View>

        {/* Double Card Effect */}
        <TouchableOpacity activeOpacity={0.95} style={{ flex: 0.8 }}>
          {/* Back card (slight shadow aura) */}
          <View
            style={[
              styles.cardBehind,
              {
                borderColor: item.color,
                shadowColor: item.color,
              },
            ]}
          />
          {/* Front card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor:item.color,
                borderColor: item.color,
                shadowColor: item.color,
              },
            ]}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        </TouchableOpacity>

        <View style={{ width: "15%" }} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fdfdfd" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            MD's hashtags are magical spells, weaving your journey into a
            shimmering story. Follow this enchanted timeline and let each tag
            guide you through campus life.
          </Text>
        </View>

        {/* Timeline Section */}
        <View style={{ flex: 1, marginTop: 0 }}>
          {/* Vertical Line (starts right below intro card) */}
          <View style={styles.timelineLine} />

          {/* Zigzag Hashtags */}
          <FlatList
            data={hashtags}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 0 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Intro */
  introCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    marginHorizontal: 18,
    borderRadius: 22,
    padding: 20,
    marginVertical: 18,
    borderWidth: 1.8,
    borderColor: "#ddd",
    shadowColor: "#999",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  introText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#2b2b2b",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "600",
  },

  /* Timeline */
  timelineLine: {
    position: "absolute",
    left: "50%",
    top: -20,
    bottom: 0,
    width: 3,
    backgroundColor: "rgba(180,180,180,0.7)",
  },
  row: {
    marginVertical: 36,
    marginHorizontal: 14,
    alignItems: "flex-start",
  },
  timelineWrapper: {
    width: "15%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  // glow: {
  //   position: "absolute",
  //   width: 48,
  //   height: 48,
  //   borderRadius: 24,
  //   opacity: 0.2,
  //   shadowOpacity: 0.8,
  //   shadowRadius: 16,
  //   shadowOffset: { width: 0, height: 0 },
  // },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 6,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  /* Double Card Effect */
  cardBehind: {
    position: "absolute",
    top: 10,
    left: 10,
    right: -10,
    bottom: -10,
    borderRadius: 18,
    borderWidth: 5,
    //backgroundColor: "#fff",
    opacity: 0.9,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  card: {
    borderRadius: 18,
    //backgroundColor: "#fff",
    padding: 20,
    //borderWidth: 4,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  /* Text inside card */
  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  cardDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    fontWeight: "500",
  },
});

export default MDHashtags;
