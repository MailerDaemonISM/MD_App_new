import client from '../sanity'
import { Alert, StyleSheet, View } from "react-native";
export const setLostFoundData = async (data) => {
  const { contact, body, location, type, name, uri, approved } = data;
  if (uri === "") {
    const doc = {
      _type: "lost_found",
      body,
      name,
      location,
      type,
      contact: contact,
      approved,
    };
    const result = await client.create(doc);
    if (result._createdAt) {
      console.log("Document created with ID:", result._id);
      Alert.alert(
        "Successfullyy Uploaded",
        "Wait For Our Team To Review Your Request,This won't Take Long",
        [
          {
            text: "Ok",
            //onPress: () => Navigation.replace("Load"),
          },
        ]
      );
    } else {
      console.log("Error in uploding doc");
    }
  } else {
    const img = await fetch(uri);
    const bytes = await img.blob();

    client.assets
      .upload("image", bytes, { filename: "image" })
      .then((imageAsset) => {
        const doc = {
          _type: "lost_found",
          body,
          name,
          location,
          type,
          contact: contact,
          //dateandtime: imageAsset._createdAt,
          approved,
          image: {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: imageAsset._id,
            },
          },
        };

        client.create(doc).then((response) => {
          console.log(response);
          if (response._createdAt) {
            console.log("Document created with ID:", response._id);
            Alert.alert(
              "Successfully Uploaded",
              "Wait For Our Team To Review Your Request, This won't Take Long",
              [
                {
                  text: "Ok",
                  //onPress: () => Navigation.replace("Load"),
                },
              ]
            );
          } else {
            console.log("Error in uploading doc");
          }
        });
      });
  }
  };