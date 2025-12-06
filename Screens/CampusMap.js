import React from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";
import { WebView } from "react-native-webview";

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
    />
    <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
    <style>
      #map { height: 100vh; width: 100vw; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = L.map('map').setView([22.315, 87.310], 16); // center on campus

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Example marker
      L.marker([22.315, 87.310]).addTo(map)
        .bindPopup('Main Gate')
        .openPopup();

      // Example polygon (campus boundary)
      var polygon = L.polygon([
        [22.314, 87.309],
        [22.316, 87.309],
        [22.316, 87.311],
        [22.314, 87.311]
      ], {
        color: 'orange',
        fillOpacity: 0.2
      }).addTo(map);
    </script>
  </body>
</html>
`;

export default function CampusMap() {

   if (Platform.OS === "web") {
    return (
      <iframe
        src="https://www.google.com/maps/d/u/4/embed?mid=1knM2y6BVRVVEo1E2BoQ7dpu8-6RrS5Q&ehbc=2E312F"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ uri: "https://www.google.com/maps/d/u/4/embed?mid=1knM2y6BVRVVEo1E2BoQ7dpu8-6RrS5Q&ehbc=2E312F" }}
        style={styles.map}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
