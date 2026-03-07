// ============================================================
// FILE: Screens/Marketplace/MarketplaceAddPost.js
// DESIGN: Dark luxury — form with glowing inputs
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, ScrollView, Alert, ActivityIndicator, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { useUser } from '@clerk/clerk-expo';
import { createMarketplaceListing } from '../../api/marketplace';

const C = {
  bg:        '#0D0F14',
  surface:   '#161A23',
  card:      '#1C2130',
  border:    '#252B3B',
  accent:    '#C8F53C',
  text:      '#EAEDF5',
  textSub:   '#7A8099',
  textMuted: '#4A5168',
  red:       '#FF4D6A',
  green:     '#3DFFA0',
};

const CATEGORIES = [
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Books',       value: 'Books'       },
  { label: 'Clothing',    value: 'Clothing'    },
  { label: 'Furniture',   value: 'Furniture'   },
  { label: 'Sports',      value: 'Sports'      },
  { label: 'Stationery',  value: 'Stationery'  },
  { label: 'Other',       value: 'Other'       },
];

function InputField({ label, required, children }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={{ color: C.accent }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

export default function MarketplaceAddPost() {
  const { user } = useUser();
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [category,    setCategory]    = useState('');
  const [location,    setLocation]    = useState('');
  const [whatsapp,    setWhatsapp]    = useState('');
  const [contact,     setContact]     = useState('');
  const [imageUris,   setImageUris]   = useState([]);
  const [submitting,  setSubmitting]  = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    (async () => {
      if (Platform.OS !== 'web') {
        try {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow photo library access in Settings.');
          }
        } catch (err) { console.error(err); }
      }
    })();
  }, []);

  const pickImage = async () => {
    if (imageUris.length >= 4) {
      Alert.alert('Limit Reached', 'Maximum 4 images allowed.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setImageUris(prev => [...prev, result.assets[0].uri]);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Could not open photo library. Check permissions in Settings.');
    }
  };

  const removeImage = (index) => setImageUris(prev => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle(''); setDescription(''); setPrice(''); setCategory('');
    setLocation(''); setWhatsapp(''); setContact(''); setImageUris([]);
  };

  const handleSubmit = async () => {
    if (!title.trim())                          return Alert.alert('Required', 'Please enter an item title.');
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) return Alert.alert('Required', 'Please enter a valid price.');
    if (!category)                              return Alert.alert('Required', 'Please select a category.');
    if (!whatsapp.match(/^\d{10}$/))            return Alert.alert('Invalid', 'WhatsApp must be 10 digits (no country code).');
    if (contact && !contact.match(/^\d{10}$/)) return Alert.alert('Invalid', 'Alternate contact must be 10 digits.');

    setSubmitting(true);
    try {
      await createMarketplaceListing(
        { title: title.trim(), description: description.trim(), price, category,
          location: location.trim(), sellerName: user?.fullName || user?.username || 'Anonymous',
          sellerClerkId: user?.id, whatsapp: whatsapp.trim(), contact: contact.trim() },
        imageUris
      );
      Alert.alert('🎉 Submitted!', 'Under review — will go live after admin approval.', [{ text: 'OK', onPress: resetForm }]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Submission failed. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Page Header ───────────────────────────────── */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>New Listing</Text>
            <Text style={styles.pageSub}>Fill in details to list your item for sale</Text>
          </View>

          {/* ── Image Picker ──────────────────────────────── */}
          <View style={styles.imgSection}>
            <Text style={styles.fieldLabel}>Photos <Text style={{ color: C.textMuted }}>(up to 4)</Text></Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imgRow}>
              {imageUris.map((uri, idx) => (
                <View key={idx} style={styles.imgThumbWrap}>
                  <Image source={{ uri }} style={styles.imgThumb} resizeMode="cover" />
                  <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(idx)}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                  {idx === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeTxt}>COVER</Text>
                    </View>
                  )}
                </View>
              ))}
              {imageUris.length < 4 && (
                <TouchableOpacity style={styles.addImgBtn} onPress={pickImage} activeOpacity={0.8}>
                  <View style={styles.addImgIcon}>
                    <Ionicons name="camera" size={26} color={C.accent} />
                  </View>
                  <Text style={styles.addImgTxt}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* ── Title ──────────────────────────────────────── */}
          <InputField label="Item Title" required>
            <TextInput
              style={styles.input}
              placeholder="e.g. Physics Textbook, MTB Cycle, Laptop"
              placeholderTextColor={C.textMuted}
              value={title} onChangeText={setTitle}
              selectionColor={C.accent}
            />
          </InputField>

          {/* ── Description ────────────────────────────────── */}
          <InputField label="Description">
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Describe condition, specs, reason for selling..."
              placeholderTextColor={C.textMuted}
              value={description} onChangeText={setDescription}
              multiline numberOfLines={4} textAlignVertical="top"
              selectionColor={C.accent}
            />
          </InputField>

          {/* ── Price ──────────────────────────────────────── */}
          <InputField label="Price" required>
            <View style={styles.prefixRow}>
              <View style={styles.prefixBox}><Text style={styles.prefixTxt}>₹</Text></View>
              <TextInput
                style={[styles.input, styles.inputAfterPrefix]}
                placeholder="0"
                placeholderTextColor={C.textMuted}
                value={price} onChangeText={setPrice}
                keyboardType="numeric"
                selectionColor={C.accent}
              />
            </View>
          </InputField>

          {/* ── Category ───────────────────────────────────── */}
          <InputField label="Category" required>
            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={{ color: C.text, fontSize: 14 }}
              itemContainerStyle={{ backgroundColor: C.card }}
              activeColor={C.border}
              data={CATEGORIES}
              labelField="label"
              valueField="value"
              placeholder="Select Category"
              placeholderStyle={{ color: C.textMuted, fontSize: 14 }}
              selectedTextStyle={{ color: C.text, fontSize: 14 }}
              iconColor={C.textMuted}
              value={category}
              onChange={item => setCategory(item.value)}
            />
          </InputField>

          {/* ── Location ───────────────────────────────────── */}
          <InputField label="Location / Hostel Block">
            <TextInput
              style={styles.input}
              placeholder="e.g. BH-3, Library Gate, CSE Dept"
              placeholderTextColor={C.textMuted}
              value={location} onChangeText={setLocation}
              selectionColor={C.accent}
            />
          </InputField>

          {/* ── WhatsApp ───────────────────────────────────── */}
          <InputField label="WhatsApp Number" required>
            <View style={styles.prefixRow}>
              <View style={styles.prefixBox}><Text style={styles.prefixTxt}>+91</Text></View>
              <TextInput
                style={[styles.input, styles.inputAfterPrefix]}
                placeholder="9876543210"
                placeholderTextColor={C.textMuted}
                value={whatsapp} onChangeText={setWhatsapp}
                keyboardType="numeric" maxLength={10}
                selectionColor={C.accent}
              />
            </View>
          </InputField>

          {/* ── Alt Contact ────────────────────────────────── */}
          <InputField label="Alternate Contact (optional)">
            <View style={styles.prefixRow}>
              <View style={styles.prefixBox}><Text style={styles.prefixTxt}>+91</Text></View>
              <TextInput
                style={[styles.input, styles.inputAfterPrefix]}
                placeholder="9876543210"
                placeholderTextColor={C.textMuted}
                value={contact} onChangeText={setContact}
                keyboardType="numeric" maxLength={10}
                selectionColor={C.accent}
              />
            </View>
          </InputField>

          {/* ── Note ───────────────────────────────────────── */}
          <View style={styles.noteBox}>
            <Ionicons name="shield-checkmark-outline" size={16} color={C.accent} />
            <Text style={styles.noteTxt}>
              {' '}Listing will be reviewed by admin before going live on the marketplace.
            </Text>
          </View>

          {/* ── Submit ─────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator color={C.bg} />
              : <>
                  <Text style={styles.submitTxt}>Submit Listing</Text>
                  <Ionicons name="arrow-forward" size={18} color={C.bg} />
                </>
            }
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 100 },

  pageHeader: { marginBottom: 28, paddingTop: 6 },
  pageTitle: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  pageSub:   { fontSize: 13, color: C.textMuted, marginTop: 4 },

  imgSection: { marginBottom: 24 },
  imgRow: { paddingRight: 8, gap: 10, paddingVertical: 4 },
  imgThumbWrap: { position: 'relative' },
  imgThumb: { width: 88, height: 88, borderRadius: 14, backgroundColor: C.card },
  imgRemove: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: C.red, borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute', bottom: 6, left: 0, right: 0,
    backgroundColor: C.accent + 'CC', alignItems: 'center', borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    paddingVertical: 2,
  },
  primaryBadgeTxt: { fontSize: 9, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },
  addImgBtn: {
    width: 88, height: 88, borderRadius: 14,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.accent + '60',
    backgroundColor: C.accent + '08', alignItems: 'center', justifyContent: 'center',
  },
  addImgIcon: { marginBottom: 4 },
  addImgTxt: { fontSize: 10, color: C.accent, fontWeight: '700' },

  fieldWrap: { marginBottom: 18 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: C.textSub, letterSpacing: 1, marginBottom: 8 },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: C.text,
  },
  inputMulti: { height: 96, textAlignVertical: 'top' },
  prefixRow:  { flexDirection: 'row', alignItems: 'center' },
  prefixBox: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
    paddingHorizontal: 12, paddingVertical: 13,
    borderRightWidth: 0,
  },
  prefixTxt: { fontSize: 14, color: C.textSub, fontWeight: '700' },
  inputAfterPrefix: {
    flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
  },
  dropdown: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, height: 48,
  },
  dropdownContainer: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, overflow: 'hidden',
  },
  noteBox: {
    flexDirection: 'row', backgroundColor: C.accent + '0F',
    borderRadius: 12, padding: 14, marginBottom: 22,
    borderWidth: 1, borderColor: C.accent + '25',
    alignItems: 'flex-start',
  },
  noteTxt: { fontSize: 12, color: C.accent, flex: 1, lineHeight: 18 },
  submitBtn: {
    backgroundColor: C.accent, paddingVertical: 17, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  submitBtnDisabled: { backgroundColor: C.accent + '55' },
  submitTxt: { color: C.bg, fontSize: 16, fontWeight: '900', letterSpacing: 0.3 },
});