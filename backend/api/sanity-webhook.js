import axios from "axios";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {

    if (req.headers["x-webhook-secret"] !== process.env.WEBHOOK_SECRET) {
      return res.status(401).send("Unauthorized");
    }

const post = req.body.document || req.body;    
const title = post?.title || "New Post Published";

    await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ["All"],

        headings: { en: "New Update 🚀" },
        contents: { en: title },

        data: {
          postId: post._id
        }
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONE_SIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).send("Notification sent");

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).send("Error sending notification");
  }
}
console.log("Sanity Payload:", JSON.stringify(req.body, null, 2));