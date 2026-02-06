import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = TestIds.INTERSTITIAL;

let interstitialAd = null;

const createInterstitialAd = () => {
  return InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
};

const VideoAdComponent = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adLoading, setAdLoading] = useState(true);
  const [videoPlayable, setVideoPlayable] = useState(false);

  useEffect(() => {
    const loadAd = () => {
      try {
        if (!interstitialAd) {
          interstitialAd = createInterstitialAd();
        }

        // Load the interstitial ad (doesn't return a promise)
        interstitialAd.load();
        
        // Simulate loading delay
        setTimeout(() => {
          setAdLoaded(true);
          setAdLoading(false);
          setVideoPlayable(true);
        }, 1500);
      } catch (error) {
        console.log('Failed to load interstitial ad:', error);
        setAdLoading(false);
        setAdLoaded(false);
      }
    };

    loadAd();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handlePlayVideo = () => {
    if (videoPlayable && interstitialAd) {
      try {
        interstitialAd.show();
        setVideoPlayable(false);
        // Reload ad after being shown
        setTimeout(() => {
          if (interstitialAd) {
            try {
              interstitialAd.load();
            } catch (err) {
              console.log('Error reloading ad:', err);
            }
          }
        }, 1000);
      } catch (error) {
        console.log('Failed to show interstitial ad:', error);
      }
    }
  };

  return (
    <View style={styles.videoAdContainer}>
      <View style={styles.promotedLabel}>
        <Text style={styles.promotedText}>Promoted</Text>
      </View>

      <View style={styles.videoPlaceholder}>
        <View style={styles.videoContent}>
          <Text style={styles.videoIcon}>🎬</Text>
          <Text style={styles.videoTitle}>Video Advertisement</Text>
          <Text style={styles.videoSubtitle}>
            {adLoading ? 'Loading video ad...' : 'Tap to watch sponsored video'}
          </Text>

          {adLoading ? (
            <ActivityIndicator size="large" color="#0079D3" style={{ marginTop: 16 }} />
          ) : (
            <TouchableOpacity
              style={[
                styles.playButton,
                !videoPlayable && styles.playButtonDisabled
              ]}
              onPress={handlePlayVideo}
              disabled={!videoPlayable}
            >
              <Text style={styles.playIcon}>▶</Text>
              <Text style={styles.playText}>
                {videoPlayable ? 'Play Video' : 'Ad Loading...'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    alignSelf: 'flex-start',
  },
  promotedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#878A8C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  videoPlaceholder: {
    backgroundColor: '#F6F7F8',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  videoContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1B',
    marginBottom: 8,
    textAlign: 'center',
  },
  videoSubtitle: {
    fontSize: 13,
    color: '#878A8C',
    textAlign: 'center',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#0079D3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  playButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  playIcon: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  playText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default VideoAdComponent;
