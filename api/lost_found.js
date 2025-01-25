import {client} from './Client'
export const setLostFoundData = async (data) => {
    try {
      // Define the 'lost_found' document
      const lostFoundDocument = {
        _type: 'lost_found',
        ...data,
      };
  
      // Check if the document already exists based on a unique identifier (e.g., name)
       
  
    
        // If the document doesn't exist, create it
        const createdDocument = await client.create(lostFoundDocument);
  
        console.log('Lost_Found data created:', createdDocument);
  
        return createdDocument;
      
    } catch (error) {
      console.error('Error setting Lost_Found data:', error);
      throw error; // Optionally handle or rethrow the error
    }
  };