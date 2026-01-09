import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  TextInput,
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import Icon from "react-native-vector-icons/Ionicons";
import { emergencyContacts,importantMails,timings } from "./data.contacts";


const ImportantContacts = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "contacts", title: "Emergency Contacts" },
    { key: "mails", title: "Important Mails" },
    { key: "timings", title: "Important Timings" },
  ]);
  const [searchText, setSearchText] = useState("");

  // Filtering logic
  const filteredContacts = emergencyContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.designation.toLowerCase().includes(searchText.toLowerCase()) ||
      c.contact.includes(searchText)
  );

  const filteredMails = importantMails.filter(
    (m) =>
      m.mail.toLowerCase().includes(searchText.toLowerCase()) ||
      m.desc.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredTimings = timings.filter(
    (t) =>
      t.event.toLowerCase().includes(searchText.toLowerCase()) ||
      t.time.toLowerCase().includes(searchText.toLowerCase())
  );

  //contacts
const ContactsRoute = () => (
  <FlatList
    data={filteredContacts}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>{item.designation}</Text>
          <Text style={styles.details}>{item.contact}</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.contact}`)}>
          <Icon name="call" size={22} color="#333" />
        </TouchableOpacity>
      </View>
    )}
    ListEmptyComponent={
      <Text style={styles.notFoundText}>No contacts found</Text>
    }
  />
);

//mails
const MailsRoute = () => (
  <FlatList
    data={filteredMails}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.mail}</Text>
          <Text style={styles.details}>{item.desc}</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${item.mail}`)}>
          <Icon name="mail" size={22} color="#333" />
        </TouchableOpacity>
      </View>
    )}
    ListEmptyComponent={
      <Text style={styles.notFoundText}>No mails found</Text>
    }
  />
);

//timings
const TimingsRoute = () => (
  <FlatList
    data={filteredTimings}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.event}</Text>
          <Text style={styles.details}>{item.time}</Text>
        </View>
      </View>
    )}
    ListEmptyComponent={
      <Text style={styles.notFoundText}>No timings found</Text>
    }
  />
);

//scene map render
  const renderScene = SceneMap({
    contacts: ContactsRoute,
    mails: MailsRoute,
    timings: TimingsRoute,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.headerContainer}>
        {/* <Text style={styles.appTitle}>Important Info</Text> */}

        <Icon name="search" size={24} color="#fff" /> 
      </View>
      {/* search bar */}
      <View style={styles.searchBox}>
        <Icon name="search" size={18} color="#666" style={{ marginRight: 6 }} />
        <TextInput
          style={styles.input}
          placeholder={
            index === 0 ? "Search Contacts..." : index === 1 ? "Search Mails..." : "Search Timings..."
          }
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* three Tabs */}
      <View style={styles.topTabs}>
        {routes.map((route, i) => (
          <TouchableOpacity key={route.key} onPress={() => setIndex(i)} style={styles.tabButton}>
            <Text style={[styles.tabText, index === i && styles.tabTextActive]}>
              {route.title}
            </Text>
            {index === i && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/*content on diff tabs*/}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={() => null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // headerContainer: {
  //   //marginTop: 12,
  //   //marginBottom: 8,
  //   //paddingHorizontal: 16,
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  // },
  // appTitle: {
  //   fontSize: 22,
  //   fontWeight: "bold",
  //   color: "#333",
  // },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 16,
    //marginVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  topTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 6,
  },
  tabButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "orange",
    fontWeight: "bold",
  },
  tabUnderline: {
    marginTop: 2,
    height: 2,
    width: "100%",
    backgroundColor: "orange",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  notFoundText: {
  textAlign: "center",
  marginTop: 20,
  fontSize: 14,
  color: "#888",
  fontStyle: "italic",
 },
  role: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#555",
  },
});

export default ImportantContacts;
