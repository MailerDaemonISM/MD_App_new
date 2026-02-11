import axios from "axios";

export default async function handler(req, res) {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // ✅ Debug logs (remove later)
    console.log("Webhook triggered");
    console.log("KEY EXISTS:", !!process.env.ONESIGNAL_REST_API_KEY);
    console.log("APP ID EXISTS:", !!process.env.ONESIGNAL_APP_ID);
    console.log("WEBHOOK SECRET EXISTS:", !!process.env.WEBHOOK_SECRET);

    // ✅ Verify Sanity webhook secret
    if (req.headers["x-webhook-secret"] !== process.env.WEBHOOK_SECRET) {
      return res.status(401).send("Unauthorized");
    }

    // ✅ Extract post data
    const post = req.body.document || req.body;
    const title = post?.title || "New Post Published";

    console.log("Sanity Payload:", JSON.stringify(req.body, null, 2));

    // ✅ Send notification to OneSignal
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: "New Update 🚀" },
        contents: { en: title },
        data: {
          postId: post?._id || null
        }
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("OneSignal Response:", response.data);

    return res.status(200).send("Notification sent successfully");

  } catch (error) {
    console.error("OneSignal Error:", error.response?.data || error.message);
    return res.status(500).send("Error sending notification");
  }
}