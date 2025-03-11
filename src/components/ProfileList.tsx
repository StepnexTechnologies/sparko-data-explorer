import { useState } from "react";
import type { Profile } from "../types";

interface ProfileListProps {
  profiles: Profile[];
}

const ProfileList = ({ profiles }: ProfileListProps) => {
  // Track image loading errors
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      // Convert to appropriate time units
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (diffYears > 0) {
        return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
      } else if (diffMonths > 0) {
        return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
      } else if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      } else if (diffMins > 0) {
        return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
      } else {
        return `${diffSecs} ${diffSecs === 1 ? "second" : "seconds"} ago`;
      }
    } catch {
      return "Invalid date";
    }
  };

  const handleImageError = (username: string) => {
    setImageErrors(prev => ({...prev, [username]: true}));
  };

  return (
    <div className="profiles-list">
      {profiles.map((profile) => (
        <div
          key={profile.id || profile.instagram_id || profile.username}
          className="profile-list-item"
        >
          <div className="profile-list-avatar">
            {profile.profile_pic_url && !imageErrors[profile.username || ''] ? (
              <img
                src={profile.profile_pic_url}
                alt={profile.username || "Profile"}
                className="avatar-image"
                onError={() => profile.username && handleImageError(profile.username)}
              />
            ) : (
              <div className="avatar-placeholder">
                {(profile.username?.[0] || "?").toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-list-main">
            <div className="profile-list-header">
              <div className="profile-list-name">
                <h3 className="username">
                  {profile.username || "No username"}
                  {profile.is_verified && (
                    <span className="verified-badge" title="Verified">
                      ✓
                    </span>
                  )}
                </h3>
                <p className="fullname">{profile.full_name || ""}</p>
              </div>
              <div className="profile-list-stats">
                <span className="stat">
                  <strong>{profile.followed_by_count?.toLocaleString()}</strong>{" "}
                  followers
                </span>
                <span className="stat">
                  <strong>{profile.follow_count?.toLocaleString()}</strong>{" "}
                  following
                </span>
                <span className="stat">
                  <strong>{profile.posts_count?.toLocaleString()}</strong> posts
                </span>
                {profile.igtv_videos_count !== undefined && (
                  <span className="stat">
                    <strong>
                      {profile.igtv_videos_count.toLocaleString()}
                    </strong>{" "}
                    IGTV
                  </span>
                )}
              </div>
            </div>

            {profile.biography && (
              <p className="profile-list-bio">{profile.biography}</p>
            )}

            <div className="profile-list-details">
              {profile.category_name && (
                <span className="detail-item">
                  <strong>Category:</strong> {profile.category_name}
                </span>
              )}
              {profile.business_category_name && (
                <span className="detail-item">
                  <strong>Business:</strong> {profile.business_category_name}
                </span>
              )}
              {profile.external_url && (
                <span className="detail-item">
                  <strong>Website:</strong>{" "}
                  <a
                    href={profile.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.external_url}
                  </a>
                </span>
              )}
              {profile.business_email && (
                <span className="detail-item">
                  <strong>Email:</strong> {profile.business_email}
                </span>
              )}
            </div>

            <div className="profile-list-footer">
              <div className="profile-badges">
                {profile.is_business_account && (
                  <span className="badge">Business</span>
                )}
                {profile.is_professional_account && (
                  <span className="badge">Professional</span>
                )}
                {profile.is_private && (
                  <span className="badge badge-warning">Private</span>
                )}
              </div>
              <span className="update-time">
                Last updated: {formatDate(profile.update_time)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileList;