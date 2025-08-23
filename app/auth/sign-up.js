import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
} from "react-native";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");

  // Email + password sign-up
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error("❌ SignUp Error:", err);
      Alert.alert("Error", err.errors?.[0]?.message || "Sign-up failed");
    }
  };

  // Verify email code
  const onVerifyPress = async () => {
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/"); // redirect to home
      } else {
        console.log("Verification not complete:", completeSignUp);
      }
    } catch (err) {
      console.error("❌ Verification error:", err);
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
    }
  };

  // Google OAuth sign-up
  const onGoogleSignUp = async () => {
    try {
      const { createdSessionId, setActive: setOAuthActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        await setOAuthActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      console.error("❌ Google OAuth Error:", err);
      Alert.alert("Error", "Google sign-up failed");
    }
  };

  return (
    <View style={styles.container}>
      {pendingVerification ? (
        <>
          <Text style={styles.title}>Verify your email</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter verification code"
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Create an account</Text>

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            onChangeText={setEmailAddress}
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter password"
            secureTextEntry
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <Text style={styles.orText}>──────── OR ────────</Text>

          {/* Google OAuth Sign Up */}
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={onGoogleSignUp}
          >
            <Text style={styles.buttonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/sign-in")}>
              <Text style={styles.link}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

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
  button: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  googleButton: { backgroundColor: "#db4437" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", marginTop: 15 },
  link: { color: "#4f46e5", fontWeight: "600" },
  orText: { marginVertical: 10, color: "#666", fontSize: 14 },
});
