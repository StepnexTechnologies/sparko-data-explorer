import { useState } from "react";
import type { Profile } from "../types";
import ProfileDetailModal from "./ProfileDetailModal";

interface ProfileListProps {
  profiles: Profile[];
}

const ProfileList = ({ profiles }: ProfileListProps) => {
  // Track selected profile for modal
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
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

  const handleImageError = (profileId: string) => {
    console.log(`Image loading error for profile: ${profileId}`);
    setImageErrors((prev) => ({ ...prev, [profileId]: true }));
  };

  // Get profile unique identifier for tracking image errors
  const getProfileId = (profile: Profile): string => {
    return (
      profile.id ||
      profile.instagram_id ||
      profile.username ||
      Math.random().toString(36)
    );
  };

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  const closeModal = () => {
    setSelectedProfile(null);
  };

  // Safely access profile properties with null/undefined checks
  const safeGetValue = <T,>(
    value: T | null | undefined,
    defaultValue: T
  ): T => {
    return value !== null && value !== undefined ? value : defaultValue;
  };

  // Function to get the image URL exactly as specified
  const getProfileImageUrl = (username: string | undefined) => {
    if (!username) return null;

    // Construct the URL exactly as specified with the username and .jpg extension
    return `https://sparkonomy.blr1.digitaloceanspaces.com/instagram_profile_pictures/${username}.jpg`;
  };

  // Dynamically get key details to display on the card
  const getDisplayDetails = (profile: Profile) => {
    const details = [];

    // Add category info if available
    if (profile.category_name) {
      details.push({ label: "Category", value: profile.category_name });
    } else if (profile.business_category_name) {
      details.push({
        label: "Business",
        value: profile.business_category_name,
      });
    }

    // Add website if available
    if (profile.external_url) {
      details.push({
        label: "Website",
        value: profile.external_url,
        isLink: true,
      });
    }

    // Add email if available
    if (profile.business_email) {
      details.push({ label: "Email", value: profile.business_email });
    }

    return details;
  };

  // Dynamically get badges based on profile properties
  const getProfileBadges = (profile: Profile) => {
    const badges = [];

    if (profile.is_business_account) {
      badges.push({ text: "Business", type: "default" });
    }

    if (profile.is_professional_account) {
      badges.push({ text: "Professional", type: "default" });
    }

    if (profile.is_private) {
      badges.push({ text: "Private", type: "warning" });
    }

    return badges;
  };

  return (
    <>
      <div className="profiles-list">
        {profiles.map((profile) => {
          const profileId = getProfileId(profile);
          const details = getDisplayDetails(profile);
          const badges = getProfileBadges(profile);
          const imageUrl = getProfileImageUrl(profile.username);

          return (
            <div
              key={profileId}
              className="profile-list-item"
              onClick={() => handleProfileClick(profile)}
            >
              <div className="profile-list-avatar">
                {imageUrl && !imageErrors[profileId] ? (
                  <img
                    src={imageUrl}
                    alt={safeGetValue(profile.username, "Profile")}
                    className="avatar-image"
                    onError={() => handleImageError(profileId)}
                    loading="lazy"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(
                      safeGetValue(profile.username, "?")[0] || "?"
                    ).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="profile-list-main">
                <div className="profile-list-header">
                  <div className="profile-list-name">
                    <h3 className="username">
                      {safeGetValue(profile.username, "No username")}
                      {profile.is_verified && (
                        <span className="verified-badge" title="Verified">
                          ✓
                        </span>
                      )}
                    </h3>
                    <p className="fullname">
                      {safeGetValue(profile.full_name, "")}
                    </p>
                  </div>
                  <div className="profile-list-stats">
                    {profile.followed_by_count !== undefined &&
                      profile.followed_by_count !== null && (
                        <span className="stat">
                          <strong>
                            {profile.followed_by_count.toLocaleString()}
                          </strong>{" "}
                          followers
                        </span>
                      )}
                    {profile.follow_count !== undefined &&
                      profile.follow_count !== null && (
                        <span className="stat">
                          <strong>
                            {profile.follow_count.toLocaleString()}
                          </strong>{" "}
                          following
                        </span>
                      )}
                    {profile.posts_count !== undefined &&
                      profile.posts_count !== null && (
                        <span className="stat">
                          <strong>
                            {profile.posts_count.toLocaleString()}
                          </strong>{" "}
                          posts
                        </span>
                      )}
                    {profile.igtv_videos_count !== undefined &&
                      profile.igtv_videos_count !== null && (
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

                {details.length > 0 && (
                  <div className="profile-list-details">
                    {details.map((detail, index) => (
                      <span key={index} className="detail-item">
                        <strong>{detail.label}:</strong>{" "}
                        {detail.isLink ? (
                          <a
                            href={detail.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} // Prevent triggering profile click
                          >
                            {detail.value}
                          </a>
                        ) : (
                          detail.value
                        )}
                      </span>
                    ))}
                  </div>
                )}

                <div className="profile-list-footer">
                  {badges.length > 0 && (
                    <div className="profile-badges">
                      {badges.map((badge, index) => (
                        <span
                          key={index}
                          className={`badge ${
                            badge.type === "warning" ? "badge-warning" : ""
                          }`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  )}
                  {profile.update_time && (
                    <span className="update-time">
                      Last updated: {formatDate(profile.update_time)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProfile && (
        <ProfileDetailModal profile={selectedProfile} onClose={closeModal} />
      )}
    </>
  );
};

export default ProfileList;
