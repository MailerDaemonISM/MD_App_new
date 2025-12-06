import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function SignOutButton() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Signed out successfully");
      // optionally navigate to SignIn screen
      // navigation.replace("SignIn");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.buttonText}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#f44336",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
