import { useEffect, useRef } from "react";
import type { Profile } from "../types";

interface ProfileDetailModalProps {
  profile: Profile | null;
  onClose: () => void;
}

const ProfileDetailModal = ({ profile, onClose }: ProfileDetailModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!profile) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
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
  const formatFieldValue = (key: string, value: string | number | boolean | null | undefined | string[] | Record<string, unknown>) => {
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
      return <pre className="json-data">{JSON.stringify(value, null, 2)}</pre>;
    }

    return String(value);
  };


  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="profile-avatar">
              <div className="avatar-placeholder large">
                {(profile.username?.[0] || "?").toUpperCase()}
              </div>
            </div>
            <div className="profile-title">
              <h2 className="profile-username">
                {profile.username || "No username"}
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
                  ([key, value]) =>
                    // Filter out null/undefined values and profile picture URL
                    value !== null &&
                    value !== undefined &&
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
