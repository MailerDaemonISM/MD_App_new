import sanityClient from '@sanity/client'
 

export const client = sanityClient({
    projectId: "636pisvq",
    dataset: "production", 
    token:
    "skDpXEIvyUeKy69g5RUYbGtRKjydiLexkpwvOP4LNu9hHNchSbUB4gX2S64gowUWyM2ZoYgyWHby4vAOJLhp4eBdl3zgDUGk7A9ESApZyxCc072hOIhrUfkrt7VL2ki0zTuUoEYkh8nUd3N0XSsRxM4JnoX7N9w91r4yC6nCnMXOtVioDYOk",
    apiVersion: "2021-08-29",
   
    useCdn: false 
  });