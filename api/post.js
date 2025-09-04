import {client} from './client'
export async function getPosts() {
    const posts = await client.fetch('*[_type == "post"]')
    return posts
  }
export  const getPostById = async (postId) => {
     
  
    try {
      // Fetch the post with the specified ID
      const post = await client.fetch(`*[_type == 'post' && _id == $postId][0]`, { postId });
       
      
      return post;
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      throw error;  
    }
  }; 
  const likePost = async (postId, userId) => {
    try {
      // Fetch the current post to get the existing likes array
      const existingPost = await client.fetch(`*[_type == 'post' && _id == $postId][0]`, { postId });
  
      if (!existingPost) {
        throw new Error('Post not found');
      }
  
      // Extract the existing likes array or create an empty array if it doesn't exist
      const likesArray = existingPost.likes || [];
  
      // Check if the user's ID is already in the likes array
      const userLikedIndex = likesArray.findIndex((like) => like._ref === userId);
  
      if (userLikedIndex === -1) {
        // Add the user's ID to the likes array
        likesArray.push({ _ref: userId });
  
        // Update the post document with the new likes array
        const updatedPost = await client
          .patch(postId)
          .set({ likes: likesArray })
          .commit();
  
        console.log('Post liked:', updatedPost);
  
        return updatedPost;
      } else {
        // Remove the user's ID from the likes array
        likesArray.splice(userLikedIndex, 1);
  
        // Update the post document with the new likes array
        const updatedPost = await client
          .patch(postId)
          .set({ likes: likesArray })
          .commit();
  
        console.log('Like removed:', updatedPost);
  
        return updatedPost;
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw error; // Optionally handle or rethrow the error
    }
  };
  
  const createComment = async (name, email, postId, block) => {
    try {
      // Define the comment object
      const comment = {
        _type: 'comments',
        name: name,
        email: email,
        post: {
          _type: 'reference',
          _ref: postId, // Assuming postId is the ID of the post the comment belongs to
        },
        block: block,
      };
  
      
      const response = await client.create(comment);
  
      console.log('Comment created:', response);
  
      return response;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error; // Optionally handle or rethrow the error
    }
  }