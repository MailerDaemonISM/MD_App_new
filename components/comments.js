import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

const Comment = ({ comment, depth = 0 }) => {
  return (
    <View style={[styles.container, { marginLeft: depth > 0 ? 15 : 0 }]}>
      <View style={styles.lineIndicator}>
        <View style={styles.content}>
          <Text style={styles.author}>u/{comment.user_id.slice(0, 8)}</Text>
          <Markdown style={mdStyles}>{comment.content}</Markdown>
        </View>
        
        {/* Render children (replies) recursively */}
        {comment.children.map(child => (
          <Comment key={child.id} comment={child} depth={depth + 1} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10, borderLeftWidth: 1, borderLeftColor: '#E2E2E2', paddingLeft: 10 },
  author: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 2 },
  content: { marginBottom: 5 }
});

const mdStyles = { body: { fontSize: 14, color: '#333' } };

export default Comment;