import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import client from "../sanity"; // your sanity client

const UserScreen = () => {
  const { user } = useUser();
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchSavedPosts = async () => {
      const query = `
        *[_type == "user" && _id == $userId][0]{
          saved_post[]->{
            _id, title, body
          }
        }
      `;
      const data = await client.fetch(query, { userId: user.id });
      setSavedPosts(data?.saved_post || []);
    };

    fetchSavedPosts();
  }, [user]);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f9f9f9" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        📌 Saved Posts
      </Text>

      {savedPosts.length === 0 ? (
        <Text>No saved posts yet.</Text>
      ) : (
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 15, padding: 10, backgroundColor: "#fff", borderRadius: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
              <Text>{item.body[0]?.children[0]?.text || "..."}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default UserScreen;
