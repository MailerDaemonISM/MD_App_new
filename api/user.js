// api/user.js
import { client } from "./client";

export const setUserIfNotExists = async (userData) => {
  const { clerkId, email, name, username, image } = userData;

  try {
    // Check if the user already exists in Sanity
    const existingUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId }
    );

    if (!existingUser) {
      // User does not exist, create a new one
      const newUser = {
        _id: clerkId, // makes ClerkId the document _id 
        _type: "user",
        clerkId,
        email,
        name,
        username,
        image,
      };

      const createdUser = await client.createIfNotExists(newUser);
      console.log("✅ User created in Sanity:", createdUser);
      return createdUser;
    } else {
      //console.log("ℹ️ User already exists in Sanity:", existingUser);
      return existingUser;
    }
  } catch (error) {
    console.error("❌ Error setting user in Sanity:", error);
    throw error;
  }
};
