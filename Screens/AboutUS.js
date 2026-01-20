import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  SafeAreaView,
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const COLORS = {
  ORANGE: "#EEA052",
  TEXT_PRIMARY: "#3A3A3A",
  TEXT_SECONDARY: "#555555",
  WHITE: "#FFFFFF",
};

const AboutUs = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require("../assets/md.jpg")} style={styles.logo} />
          <Text style={styles.title}>Mailer Daemon</Text>
        </View>

        <Text style={styles.subtitle}>It's News till it's New</Text>
        <Text style={styles.tagline}>
          The Student-Run Media Body of IIT (ISM) Dhanbad
        </Text>

        <Text style={styles.paragraph}>
          Founded in 2004,{" "}
          <Text style={styles.highlight}>Mailer Daemon</Text> is the heartbeat of
          student media at IIT (ISM) Dhanbad. We serve as a bridge between students
          and the administration, bringing you the latest news, insightful
          stories, and campus updates.
        </Text>

        <Text style={styles.paragraph}>
          Whether it's an academic breakthrough, a cultural fest, or an exciting
          sports event, our mission is to keep you informed and engaged. From
          interviews with distinguished alumni to exclusive event coverages, we
          ensure you never miss a beat.
        </Text>

        <Text style={styles.subtitle2}>Stay Informed, Stay Inspired</Text>

        <Text style={styles.paragraph}>
          Explore student achievements, get career insights, and stay up to date
          with everything happening on campus. Whether you're looking for
          academic guidance or want to dive into the vibrant extracurricular
          scene,{" "}
          <Text style={styles.highlight}>Mailer Daemon</Text> is your go-to source.
        </Text>

        <Text style={styles.paragraph}>
          Join us in celebrating the spirit of IIT (ISM) Dhanbad—stay connected,
          stay curious, and make every moment count.
        </Text>

        {/* Social Media Section */}
        <Text style={styles.followTitle}>Follow Us</Text>

        <View style={styles.socialRow}>
          <SocialIcon
            icon="instagram"
            color="#E1306C"
            onPress={() =>
              Linking.openURL(
                "https://www.instagram.com/md_iit_dhanbad"
              )
            }
          />
          <SocialIcon
            icon="facebook"
            color="#1877F2"
            onPress={() =>
              Linking.openURL(
                "https://www.facebook.com/share/1GCyYTFRDv/"
              )
            }
          />
          <SocialIcon
            icon="whatsapp"
            color="#25D366"
            onPress={() =>
              Linking.openURL(
                "https://whatsapp.com/channel/0029Vakz08oHltYImHZiIn3g"
              )
            }
          />
        </View>

        {/* Publisher Contact Section (CRITICAL FOR GOOGLE NEWS POLICY) */}
        <Text style={styles.contactTitle}>Contact the App Team</Text>

        <Text style={styles.contactText}>
          For queries, corrections, or concerns regarding content published in
          this app, please contact the Mailer Daemon app team:
        </Text>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL("mailto:dev.mailer.daemon@gmail.com")
          }
        >
          <Text style={styles.contactLink}>
            dev.mailer.daemon@gmail.com
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL("https://www.mailerdaemon.in")}
        >
          <Text style={styles.contactLink}>
            https://mailer-daemon.vercel.app
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SocialIcon = ({ icon, color, onPress }) => (
  <TouchableOpacity
    style={[styles.socialButton, { backgroundColor: color }]}
    onPress={onPress}
  >
    <FontAwesome5 name={icon} size={26} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    padding: 22,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 85,
    height: 85,
    borderRadius: 12,
    marginRight: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.ORANGE,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 17,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 15,
    textAlign: "justify",
  },
  highlight: {
    fontWeight: "700",
    color: COLORS.ORANGE,
  },
  subtitle2: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  followTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%",
    marginBottom: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.TEXT_PRIMARY,
    marginTop: 20,
    marginBottom: 6,
    textAlign: "center",
  },
  contactText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: 8,
  },
  contactLink: {
    fontSize: 16,
    color: COLORS.ORANGE,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
});

export default AboutUs;
