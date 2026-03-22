import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GAMBannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const NativeAdComponent = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Using AdMob test banner ad unit ID
  const AD_UNIT_ID ='ca-app-pub-9386844195611964/5335072095';

  return (
    <View style={styles.adContainer}>
      <View style={styles.promotedLabel}>
        <Text style={styles.promotedText}>Promoted</Text>
      </View>
      
      <GAMBannerAd
        unitId={AD_UNIT_ID}
        sizes={[BannerAdSize.FULL_BANNER]}
        requestOptions={{
          keywords: ['fashion', 'clothing'],
        }}
        onAdLoaded={() => {
          setAdLoaded(true);
          setAdError(false);
        }}
        onAdFailedToLoad={(error) => {
          console.log('Ad failed to load:', error);
          setAdError(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingTop: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E7',
  },
  promotedLabel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignSelf: 'flex-start',
  },
  promotedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#878A8C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default NativeAdComponent;
