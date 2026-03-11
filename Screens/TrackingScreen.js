import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../api/locationTracking';

const TrackingScreen = () => {
  const { location, errorMsg } = useLocation();

  if (errorMsg) return <View style={styles.container}><Text>{errorMsg}</Text></View>;
  if (!location) return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <View style={styles.container}>
      {/* Map UI */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={location} title="You are here" />
      </MapView>

      {/* Info Overlay */}
      <View style={styles.infoBox}>
        <Text style={styles.title}>Live Tracker</Text>
        <Text>Lat: {location.latitude.toFixed(4)}</Text>
        <Text>Long: {location.longitude.toFixed(4)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loader: { flex: 1, justifyContent: 'center' },
  infoBox: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 }
});

export default TrackingScreen;