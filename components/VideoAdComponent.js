import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = TestIds.INTERSTITIAL;

let interstitialAd = null;

const createInterstitialAd = () => {
  return InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
};

const VideoAdComponent = ({ isVisible }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adLoading, setAdLoading] = useState(true);
  const hasShown = useRef(false);

  useEffect(() => {
    if (!interstitialAd) {
      interstitialAd = createInterstitialAd();
    }

    const loadedListener = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setAdLoaded(true);
        setAdLoading(false);
      }
    );

    const closedListener = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        hasShown.current = false;
        interstitialAd.load();
      }
    );

    interstitialAd.load();

    return () => {
      loadedListener();
      closedListener();
    };
  }, []);

  useEffect(() => {
    if (isVisible && adLoaded && !hasShown.current) {
      try {
        interstitialAd.show();
        hasShown.current = true;
      } catch (err) {
        console.log("Ad show error:", err);
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
              if (adLoaded) interstitialAd.show();
            }}
          >
            <Text style={styles.playText}>Watch Sponsored Video</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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

export default VideoAdComponent;