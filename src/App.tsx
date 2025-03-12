import { useState, useEffect } from "react";
import FilterPanel from "./components/FilterPanel";
import ProfileList from "./components/ProfileList";
import type {
  Filter,
  FilterOption,
  Profile,
  FilterRequest,
  HTTPValidationError,
} from "./types";

// API base URL with proxy for development
const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://spark-scraper-api.sparkonomy.com";

function App() {
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState<number>(100);
  const [offset, setOffset] = useState<number>(0);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/filters`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFilterOptions(data.filters);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch filter options"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestBody: FilterRequest = {
        filters: filters.map((filter) => {
          if (
            filter.field === "create_time" ||
            filter.field === "update_time"
          ) {
            return {
              ...filter,
              value: new Date(filter.value as string).toISOString(),
            };
          }
          return filter;
        }),
        sort_by: sortBy || undefined,
        sort_order: sortOrder,
        limit,
        offset,
      };

      const response = await fetch(`${API_BASE_URL}/profiles/filter`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: HTTPValidationError = await response.json();
        throw new Error(
          errorData.detail?.[0]?.msg || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Handle different response formats
      const profilesData = Array.isArray(data)
        ? data
        : data.results || data.profiles || [];

      // Process profiles without hardcoding specific fields
      // Each profile keeps its original structure, only guaranteeing an ID for React keys
      const normalizedProfiles = profilesData.map((profile: Profile) => {
        const id =
          profile.id ||
          profile.instagram_id ||
          profile.username ||
          Math.random().toString(36);

        return {
          ...profile,
          id,
        };
      });

      // If loading more, append to existing profiles
      setProfiles((prev) =>
        offset > 0 ? [...prev, ...normalizedProfiles] : normalizedProfiles
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profiles");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilter = (filter: Filter) => {
    // Check if a filter with the same field already exists
    const existingFilterIndex = filters.findIndex(
      (f) => f.field === filter.field
    );

    if (existingFilterIndex !== -1) {
      // Replace the existing filter instead of adding a new one
      const updatedFilters = [...filters];
      updatedFilters[existingFilterIndex] = filter;
      setFilters(updatedFilters);
    } else {
      // Add the new filter
      setFilters([...filters, filter]);
    }
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    setFilters(updatedFilters);
  };

  const handleSearch = () => {
    setOffset(0); // Reset offset when performing new search
    fetchProfiles();
  };

  const handleClearFilters = () => {
    setFilters([]);
    setProfiles([]);
    setSortBy("");
    setSortOrder("asc");
    setOffset(0);
  };

  const handleLoadMore = () => {
    if (profiles.length >= limit) {
      setOffset(offset + limit);
      fetchProfiles();
    }
  };

  const handleExportCSV = () => {
    if (profiles.length === 0) return;

    // Get all unique keys from profiles
    const keys = Array.from(
      new Set(profiles.flatMap((profile) => Object.keys(profile)))
    );

    // Create CSV header row
    const header = keys.join(",");

    // Create CSV rows for each profile
    const rows = profiles.map((profile) => {
      return keys
        .map((key) => {
          const value = profile[key as keyof Profile];
          if (value === null || value === undefined) return "";
          if (typeof value === "object")
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
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
    link.setAttribute("download", "profiles.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportOptions(false);
  };

  const handleExportJSON = () => {
    if (profiles.length === 0) return;

    const json = JSON.stringify(profiles, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "profiles.json");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportOptions(false);
  };

  return (
    <div className="container">
      <h1 className="title">Profile Filter</h1>

      {error && <div className="error-message">{error}</div>}

      <FilterPanel
        filterOptions={filterOptions}
        filters={filters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      <div className="sort-controls">
        <div className="sort-controls-header">
          <div className="sort-controls-title">Sort & Pagination Options</div>
          <div className="filters-actions">
            {profiles.length > 0 && (
              <div className="dropdown">
                <button
                  type="button"
                  className="button button-outline button-sm"
                  onClick={() => setShowExportOptions(!showExportOptions)}
                >
                  Export
                </button>
                {showExportOptions && (
                  <div className="dropdown-menu">
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handleExportCSV}
                    >
                      Export as CSV
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={handleExportJSON}
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="sort-by">
            Sort By
          </label>
          <select
            id="sort-by"
            className="filter-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
            }}
          >
            <option value="">None</option>
            {filterOptions.map((option) => (
              <option key={option.field} value={option.field}>
                {option.field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="sort-order">
            Sort Order
          </label>
          <select
            id="sort-order"
            className="filter-select"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="results-per-page">
            Results Per Page
          </label>
          <input
            id="results-per-page"
            type="number"
            className="filter-input"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
            }}
            min={1}
            max={1000}
          />
        </div>
      </div>

      {loading && profiles.length === 0 ? (
        <div className="results-container">
          <div className="results-header">
            <h3 className="results-title">Results</h3>
          </div>
          <div className="results-message">
            <div className="loading-spinner"></div>
            Loading profiles...
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="results-container">
          <div className="results-header">
            <h3 className="results-title">Results</h3>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">📷</div>
            <h4 className="empty-state-title">No profiles found</h4>
            <p className="empty-state-description">
              Try adjusting your filters or search criteria to find what you're
              looking for.
            </p>
          </div>
        </div>
      ) : (
        <div className="results-container">
          <div className="results-header">
            <h3 className="results-title">Results</h3>
            <span className="results-count">
              {profiles.length} profiles found
            </span>
          </div>
          <ProfileList profiles={profiles} />
          {loading && (
            <div className="loading-more">
              <div className="loading-spinner"></div>
              Loading more...
            </div>
          )}
          {!loading && profiles.length >= limit && (
            <div className="actions-bar">
              <button
                type="button"
                className="button button-outline"
                onClick={handleLoadMore}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
