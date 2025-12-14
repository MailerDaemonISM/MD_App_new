// screens/SignInScreen.js
import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  LogBox,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

import { useOAuth, useSignIn } from "@clerk/clerk-expo";

const { height, width } = Dimensions.get("window");

// Suppress Clerk hydration warnings
LogBox.ignoreAllLogs();

const COLORS = {
  LIGHT_PINK: "#FFC5C5",
  LIGHT_BLUE: "#98DDFF",
  ORANGE_CTA: "#EEA052",
  TEXT_PRIMARY: "#3A3A3A",
  TEXT_SECONDARY: "#6E6E6E",
  WHITE: "#FFFFFF",
  DARK_ACCENT: "#1C1C2A",
  BACKGROUND: "#FFFFFF",
};

export default function () {
  const { isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [loading, setLoading] = useState(false);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const glowY1 = useSharedValue(0);
  const glowX2 = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });

    glowY1.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 4000 }),
        withTiming(10, { duration: 4000 })
      ),
      -1,
      true
    );

    glowX2.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 4200 }),
        withTiming(-15, { duration: 4200 })
      ),
      -1,
      true
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glow1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: glowY1.value }],
  }));

  const glow2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: glowX2.value }],
  }));

  const onGoogleSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/home");
      }
    }catch (err) {
  console.log("Authentication deferred → Clerk still hydrating:", err?.message);
} finally {
  setLoading(false);
}

  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[styles.glowShape, styles.glowShape1, glow1Style]}
        />
        <Animated.View
          style={[styles.glowShape, styles.glowShape2, glow2Style]}
        />

        <View style={styles.content}>
          <Animated.View style={[styles.logoCard, logoStyle]}>
            <Image
              source={require("../assets/md_logo.png")}
              style={styles.logo}
            />
          </Animated.View>

          <Text style={styles.heading}>Welcome to</Text>
          <Text style={styles.appName}>Mailer Daemon</Text>
          <Text style={styles.tagline}>It’s news, till it’s new!</Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={onGoogleSignInPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.WHITE} />
            ) : (
              
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.instituteNote}>
            Use your official institute email only
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 40,
  },
  content: {
    alignItems: "center",
    width: "85%",
    zIndex: 10,
  },

  logoCard: {
    padding: 28,
    borderRadius: 35,
    backgroundColor: COLORS.WHITE,
    marginBottom: 20,
    shadowColor: COLORS.DARK_ACCENT,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },

  heading: {
    fontSize: 22,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "600",
    marginBottom: 4,
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 50,
  },

  googleButton: {
    backgroundColor: COLORS.ORANGE_CTA,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    width: "100%",
    elevation: 10,
  },
  googleButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: "700",
  },
  instituteNote: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.8,
    color: COLORS.TEXT_SECONDARY,
  },

  glowShape: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.4,
  },
  glowShape1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: COLORS.LIGHT_PINK,
    top: -height * 0.1,
    left: -width * 0.4,
  },
  glowShape2: {
    width: width,
    height: width,
    backgroundColor: COLORS.LIGHT_BLUE,
    bottom: -height * 0.2,
    right: -width * 0.5,
  },
});
