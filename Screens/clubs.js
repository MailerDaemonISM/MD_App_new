// Clubs.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
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

  const renderClub = ({ item }) => (
    <TouchableOpacity
      style={styles.clubItem}
      onPress={() => setSelectedClub(item)}
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Clubs of IIT(ISM)</Text> */}

      <FlatList
        data={clubs}
        keyExtractor={(item) => item._id}
        renderItem={renderClub}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal */}
      <Modal
        visible={!!selectedClub}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedClub(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              {selectedClub?.logoUrl && (
                <Image
                  source={{ uri: selectedClub.logoUrl }}
                  style={styles.modalLogo}
                />
              )}
              <Text style={styles.modalTitle}>{selectedClub?.name}</Text>
              <TouchableOpacity
                onPress={() => setSelectedClub(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color="black" />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <Text style={styles.infoText}>
              <Text style={styles.bold}>SAC Room No: </Text>
              {selectedClub?.sacRoomNo}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Established: </Text>
              {selectedClub?.establishmentYear}
            </Text>

            {/* Body */}
            <ScrollView style={{ marginTop: 10, maxHeight: 200 }}>
              <PortableText value={selectedClub?.body} />
            </ScrollView>

            {/* Social Media Links */}
            <View style={styles.socialRow}>
              {selectedClub?.facebook && (
                <TouchableOpacity onPress={() => openLink(selectedClub.facebook)}>
                  <FontAwesome name="facebook-square" size={30} color="#1877F2" />
                </TouchableOpacity>
              )}
              {selectedClub?.instagram && (
                <TouchableOpacity onPress={() => openLink(selectedClub.instagram)}>
                  <FontAwesome name="instagram" size={30} color="#E4405F" />
                </TouchableOpacity>
              )}
              {selectedClub?.website && (
                <TouchableOpacity onPress={() => openLink(selectedClub.website)}>
                  <FontAwesome name="globe" size={30} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Clubs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    //paddingTop: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  clubItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
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
  closeButton: {
    padding: 5,
  },
  infoText: {
    marginTop: 10,
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
