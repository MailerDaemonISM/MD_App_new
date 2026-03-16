import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, TouchableOpacity, ScrollView, StyleSheet, 
    ActivityIndicator, Alert, Image, Dimensions, Animated 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { extractText } from 'expo-pdf-text-extract';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardedInterstitialAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
//import { API_KEY, gemini_model } from '@env';


const { width } = Dimensions.get('window');

// AdMob Rewarded Interstitial Configuration (Using Test ID)
const adUnitId = TestIds.REWARDED_INTERSTITIAL;
const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(adUnitId);

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyA1KR4mbKJEA1H9kmFbGkvIsMIR2Am1s7w"); 
const model = genAI.getGenerativeModel({model:"gemini-3-flash-preview"});

export default function ATSScreen() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [trialCount, setTrialCount] = useState(0);
    const [adLoaded, setAdLoaded] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Load Trials and Ad on Mount
    useEffect(() => {
        loadTrialCount();
        
        const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
            RewardedAdEventType.LOADED, () => setAdLoaded(true)
        );
        const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD, () => {
                resetTrials();
            }
        );

        rewardedInterstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, []);

    const loadTrialCount = async () => {
        const savedCount = await AsyncStorage.getItem('@ats_trial_count');
        if (savedCount) setTrialCount(parseInt(savedCount));
    };

    const resetTrials = async () => {
        setTrialCount(0);
        await AsyncStorage.setItem('@ats_trial_count', '0');
        Alert.alert("Reward Granted", "You have unlocked 3 more free scans!");
        rewardedInterstitial.load(); // Reload for next time
    };

    const handleAdsUnlock = () => {
        if (adLoaded) {
            rewardedInterstitial.show();
        } else {
            Alert.alert("Ad Loading", "Please wait a moment for the ad to load.");
            rewardedInterstitial.load();
        }
    };

    // Progress bar animation logic
    useEffect(() => {
        if (loading) {
            Animated.timing(progressAnim, {
                toValue: 90,
                duration: 5000,
                useNativeDriver: false,
            }).start();

            const interval = setInterval(() => {
                progressAnim.addListener(({ value }) => {
                    setProgress(Math.floor(value));
                });
            }, 100);
            return () => {
                clearInterval(interval);
                progressAnim.removeAllListeners();
            };
        } else {
            progressAnim.setValue(0);
            setProgress(0);
        }
    }, [loading]);

    const handleResumeUpload = async () => {
        // TRIAL LIMIT CHECK
        if (trialCount >= 3) {
            Alert.alert(
                "Limit Reached", 
                "You've used your 3 free trials. Watch a quick ad to unlock 3 more!",
                [{ text: "Watch Ad", onPress: handleAdsUnlock }, { text: "Cancel" }]
            );
            return;
        }

        try {
            const doc = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
            if (doc.canceled) return;

            setLoading(true);
            setResult(null);

            const pdfUri = doc.assets[0].uri;
            const extractedText = await extractText(pdfUri);

            if (!extractedText || extractedText.trim().length < 10) {
                throw new Error("PDF content is empty or unreadable.");
            }

            const prompt = `
                Act as an Expert ATS. Return ONLY valid JSON for this resume:
                {
                  "profile": "predicted job title",
                  "score": 0-100,
                  "summary": "1 sentence overview",
                  "keywords": ["top 5 missing"],
                  "tips": ["3 best improvements"]
                }
                Resume Text: ${extractedText}
            `;

            const geminiResponse = await model.generateContent(prompt);
            const responseText = geminiResponse.response.text();
            
            const jsonString = responseText.substring(
                responseText.indexOf('{'), 
                responseText.lastIndexOf('}') + 1
            );
            
            // Success! 
            Animated.timing(progressAnim, {
                toValue: 100,
                duration: 300,
                useNativeDriver: false,
            }).start(async () => {
                setResult(JSON.parse(jsonString));
                setLoading(false);
                
                // INCREMENT TRIAL COUNT
                const nextCount = trialCount + 1;
                setTrialCount(nextCount);
                await AsyncStorage.setItem('@ats_trial_count', nextCount.toString());
            });

        } catch (error) {
            setLoading(false);
            Alert.alert("Error", error.message);
        }
    };

    return (
        <ScrollView style={styles.mainContainer} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header Section */}
            <View style={styles.headerGradient}>
                <Image 
                    source={require('../assets/atsScore2.png')} 
                    style={styles.logo}
                    resizeMode="cover"
                />
                <Text style={styles.headerTitle}>ATS Scan</Text>
                <Text style={styles.headerSubtitle}>Free Trials Remaining: {3 - trialCount}</Text>
            </View>

            <View style={styles.contentContainer}>
                {/* Upload Area */}
                {!result && !loading && (
                    <TouchableOpacity 
                        style={[styles.uploadArea, trialCount >= 3 && { opacity: 0.6 }]} 
                        onPress={handleResumeUpload}
                    >
                        <View style={styles.uploadIconCircle}>
                            <Ionicons name={trialCount >= 3 ? "lock-closed-outline" : "document-text-outline"} size={40} color="#007AFF" />
                        </View>
                        <Text style={styles.uploadText}>
                            {trialCount >= 3 ? "Trials Finished" : "Upload PDF Resume"}
                        </Text>
                        <Text style={styles.uploadSubtext}>
                            {trialCount >= 3 ? "Click to watch ad & unlock" : "AI-powered MD analysis"}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Percentage Loader State */}
                {loading && !result && (
                    <View style={styles.loadingCard}>
                        <Text style={styles.progressPercentage}>{progress}%</Text>
                        <View style={styles.progressBarBackground}>
                            <Animated.View style={[styles.progressBarFill, { 
                                width: progressAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%']
                                }) 
                            }]} />
                        </View>
                        <Text style={styles.loadingText}>
                            {progress < 40 ? "Extracting text..." : progress < 80 ? "MD is analyzing your skills..." : "Finalizing report..."}
                        </Text>
                    </View>
                )}

                {/* Results View */}
                {result && (
                    <View style={styles.resultCard}>
                        <View style={styles.scoreRow}>
                            <View style={[
                                styles.scoreCircle, 
                                { borderColor: result.score > 70 ? '#10B981' : '#F59E0B' }
                            ]}>
                                <Text style={styles.scoreNumber}>{result.score}</Text>
                                <Text style={styles.scoreLabel}>Score</Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
                                    {result.profile}
                                </Text>
                                <View style={styles.summaryBadge}>
                                    <Text style={styles.summaryText}>{result.summary}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="flash" size={18} color="#007AFF" />
                            <Text style={styles.sectionLabel}>Missing Keywords</Text>
                        </View>
                        <View style={styles.tagWrapper}>
                            {result.keywords?.map((k, i) => (
                                <View key={i} style={styles.keywordTag}>
                                    <Text style={styles.keywordText}>{k}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={[styles.sectionTitleRow, { marginTop: 15 }]}>
                            <Ionicons name="trending-up" size={18} color="#10B981" />
                            <Text style={styles.sectionLabel}>Quick Wins</Text>
                        </View>
                        {result.tips?.map((t, i) => (
                            <View key={i} style={styles.tipItem}>
                                <View style={styles.tipBullet} />
                                <Text style={styles.tipContent}>{t}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.resetBtn} onPress={handleResumeUpload}>
                            <Text style={styles.resetBtnText}>
                                {trialCount >= 3 ? "Unlock Scans" : "Scan Another"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    headerGradient: {
        backgroundColor: '#0F172A',
        paddingTop: 60,
        paddingBottom: 50,
        alignItems: 'center',
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
        fontWeight: '600'
    },
    logo: { width: 140, height: 140, marginBottom: 12, borderRadius: 20 },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
    headerSubtitle: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 4, paddingHorizontal: 60 },
    
    contentContainer: { paddingHorizontal: 20, marginTop: -30 },
    
    uploadArea: {
        backgroundColor: '#fff', borderRadius: 24, padding: 40, alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', elevation: 4,
    },
    uploadIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    uploadText: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    uploadSubtext: { marginTop: 4, fontSize: 12, color: '#64748B' },

    // Loader Styles
    loadingCard: { backgroundColor: '#fff', padding: 30, borderRadius: 24, alignItems: 'center', elevation: 10 },
    progressPercentage: { fontSize: 36, fontWeight: '900', color: '#007AFF', marginBottom: 10 },
    progressBarBackground: { width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 15 },
    progressBarFill: { height: '100%', backgroundColor: '#007AFF' },
    loadingText: { color: '#64748B', fontWeight: '600', fontSize: 14 },

    resultCard: { backgroundColor: '#fff', borderRadius: 28, padding: 24, elevation: 10 },
    scoreRow: { flexDirection: 'row', alignItems: 'center' },
    scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    scoreNumber: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
    scoreLabel: { fontSize: 9, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
    
    profileInfo: { flex: 1 },
    profileTitle: { fontSize: 19, fontWeight: '800', color: '#0F172A' },
    summaryBadge: { backgroundColor: '#F1F5F9', padding: 8, borderRadius: 8, marginTop: 6 },
    summaryText: { fontSize: 12, color: '#475569', lineHeight: 16 },
    
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#334155', marginLeft: 8 },
    
    tagWrapper: { flexDirection: 'row', flexWrap: 'wrap' },
    keywordTag: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#DBEAFE' },
    keywordText: { fontSize: 11, color: '#1E40AF', fontWeight: '700' },
    
    tipItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    tipBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 10 },
    tipContent: { fontSize: 13, color: '#475569', flex: 1 },
    
    resetBtn: { marginTop: 20, backgroundColor: '#0F172A', padding: 16, borderRadius: 14, alignItems: 'center' },
    resetBtnText: { color: '#fff', fontWeight: '700' }
});