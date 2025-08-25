import { useAuth } from "@clerk/clerk-expo"; // 👈 import at the top
import { Text, Image, View, TouchableOpacity, Linking } from "react-native";
import {
    DrawerContentScrollView,
} from "@react-navigation/drawer";
import { useUser } from "@clerk/clerk-expo";
import { StyleSheet } from "react-native";

// custom drawer
const CustomDrawerContent = (props) => {
    const { signOut } = useAuth();
    const { user } = useUser();

    const handleLogout = async () => {
        try {
            await signOut();
            // Clerk will automatically switch SignedOut → AuthStack (SignUp screen)
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const open_instititute_web = () => {
        Linking.openURL("https://www.iitism.ac.in/");
    };
    const open_ark_portal = () => {
        Linking.openURL(
            "https://ark.iitism.ac.in/"
        );
    };


    return (
        <DrawerContentScrollView {...props}>
            <View className="flex-1 justify-between">
                <View>
                    <View className="flex flex-row items-center mt-5 border-b-2 border-gray-300 my-2 h-20">
                        <Image
                            source={require("../assets/md.png")} // Replace with your image URL
                            className="h-11 w-11  border-radius-50 ml-4 "
                        />
                        <Text className="font-bold ml-2 text-2xl ">Mailer Daemon</Text>
                    </View>
                    {/* drawer items */}
                    <View className="mt-5 border-b-2 border-gray-300 my-2 h-100">
                        <View className="flex flex-row items-center h-7 mb-2">
                            <Image
                                source={require("../assets/home.png")} // Replace with your image URL
                                className="h-6 w-6  border-radius-50 ml-7 opacity-50"
                            />
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("HomeScreen")}
                            >
                                <Text className="text-base ml-6 text-gray-400">Home</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex flex-row items-center h-7 mb-2">
                            <Image
                                source={require("../assets/hashtags.png")} // Replace with your image URL
                                className="h-6 w-6  border-radius-50 ml-7 opacity-50"
                            />
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("MDHashtags")}
                            >
                                <Text className="text-base ml-6 text-gray-400">Hashtags</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex flex-row items-center h-7 mb-5">
                            <Image
                                source={require("../assets/lostandfound.png")} // Replace with your image URL
                                className="h-6 w-6  border-radius-50 ml-7 opacity-50"
                            />
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("MDLostnFound")}
                            >
                                <Text className="text-base ml-6 text-gray-400">Lost and Found</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex flex-row items-center h-7 mb-5">
                            {/* <Image
                    source={require('./assets/lostandfound.png')} // Replace with your image URL
                    className="h-6 w-6  border-radius-50 ml-7 opacity-50" 
                /> */}
                            <Image
                                source={{
                                    uri: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
                                }}
                                className="h-6 w-6 border-radius-50 ml-7 opacity-50"
                            />

                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("Placementor")}
                            >
                                <Text className="text-base ml-6 text-gray-400">Placementor</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mt-5 border-b-2 border-gray-300 my-2 h-100">
                        <View className="flex flex-row items-center h-7 mb-2">
                            <Image
                                source={require("../assets/institution.png")} // Replace with your image URL
                                className="h-6 w-6  border-radius-50 ml-7 opacity-50 "
                            />
                            <TouchableOpacity onPress={open_instititute_web}>
                                <Text className="text-base ml-6 text-gray-400">
                                    Institute Website
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex flex-row items-center h-7 mb-2">
                            <Image
                                source={require("../assets/ParentPortal.png")} // Replace with your image URL
                                className="h-6 w-6  border-radius-50 ml-7 opacity-50"
                            />
                            <TouchableOpacity onPress={open_ark_portal}>
                                <Text className="text-base ml-6 text-gray-400">ARK Portal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="mt-5  my-2 h-100">
                        <View className="flex flex-row items-center h-7 mb-2">
                            <Image
                                source={require("../assets/aboutUs.png")} // Replace with your image URL
                                className="h-6 w-6  border-radius-50 ml-7 opacity-50"
                            />
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("AboutUs")}
                            >
                                <Text className="text-base ml-6 text-gray-400">About Us</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex flex-row items-center h-7 mb-5">
                            <Image
                                source={require("../assets/contactUs.png")} // Replace with your image URL
                                className="h-6 w-6  border-radius-50 ml-7 opacity-50"
                            />
                            <TouchableOpacity
                                onPress={() => props.navigation.navigate("ContactUs")}
                            >
                                <Text className="text-base ml-6 text-gray-400">Important Contacts</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: "#ccc", paddingTop: 20, alignItems: "center" }}>
                    <Image
                        source={{ uri: user.imageUrl }}
                        style={{ width: 80, height: 80, borderRadius: 40 }}
                    />
                    <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "600" }}>
                        {user.fullName || user.username || "Anonymous"}
                    </Text>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleLogout}
                    >
                        <Text style>LogOut</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 20, color: "#222" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: "100%",
    backgroundColor: "#fff",
  },
  googleButton: { backgroundColor: "#db4437" , padding: "9px", borderRadius: "10px"},
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", marginTop: 15 },
  link: { color: "#4f46e5", fontWeight: "600" },
  orText: { marginVertical: 10, color: "#666", fontSize: 14 },
  button: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
});


