import { client } from "../sanity";
import { Alert, Platform } from "react-native";

export const setLostFoundData = async (data, onSuccess) => {
  const { contact, body, location, type, name, uri, approved, title } = data;
  
  try {
    let doc = {
      _type: "lost_found",
      body,
      name,
      location,
      title,
      type,
      contact,
      approved: approved ?? false,
    };

    if (uri && uri !== "") {
      let imageAsset;
      
      if (Platform.OS === "web") {
        // --- Web: use fetch to get a Blob ---
        const response = await fetch(uri);
        const blob = await response.blob();
        imageAsset = await client.assets.upload("image", blob, {
          filename: "image.jpg",
        });
      } else {
        // --- Native: create proper FormData ---
        const filename = uri.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : "image/jpeg";
        
        // Create FormData for native upload
        const formData = new FormData();
        formData.append('file', {
          uri: uri,
          type: fileType,
          name: filename,
        });
        
        // Alternative approach: Convert to blob for Sanity
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          imageAsset = await client.assets.upload("image", blob, {
            filename: filename,
          });
        } catch (fetchError) {
          console.log("Blob conversion failed, trying direct file upload...");
          // Fallback to direct file object
          const file = {
            uri: uri,
            type: fileType,
            name: filename,
          };
          imageAsset = await client.assets.upload("image", file);
        }
      }

      doc.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageAsset._id,
        },
      };
    }

    const result = await client.create(doc);
    console.log("✅ Document created:", result);
    
    Alert.alert(
      "Successfully Uploaded",
      "Wait for our team to review your request, this won't take long",
      [{ text: "Ok" }]
    );
    
    if (onSuccess) onSuccess();
    
  } catch (error) {
    console.error("❌ Error uploading document:", error.message || error);
    Alert.alert("Upload Failed", error.message || "Something went wrong. Please try again.");
  }
};
export const getMDLostFoundPosts = async () => {
  try {
    const query = `
      *[_type == "lost_found"]
      | order(_createdAt desc)
    `;

    const res = await client.fetch(query);
    return res;
  } catch (error) {
    console.error("Sanity fetch error:", error);
    throw error;
  }
};
