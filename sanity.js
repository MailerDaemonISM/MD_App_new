import sanityClient from "@sanity/client";

export const client = sanityClient({
  projectId: "636pisvq",
  dataset: "production",
  token:
    "skDpXEIvyUeKy69g5RUYbGtRKjydiLexkpwvOP4LNu9hHNchSbUB4gX2S64gowUWyM2ZoYgyWHby4vAOJLhp4eBdl3zgDUGk7A9ESApZyxCc072hOIhrUfkrt7VL2ki0zTuUoEYkh8nUd3N0XSsRxM4JnoX7N9w91r4yC6nCnMXOtVioDYOk",
  apiVersion: "2021-08-29",

  useCdn: false,
});

export const fetchPlacementData = async () => {
  try {
    const response = await fetch(
      "https://zltsypm6.api.sanity.io/v2021-10-21/data/query/production?query=*%5B_type%20%3D%3D%20%22placement24%22%5D%7B%0A%20%20name%2C%0A%20%20company_name%2C%0A%20%20role%2C%0A%20%20eligible_branch%2C%0A%20%20CGPA%2C%0A%20%20year%2C%0A%20%20selection_process%7B%0A%20%20%20%20step1%2C%0A%20%20%20%20step2%2C%0A%20%20%20%20step3%0A%20%20%7D%2C%0A%20%20interview_round%7B%0A%20%20%20%20round1%2C%0A%20%20%20%20round2%2C%0A%20%20%20%20round3%2C%0A%20%20%20%20round4%0A%20%20%7D%2C%0A%20%20influence_of%7B%0A%20%20%20%20PORs%2C%0A%20%20%20%20projects%0A%20%20%7D%2C%0A%20%20takeaways%2C%0A%20%20test_series%2C%0A%20%20resources%2C%0A%20%20%22imageUrl%22%3A%20image.asset-%3Eurl%2C%0A%20%20selected%0A%7D%0A"
    );
    const data = await response.json();
    return data.result; // This contains the array of placement data
  } catch (error) {
    console.error("Error fetching placement data:", error);
    return [];
  }
};

