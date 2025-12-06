import { client } from "./client";

export const setUserIfNotExists = async (userData) => {
  const { clerkId, email, name, username, image } = userData;

  try {
    const existingUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId }
    );

    if (existingUser) {
      const updatedUser = await client
        .patch(existingUser._id)
        .set({ email, name, username, image })
        .commit({ autoGenerateArrayKeys: true });

      return updatedUser;
    }

    const newUser = {
      _id: `user-${clerkId}`,
      _type: "user",
      clerkId,
      email,
      name,
      username,
      image,
    };

    const createdUser = await client.createIfNotExists(newUser);
    return createdUser;
  } catch (error) {
    console.error("Error syncing user in Sanity:", error.message);
    throw error;
  }
};
