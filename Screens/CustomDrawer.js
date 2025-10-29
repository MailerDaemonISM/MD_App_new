import { useAuth } from "@clerk/clerk-expo";
import { Text, Image, View, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useUser } from "@clerk/clerk-expo";

const CustomDrawerContent = (props) => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut();
      // Clerk auto-navigates to SignedOut → AuthStack
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const open_institute_web = () => {
    Linking.openURL("https://www.iitism.ac.in/");
  };
  const open_ark_portal = () => {
    Linking.openURL("https://ark.iitism.ac.in/");
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Image source={require("../assets/md.jpg")} style={styles.headerImage} />
            <Text style={styles.headerTitle}>Mailer Daemon</Text>
          </View>

          {/* Navigation Items */}
          <View style={styles.navSection}>
            <NavItem
              source={require("../assets/home.png")}
              label="Home"
              onPress={() => props.navigation.navigate("HomeScreen")}
            />
            <NavItem
              source={require("../assets/hashtags.png")}
              label="Hashtags"
              onPress={() => props.navigation.navigate("MDHashtags")}
            />
            <NavItem
              source={require("../assets/Calender.png")}
              label="Academic Calendar"
              onPress={() => props.navigation.navigate("AcademicCalendar")}
            />
            <NavItem
              source={require("../assets/Map.jpg")}
              label="Campus Map"
              onPress={() => props.navigation.navigate("map")}

            />
            <NavItem
              source={require("../assets/clubs.png")}
              label="Clubs & NGOs"
              onPress={() => props.navigation.navigate("clubs")}
        
            />
            <NavItem
              source={require("../assets/lostandfound.png")}
              label="Lost and Found"
              onPress={() => props.navigation.navigate("MDLostnFound")}
            />
            <NavItem
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png" }}
              label="Placementor"
              onPress={() => props.navigation.navigate("Placementor")}
            />
            <NavItem
              source={require("../assets/save-instagram.png")}
              label="Saved Posts"
              onPress={() => props.navigation.navigate("UserScreen")}
            />
          </View>

          {/* Institute Links */}
          <View style={styles.navSection}>
            <NavItem
              source={require("../assets/institution.png")}
              label="Institute Website"
              onPress={open_institute_web}
            />
            <NavItem
              source={require("../assets/ParentPortal.png")}
              label="ARK Portal"
              onPress={open_ark_portal}
            />
          </View>

          {/* About and Contact */}
          <View style={styles.navSectionWithoutBorder}>
            <NavItem
              source={require("../assets/aboutUs.png")}
              label="About Us"
              onPress={() => props.navigation.navigate("AboutUs")}
            />
            <NavItem
              source={require("../assets/contactUs.png")}
              label="Important Contacts"
              onPress={() => props.navigation.navigate("ContactUs")}
            />
          </View>
        </View>
      </DrawerContentScrollView>

      {/* User Section - Fixed at Bottom */}
      <View style={styles.bottomUserSection}>
        <Image
          source={user?.imageUrl ? { uri: user.imageUrl } : null}
          style={styles.userImage}
        />
        <Text style={styles.userName}>
          {user?.fullName || user?.username || "Anonymous"}
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>LogOut</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// NavItem subcomponent for reuse
const NavItem = ({ source, label, onPress }) => (
  <View style={styles.navItemContainer}>
    <Image source={source} style={styles.navIcon} />
    <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  </View>
);

export default CustomDrawerContent;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db", // gray-300
    height: 80,
    paddingHorizontal: 12,
  },
  headerImage: {
  height: 50,
  width: 50,
  borderRadius:10,  
  resizeMode: "contain", 
  opacity: 0.9,
},

  headerTitle: {
    fontWeight: "bold",
    fontSize: 26,
    marginLeft: 12,
    color: "#000",
  },
  navSection: {
    marginTop: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
    marginHorizontal: 8,
    paddingBottom: 12,
  },navSectionWithoutBorder: {
    marginTop: 20,
    marginHorizontal: 8,
    paddingBottom: 12,
  },
  navItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    marginBottom: 12,
    paddingLeft: 20,
    paddingBottom: 3,
  },
  navIcon: {
  height: 25,
  width: 25,
  marginRight: 4,
  resizeMode: "contain", 
  opacity: 0.8, // make it a bit clearer
},

  navLabel: {
    fontSize: 16,
    marginLeft: 16,
    color: "#6b7280", // text-gray-400
  },
  bottomUserSection: {
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
  logoutButton: {
    backgroundColor: "#db4437",
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
