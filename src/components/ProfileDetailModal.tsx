import { useEffect, useRef, useState } from "react";
import type { Profile } from "../types";
import { getAuthToken } from "../services/authService";

// Define a simple Post type for what we need
interface Post {
  shortcode: string;
  caption?: string[] | null;
  liked_by?: number | null;
  comment_count?: number | null;
  [key: string]: any; // Allow other properties
}

interface ProfileDetailModalProps {
  profile: Profile | null;
  onClose: () => void;
}

// API base URL with proxy for development
const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://spark-scraper-api.sparkonomy.com";

const ProfileDetailModal = ({ profile, onClose }: ProfileDetailModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const [profilePosts, setProfilePosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Fetch posts for this profile
  useEffect(() => {
    if (profile?.id) {
      fetchProfilePosts(profile.id);
    }
  }, [profile]);

  const fetchProfilePosts = async (profileId: string) => {
    try {
      setLoadingPosts(true);

      // Prepare headers with authentication
      const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      // Add authentication header if we have a token
      const authToken = getAuthToken();
      if (authToken) {
        headers["Authorization"] = authToken;
      }

      // Use the auth endpoint for profile posts
      const response = await fetch(
        `${API_BASE_URL}/auth/profiles/posts/${profileId}`,
        {
          method: "POST", // Changed from GET to POST
          headers,
          // Send an empty body or you can add parameters if needed
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Normalize posts data
      const normalizedPosts = Array.isArray(data)
        ? data
        : data.posts || data.results || [];

      setProfilePosts(normalizedPosts);
    } catch (err) {
      console.error("Failed to fetch profile posts:", err);
      setProfilePosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Export posts data as CSV
  const exportPostsCSV = () => {
    if (profilePosts.length === 0) {
      return;
    }

    // For posts, include all fields for export
    const getAllKeys = (posts: Post[]): string[] => {
      const keySet = new Set<string>();
      posts.forEach((post) => {
        Object.keys(post).forEach((key) => keySet.add(key));
      });
      return Array.from(keySet);
    };

    const keys = getAllKeys(profilePosts);

    // Create CSV header row
    const header = keys.join(",");

    // Create CSV rows for each post
    const rows = profilePosts.map((post) => {
      return keys
        .map((key) => {
          const value = post[key as keyof Post];
          if (value === null || value === undefined) {
            return "";
          }
          if (Array.isArray(value)) {
            // For arrays like caption, join with space and properly escape
            return `"${value.join(" ").replace(/"/g, '""')}"`;
          }
          if (typeof value === "object") {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    // Combine header and rows
    const csv = [header, ...rows].join("\n");

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `posts_${profile?.username || "profile"}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Prevent scrolling of background content
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  // Reset image error when profile changes
  useEffect(() => {
    setImageError(false);
  }, [profile]);

  if (!profile) {
    return null;
  }

  // Function to get the profile image URL
  const getProfileImageUrl = (username: string | undefined) => {
    if (!username) {
      return null;
    }

    // Construct the URL with the username and .jpg extension
    return `https://sparkonomy.blr1.digitaloceanspaces.com/instagram_profile_pictures/${username}.jpg`;
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "N/A";
    }
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  // Format field name for display (convert snake_case to Title Case)
  const formatFieldName = (field: string) => {
    return field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Format field value based on its type
  const formatFieldValue = (key: string, value: any) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (
      key.includes("time") &&
      typeof value === "string" &&
      value.includes("-")
    ) {
      return formatDate(value);
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "None";
    }

    if (typeof value === "object") {
      try {
        return (
          <pre className="json-data">{JSON.stringify(value, null, 2)}</pre>
        );
      } catch (e) {
        return "Invalid object data";
      }
    }

    return String(value);
  };

  // Format caption from array to string
  const formatCaption = (caption: string[] | null | undefined): string => {
    if (!caption || caption.length === 0) {
      return "No caption";
    }
    return caption.join(" ");
  };

  // Ensure values are displayed properly even when null/undefined
  const safeNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    return value.toLocaleString();
  };

  // Safely get username for display
  const getUsername = () => {
    return profile.username || "No username";
  };

  // Safely get first letter for avatar
  const getAvatarLetter = () => {
    return (profile.username?.[0] || "?").toUpperCase();
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Get image URL
  const imageUrl = getProfileImageUrl(profile.username);

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="profile-avatar">
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={getUsername()}
                  className="avatar-image large"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className="avatar-placeholder large">
                  {getAvatarLetter()}
                </div>
              )}
            </div>
            <div className="profile-title">
              <h2 className="profile-username">
                {getUsername()}
                {profile.is_verified && (
                  <span className="verified-badge" title="Verified">
                    ✓
                  </span>
                )}
              </h2>
              <p className="profile-fullname">{profile.full_name || ""}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Posts Section - Only showing the 4 fields requested */}
          <div className="profile-posts-section">
            <div className="section-header">
              <h3 className="section-title">Posts</h3>
              {profilePosts.length > 0 && (
                <button
                  className="button button-sm button-outline"
                  onClick={exportPostsCSV}
                >
                  Export Posts
                </button>
              )}
            </div>

            {loadingPosts ? (
              <div className="loading-posts">
                <div className="loading-spinner"></div>
                <span>Loading posts...</span>
              </div>
            ) : profilePosts.length === 0 ? (
              <div className="no-posts-message">
                No posts found for this profile.
              </div>
            ) : (
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
                    {profilePosts.map((post, index) => (
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
                        <td className="post-caption">
                          {formatCaption(post.caption)}
                        </td>
                        <td className="post-likes">
                          {safeNumber(post.liked_by)}
                        </td>
                        <td className="post-comments">
                          {safeNumber(post.comment_count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Profile Details Section */}
          <div className="profile-all-fields-section">
            <h3 className="section-title">Profile Details</h3>
            <div className="profile-details-grid">
              {Object.entries(profile)
                .filter(
                  ([key]) =>
                    // Filter out profile picture URL as we're handling it separately
                    key !== "profile_pic_url"
                )
                .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sort alphabetically
                .map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <span className="detail-label">{formatFieldName(key)}</span>
                    <span className="detail-value">
                      {formatFieldValue(key, value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailModal;
