import { client } from './client';

// Get all posts sorted by creation date
export async function getPosts() {
  return await client.fetch('*[_type == "post"] | order(_createdAt desc)');
}

// Subscribe to post updates and fetch new posts
export const subscribeToPostUpdates = (callback) => {
  return client.listen('*[_type == "post"]').subscribe(async (update) => {
    if (update.result && update.result._type === "post") {
      // Fetch all posts to update UI
      const posts = await getPosts();
      callback(posts);

      // If it's a newly created post, trigger local notification
      if (update.mutations.some((m) => m.create)) {
        try {
          // Call backend API that triggers push notifications
          await fetch('https://YOUR_NGROK_URL/api/sanity-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: update.result._id }),
          });
        } catch (err) {
          console.error('Error calling notification backend:', err);
        }
      }
    }
  });
};

// Fetch single post by ID
export const getPostById = async (postId) => {
  try {
    const post = await client.fetch(`*[_type == 'post' && _id == $postId][0]`, { postId });
    return post;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    throw error;
  }
};

// Like/Unlike a post
export const likePost = async (postId, userId) => {
  try {
    const existingPost = await getPostById(postId);
    if (!existingPost) throw new Error('Post not found');

    const likesArray = existingPost.likes || [];
    const userLikedIndex = likesArray.findIndex((like) => like._ref === userId);

    if (userLikedIndex === -1) likesArray.push({ _ref: userId });
    else likesArray.splice(userLikedIndex, 1);

    const updatedPost = await client.patch(postId).set({ likes: likesArray }).commit();
    return updatedPost;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Create a comment
export const createComment = async (name, email, postId, block) => {
  try {
    const comment = {
      _type: 'comments',
      name,
      email,
      post: { _type: 'reference', _ref: postId },
      block,
    };
    return await client.create(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData) => {
  try {
    return await client.create({
      _type: 'post',
      _createdAt: new Date().toISOString(),
      ...postData,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};
