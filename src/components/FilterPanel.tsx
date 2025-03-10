"use client";

import { useState } from "react";
import type { Filter, FilterOption } from "../types";
import FilterItem from "./FilterItem";
import { validateFilterValue, formatFilterValue } from "../utils/validation";

interface FilterPanelProps {
  filterOptions: FilterOption[];
  filters: Filter[];
  onAddFilter: (filter: Filter) => void;
  onRemoveFilter: (index: number) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  loading: boolean;
}

const getFilterGroup = (field: string): string => {
  if (field.includes("follow") || field.includes("count")) return "Metrics";
  if (field.includes("is_") || field.includes("has_")) return "Profile Status";
  if (field.includes("business")) return "Business Info";
  if (field.includes("time")) return "Dates";
  return "Basic Info";
};

const FilterPanel = ({
  filterOptions,
  filters,
  onAddFilter,
  onRemoveFilter,
  onSearch,
  onClearFilters,
  loading,
}: FilterPanelProps) => {
  const [newFilter, setNewFilter] = useState<Filter>({
    field: "",
    operator: "",
    value: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Group filter options by type for better organization
  const groupedOptions = filterOptions.reduce((acc, option) => {
    const group = getFilterGroup(option.field);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, FilterOption[]>);

  // Auto-select first operator when field changes
  const handleFieldChange = (field: string) => {
    const selectedOption = filterOptions.find(
      (option) => option.field === field
    );
    const defaultOperator = selectedOption?.operators?.[0] || "";

    setNewFilter({
      ...newFilter,
      field,
      operator: defaultOperator,
      value: "",
    });
    setValidationError(null);
  };

  const handleOperatorChange = (operator: string) => {
    setNewFilter({
      ...newFilter,
      operator,
      value: "",
    });
    setValidationError(null);
  };

  const handleValueChange = (
    value: string | boolean | number | Array<string | number>
  ) => {
    setNewFilter({
      ...newFilter,
      value,
    });
    setValidationError(null);
  };

  const renderValueInput = () => {
    const selectedOption = filterOptions.find(
      (option) => option.field === newFilter.field
    );
    if (!selectedOption || !newFilter.operator) return null;

    const { data_type } = selectedOption;

    switch (data_type) {
      case "boolean":
        return (
          <select
            title="Select Value"
            className="filter-input"
            value={String(newFilter.value)}
            onChange={(e) => handleValueChange(e.target.value === "true")}
          >
            <option value="">Select Value</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      case "date":
        if (newFilter.operator === "range") {
          return (
            <div className="filter-input-group">
              <input
                type="date"
                className="filter-input"
                value={String(newFilter.value).split(",")[0] || ""}
                onChange={(e) => {
                  const max = String(newFilter.value).split(",")[1] || "";
                  handleValueChange(`${e.target.value},${max}`);
                }}
                placeholder="Start date"
              />
              <input
                type="date"
                className="filter-input"
                value={String(newFilter.value).split(",")[1] || ""}
                onChange={(e) => {
                  const min = String(newFilter.value).split(",")[0] || "";
                  handleValueChange(`${min},${e.target.value}`);
                }}
                placeholder="End date"
              />
            </div>
          );
        }
        return (
          <input
            title="Enter Date"
            type="date"
            className="filter-input"
            value={String(newFilter.value)}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case "number":
        if (newFilter.operator === "range") {
          return (
            <div className="filter-input-group">
              <input
                type="number"
                className="filter-input"
                value={String(newFilter.value).split(",")[0] || ""}
                onChange={(e) => {
                  const max = String(newFilter.value).split(",")[1] || "";
                  handleValueChange(`${e.target.value},${max}`);
                }}
                placeholder="Min value"
              />
              <input
                type="number"
                className="filter-input"
                value={String(newFilter.value).split(",")[1] || ""}
                onChange={(e) => {
                  const min = String(newFilter.value).split(",")[0] || "";
                  handleValueChange(`${min},${e.target.value}`);
                }}
                placeholder="Max value"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            className="filter-input"
            value={String(newFilter.value)}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            placeholder="Enter number"
          />
        );

      case "array":
        return (
          <input
            type="text"
            className="filter-input"
            value={String(newFilter.value)}
            onChange={(e) =>
              handleValueChange(e.target.value.split(",").map((v) => v.trim()))
            }
            placeholder="Enter comma-separated values"
          />
        );

      default:
        return (
          <input
            type="text"
            className="filter-input"
            value={String(newFilter.value)}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter value"
          />
        );
    }
  };

  const handleAddFilter = () => {
    const selectedOption = filterOptions.find(
      (option) => option.field === newFilter.field
    );

    if (!selectedOption) {
      setValidationError("Please select a field");
      return;
    }

    if (!newFilter.operator) {
      setValidationError("Please select an operator");
      return;
    }

    if (
      !newFilter.value &&
      newFilter.value !== false &&
      newFilter.value !== 0
    ) {
      setValidationError("Please enter a value");
      return;
    }

    const validationResult = validateFilterValue(
      newFilter.value,
      selectedOption.data_type,
      newFilter.operator
    );

    if (!validationResult.valid) {
      setValidationError(validationResult.message);
      return;
    }

    onAddFilter({
      ...newFilter,
      value: formatFilterValue(newFilter.value, selectedOption.data_type),
    });

    setNewFilter({
      field: "",
      operator: "",
      value: "",
    });
  };

  return (
    <div className="filters">
      <h2 className="filters-title">Build Your Filters</h2>

      <div className="filter-builder">
        <div className="filter-field">
          <label className="filter-label" htmlFor="filter-field">
            Field
          </label>
          <select
            id="filter-field"
            className="filter-select"
            value={newFilter.field}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            <option value="">Select Field</option>
            {Object.entries(groupedOptions).map(([group, options]) => (
              <optgroup key={group} label={group}>
                {options.map((option) => (
                  <option key={option.field} value={option.field}>
                    {option.field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {newFilter.field && (
          <div className="filter-operator">
            <label className="filter-label" htmlFor="filter-operator">
              Operator
            </label>
            <select
              id="filter-operator"
              className="filter-select"
              value={newFilter.operator}
              onChange={(e) => handleOperatorChange(e.target.value)}
            >
              <option value="">Select Operator</option>
              {filterOptions
                .find((option) => option.field === newFilter.field)
                ?.operators.map((op) => (
                  <option key={op} value={op}>
                    {op
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
            </select>
          </div>
        )}

        {newFilter.field && newFilter.operator && (
          <div className="filter-value">
            <label className="filter-label">Value</label>
            {renderValueInput()}
          </div>
        )}

        <div className="filter-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={handleAddFilter}
            disabled={
              !newFilter.field ||
              !newFilter.operator ||
              (!newFilter.value &&
                newFilter.value !== false &&
                newFilter.value !== 0)
            }
          >
            Add Filter
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={onSearch}
            disabled={loading}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {validationError && (
        <div className="error-message">{validationError}</div>
      )}

      {filters.length > 0 && (
        <div className="active-filters">
          <div className="filters-header">
            <div className="subtitle">Active Filters</div>
            <button
              type="button"
              className="button button-text"
              onClick={onClearFilters}
              disabled={loading}
            >
              Clear All
            </button>
          </div>
          <div className="filter-tags">
            {filters.map((filter, index) => (
              <FilterItem
                key={index}
                filter={filter}
                onRemove={() => onRemoveFilter(index)}
                filterOptions={filterOptions}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
