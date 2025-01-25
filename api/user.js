import {client} from './Client'
export const loginUser= async ({username,password})=>{
    try {
        const { username, password } = JSON.parse(event.body);
    
        // Check username and password against Sanity user documents
        const user = await client.fetch(`*[_type == 'user' && username == ${username} && password == ${password}][0]`, {
          username,
          password,
        });
    
        if (!user) {
          return  "404";
        }
        else{
         return "random token";
        }
    
        // Assuming a successful login, you can generate a token here
    
         
      } catch (error) {
        console.error('Error finding user:', error);
      throw error; 
        
      }
}
export const getUser=async ({email})=>{
    try {
        // Check if the user already exists in Sanity
        const existingUser = await client.fetch(`*[_type == 'user' && email == $email][0]`, { email });
        if (!existingUser) {
            // User does not exist, create a new user
          
             
            return "404";
          } else {
            // User already exists
            return existingUser;
          }
    } 
    catch (error) {
        console.error('Error finding user:', error);
        throw error; // Optionally handle or rethrow the error
      }
     
}
export const setUserIfNotExists = async (userData) => {
    const { email, name, image } = userData;
    
    
    try {
      // Check if the user already exists in Sanity
      const existingUser = await client.fetch(`*[_type == 'user' && email == $email][0]`, { email });
      
      if (!existingUser) {
        // User does not exist, create a new user
        const newUser = {
          _type: 'user',
          email: email,
          name: name,
          image: image,
          // Additional fields as needed
        };
  
        // Use createIfNotExists or create based on your requirement
        const createdUser = await client.createIfNotExists(newUser);
  
         
        return createdUser;
      } else {
        // User already exists
        return existingUser;
      }
    } catch (error) {
      console.error('Error setting user:', error);
      throw error; // Optionally handle or rethrow the error
    }
  };