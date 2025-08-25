import { client } from '../sanity';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

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
        // Web: fetch file as blob
        const response = await fetch(uri);
        const blob = await response.blob();

        imageAsset = await client.assets.upload("image", blob, {
          filename: "image.jpg",
        });
      } else {
        // Native: read as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        imageAsset = await client.assets.upload(
          "image",
          Buffer.from(base64, "base64"),
          { filename: "image.jpg" }
        );
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

    console.log("Document created:", result);
    Alert.alert(
      "Successfully Uploaded",
      "Wait for our team to review your request, this won't take long",
      [{ text: "Ok" }]
    );

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error uploading document:", error);
    Alert.alert("Upload Failed", error.message || "Something went wrong");
  }
};
