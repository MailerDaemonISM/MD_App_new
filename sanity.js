import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "636pisvq",
  dataset: "production",
  token:"skDpXEIvyUeKy69g5RUYbGtRKjydiLexkpwvOP4LNu9hHNchSbUB4gX2S64gowUWyM2ZoYgyWHby4vAOJLhp4eBdl3zgDUGk7A9ESApZyxCc072hOIhrUfkrt7VL2ki0zTuUoEYkh8nUd3N0XSsRxM4JnoX7N9w91r4yC6nCnMXOtVioDYOk",
  apiVersion: "2021-08-29",
  useCdn: false, 
});

export const fetchSanityUserId = async (clerkId) => {
  try {
    // 1. Try to find the user by their clerkId
    const query = `*[_type == "user" && clerkId == $clerkId][0]._id`;
    const params = { clerkId };
    console.log("cid:" + clerkId);
    let sanityId = await client.fetch(query, params);
    console.log("sanid:" + sanityId);
    // 2. If user doesn't exist in Sanity yet, return null 
    // (Or you can use client.createIfNotExists here if you want to auto-create)
    return sanityId;
  } catch (error) {
    console.error("Sanity Fetch Error:", error);
    return null;
  }
};