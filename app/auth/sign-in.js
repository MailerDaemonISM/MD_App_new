// screens/SignInScreen.js
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  LogBox,
  Alert,
} from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

// Suppress Clerk's hydration warnings
LogBox.ignoreLogs(["Clerk", "isReady", "isLoaded", "No user found"]);

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [loading, setLoading] = useState(false);

  const showClerkError = (err, fallbackMsg = "Something went wrong") => {
    const msg =
      err?.errors?.[0]?.message ||
      err?.message ||
      fallbackMsg;
    Alert.alert("Error", msg);
  };

  // Google OAuth sign in
  const onGoogleSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/home");
      }
    } catch (err) {
      if (err?.message?.includes("isReady") || err?.message?.includes("isLoaded")) {
        console.warn("Clerk hydration warning suppressed:", err.message);
      } else {
        showClerkError(err, "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Big Logo */}
      <Image
        source={require("../../assets/md.jpg")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.appName}>Mailer Daemon App</Text>

      {/* Google Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={onGoogleSignInPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <><Text style={styles.googleButtonText}>Continue with Google</Text>
              //use your institute mail id 
              <Text style={styles.instituteNote}>Use your Institute Email ID</Text></>

        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 30,
    resizeMode: "contain",
  },
  title: {
    fontSize: 20,
    color: "#555",
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 40,
  },
  googleButton: {
    backgroundColor: "#DB4437",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  instituteNote: {
  fontSize: 12,
  color: '#ffffff', 
  textAlign: 'center',
  marginTop: 4,
},

});