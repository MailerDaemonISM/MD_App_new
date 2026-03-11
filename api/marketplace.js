// ============================================================
// FILE: api/marketplace.js
// ============================================================

import { client } from '../sanity';

export async function fetchMarketplaceItems(category = null) {
  try {
    if (category && category !== 'All') {
      const query = `*[_type == "marketplaceItem" && approved == true && sold == false && category == $category] | order(createdAt desc) {
        _id, title, description, price, category,
        images[]{asset->{url}},
        location, sellerName, sellerClerkId,
        whatsapp, contact, sold, createdAt
      }`;
      return await client.fetch(query, { category });
    }
    const query = `*[_type == "marketplaceItem" && approved == true && sold == false] | order(createdAt desc) {
      _id, title, description, price, category,
      images[]{asset->{url}},
      location, sellerName, sellerClerkId,
      whatsapp, contact, sold, createdAt
    }`;
    return await client.fetch(query);
  } catch (error) {
    console.error('fetchMarketplaceItems error:', error);
    return [];
  }
}

export async function fetchMyListings(clerkId) {
  try {
    const query = `*[_type == "marketplaceItem" && sellerClerkId == $clerkId] | order(createdAt desc) {
      _id, title, description, price, category,
      images[]{asset->{url}},
      location, sellerName, whatsapp, contact,
      approved, sold, createdAt
    }`;
    return await client.fetch(query, { clerkId });
  } catch (error) {
    console.error('fetchMyListings error:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Upload a single image from a local file URI using fetch + ArrayBuffer
// Works in React Native / Expo Go without blob.arrayBuffer()
// ─────────────────────────────────────────────────────────────
async function uploadImageFromUri(uri) {
  // Read the file as a base64 string via fetch with blob workaround
  const response = await fetch(uri);
  const blob = await response.blob();

  // Convert blob to base64 using FileReader (supported in RN)
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // result is "data:image/jpeg;base64,/9j/4AAQ..."
      const result = reader.result;
      const base64Data = result.split(',')[1]; // strip the prefix
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Decode base64 to Uint8Array
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Upload to Sanity
  const asset = await client.assets.upload('image', bytes, {
    contentType: 'image/jpeg',
    filename: `marketplace_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
  });

  return asset;
}

export async function createMarketplaceListing(data, imageUris = []) {
  try {
    const imageRefs = [];

    for (const uri of imageUris) {
      if (!uri) continue;
      try {
        const asset = await uploadImageFromUri(uri);
        imageRefs.push({
          _type: 'image',
          _key: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        });
      } catch (imgError) {
        console.error('Image upload failed for uri:', uri, imgError);
      }
    }

    const doc = {
      _type: 'marketplaceItem',
      title:         data.title,
      description:   data.description || '',
      price:         parseFloat(data.price),
      category:      data.category,
      location:      data.location || '',
      sellerName:    data.sellerName,
      sellerClerkId: data.sellerClerkId,
      whatsapp:      data.whatsapp,
      contact:       data.contact || '',
      approved:      false,
      sold:          false,
      createdAt:     new Date().toISOString(),
      images:        imageRefs,
    };

    return await client.create(doc);
  } catch (error) {
    console.error('createMarketplaceListing error:', error);
    throw error;
  }
}

export async function markItemAsSold(itemId) {
  try {
    return await client.patch(itemId).set({ sold: true }).commit();
  } catch (error) {
    console.error('markItemAsSold error:', error);
    throw error;
  }
}

export async function deleteMarketplaceListing(itemId) {
  try {
    return await client.delete(itemId);
  } catch (error) {
    console.error('deleteMarketplaceListing error:', error);
    throw error;
  }
}