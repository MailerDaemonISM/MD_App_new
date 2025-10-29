// Clubs.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { client} from "../sanity";
import { PortableText } from "@portabletext/react-native";

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      const data = await client.fetch(
        `*[_type == "clubs"]{
          _id,
          name,
          slug,
          sacRoomNo,
          establishmentYear,
          "logoUrl": logo.asset->url,
          body,
          facebook,
          instagram,
          website
        }`
      );
      setClubs(data);
    };
    fetchClubs();
  }, []);

  const openLink = (url) => {
    if (url) Linking.openURL(url);
  };

  const renderClub = ({ item }) => {
    const isExpanded = selectedClub?._id === item._id;

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={styles.clubItem}
          onPress={() => setSelectedClub(isExpanded ? null : item)}
        >
          {item.logoUrl ? (
            <Image
              source={{ uri: item.logoUrl }}
              style={styles.clubLogo}
            />
          ) : (
            <View style={[styles.clubLogo, { backgroundColor: "#ccc" }]} />
          )}
          <Text style={styles.clubName}>{item.name}</Text>
          <FontAwesome
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#666"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* Accordion Content */}
        {isExpanded && (
          <View style={styles.accordionContent}>
            <ScrollView nestedScrollEnabled>
              {/* Header */}
              <View style={styles.modalHeader}>
                {/* {item?.logoUrl && (
                  <Image
                    source={{ uri: item.logoUrl }}
                    style={styles.modalLogo}
                  />
                )} */}
                {/* <Text style={styles.modalTitle}>{item?.name}</Text> */}
              </View>

              {/* Info */}
              {item?.sacRoomNo ? (
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>Venue: </Text>
                  {item.sacRoomNo}
                </Text>
              ) : null}

              {item?.establishmentYear ? (
                <Text style={styles.infoText}>
                  <Text style={styles.bold}>Established: </Text>
                  {item.establishmentYear}
                </Text>
              ) : null}

              {/* Body */}
              <View style={{ marginTop: 10 }}>
                <PortableText value={item?.body} />
              </View>

              {/* Social Media Links */}
              <View style={styles.socialRow}>
                {item?.facebook && (
                  <TouchableOpacity onPress={() => openLink(item.facebook)}>
                    <FontAwesome name="facebook-square" size={30} color="#1877F2" />
                  </TouchableOpacity>
                )}
                {item?.instagram && (
                  <TouchableOpacity onPress={() => openLink(item.instagram)}>
                    <FontAwesome name="instagram" size={30} color="#E4405F" />
                  </TouchableOpacity>
                )}
                {item?.website && (
                  <TouchableOpacity onPress={() => openLink(item.website)}>
                    <FontAwesome name="globe" size={30} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Clubs of IIT(ISM)</Text> */}

      <FlatList
        data={clubs}
        keyExtractor={(item) => item._id}
        renderItem={renderClub}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default Clubs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  accordionContainer: {
    marginVertical: 6,
    //paddingVertical:8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  clubItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 0,
  },
  clubLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  clubName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  accordionContent: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  infoText: {
    //marginTop:4,
    fontSize: 14,
  },
  bold: {
    fontWeight: "bold",
  },
  socialRow: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-around",
  },
});
