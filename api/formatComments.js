export const nestComments = (commentList) => {
  const commentMap = {};
  commentList.forEach(comment => commentMap[comment.id] = { ...comment, children: [] });
  
  const tree = [];
  commentList.forEach(comment => {
    if (comment.parent_id) {
      commentMap[comment.parent_id].children.push(commentMap[comment.id]);
    } else {
      tree.push(commentMap[comment.id]);
    }
  });
  return tree;
};