// screens/SignInScreen.js
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  LogBox,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

// Suppress Clerk's hydration/isReady warnings
LogBox.ignoreLogs([
  "Clerk",
  "isReady",
  "isLoaded",
  "No user found",
]);

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  // Show friendly error messages
  const showClerkError = (err, fallbackMsg = "Something went wrong") => {
    const msg =
      err?.errors?.[0]?.message ||
      err?.message ||
      fallbackMsg;
    Alert.alert("Error", msg);
  };

  // Email sign in
  const onSignInPress = async () => {
    if (!isLoaded) return; // prevent premature call
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/home");
      } else {
        console.log("Sign-in result:", JSON.stringify(result, null, 2));
      }
    } catch (err) {
      if (err?.message?.includes("isReady") || err?.message?.includes("isLoaded")) {
        console.warn("Clerk hydration warning suppressed:", err.message);
      } else {
        showClerkError(err, "Sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth sign in
  const onGoogleSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setOAuthActive?.({ session: createdSessionId });
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
      <Image
        source={require("../../assets/md.jpg")}
        style={styles.logo}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={onSignInPress} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignInPress} disabled={loading}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 40,
    resizeMode: "contain",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    marginVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  googleButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});
