import React from "react";

// Define a simple Post type to ensure compatibility
interface Post {
  shortcode?: string;
  caption?: string[] | null;
  liked_by?: number | null;
  comment_count?: number | null;
  [key: string]: any; // Allow other properties
}

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  // Format caption from array to string
  const formatCaption = (caption: string[] | null | undefined): string => {
    if (!caption || caption.length === 0) {
      return "No caption";
    }
    return caption.join(" ");
  };


  return (
    <div className="posts-list">
      <table className="posts-table">
        <thead>
          <tr>
            <th>Shortcode</th>
            <th>Caption</th>
            <th>Likes</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr key={post.shortcode || index} className="post-item">
              <td className="post-shortcode">
                {post.shortcode ? (
                  <a
                    href={`https://www.instagram.com/p/${post.shortcode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {post.shortcode}
                  </a>
                ) : (
                  "N/A"
                )}
              </td>
              <td className="post-caption">{formatCaption(post.caption)}</td>
              <td className="post-likes">
                {post.liked_by !== null && post.liked_by !== undefined
                  ? post.liked_by.toLocaleString()
                  : "N/A"}
              </td>
              <td className="post-comments">
                {post.comment_count !== null && post.comment_count !== undefined
                  ? post.comment_count.toLocaleString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostList;
