import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const showClerkError = (err, title = "Error") => {
  console.error("❌ Clerk Error:", err);
  if (err?.errors && Array.isArray(err.errors)) {
    err.errors.forEach((e) => Alert.alert(title, e?.message || "Something went wrong"));
  } else if (err?.message) {
    Alert.alert(title, err.message);
  } else {
    Alert.alert(title, "An unexpected error occurred");
  }
};

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Email + Password Sign In
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.log("⚠️ Additional steps required:", signInAttempt);
      }
    } catch (err) {
      showClerkError(err, "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Sign In
  const onGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { createdSessionId, setActive: setOAuthActive, signIn, signUp } =
        await startOAuthFlow();

      if (createdSessionId) {
        await setOAuthActive({ session: createdSessionId });
        router.replace("/");
      } else {
        console.log("⚠️ OAuth requires more steps:", signIn, signUp);
      }
    } catch (err) {
      showClerkError(err, "Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color="#4f46e5" />
        ) : (
          <>
            <Text style={styles.title}>Welcome to Mailer Daemon App</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="#aaa"
              onChangeText={setEmailAddress}
            />

            <TextInput
              style={styles.input}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#aaa"
              secureTextEntry={true}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={onSignInPress}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignIn}>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={{ color: "#666" }}>Login Using Institute Credentials </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
  card: { width: "100%", maxWidth: 380, backgroundColor: "#fff", padding: 24, borderRadius: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 8, color: "#222" },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 20, color: "#666" },
  input: { width: "100%", padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, marginBottom: 14, fontSize: 16, color: "#333", backgroundColor: "#fafafa" },
  button: { backgroundColor: "#4f46e5", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: "#ddd" },
  dividerText: { marginHorizontal: 10, color: "#666" },
  googleButton: { backgroundColor: "#DB4437", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  googleButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
});
