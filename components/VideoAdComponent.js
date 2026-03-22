import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = 'ca-app-pub-9386844195611964/5832938537';

const VideoAdComponent = ({ isVisible }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adLoading, setAdLoading] = useState(true);

  const interstitialRef = useRef(null);

  useEffect(() => {
    // ✅ create fresh instance
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialRef.current = ad;

    const loadListener = ad.addAdEventListener(AdEventType.LOADED, () => {
      setAdLoaded(true);
      setAdLoading(false);
    });

    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      setAdLoading(true);

      // reload next ad
      ad.load();
    });

    const errorListener = ad.addAdEventListener(AdEventType.ERROR, (err) => {
      console.log('Ad Error:', err);
      setAdLoading(false);
    });

    ad.load();

    return () => {
      loadListener();
      closeListener();
      errorListener();
    };
  }, []);

  // 🔥 Show when visible
  useEffect(() => {
    if (isVisible && adLoaded) {
      try {
        interstitialRef.current?.show();
      } catch (e) {
        console.log('Show error:', e);
      }
    }
  }, [isVisible, adLoaded]);

  return (
    <View style={styles.videoAdContainer}>
      <View style={styles.promotedLabel}>
        <Text style={styles.promotedText}>Promoted</Text>
      </View>

      <View style={styles.videoPlaceholder}>
        {adLoading ? (
          <ActivityIndicator size="large" color="#0079D3" />
        ) : (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              if (adLoaded) {
                interstitialRef.current?.show();
              }
            }}
          >
            <Text style={styles.playText}>Watch Sponsored Video</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default VideoAdComponent;
const styles = StyleSheet.create({
  videoAdContainer: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E4E7',
  },
  promotedLabel: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  promotedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#878A8C',
    textTransform: 'uppercase',
  },
  videoPlaceholder: {
    backgroundColor: '#F6F7F8',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: '#0079D3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});