import { useEffect, useRef, useState } from "react";
import type { Profile } from "../types";

interface ProfileDetailModalProps {
  profile: Profile | null;
  onClose: () => void;
}

const ProfileDetailModal = ({ profile, onClose }: ProfileDetailModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

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
    console.log("Profile modal image failed to load");
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
          {/* All profile fields in a simple list */}
          <div className="profile-all-fields-section">
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
