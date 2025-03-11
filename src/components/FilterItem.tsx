import type { Filter, FilterOption } from "../types";

interface FilterItemProps {
  filter: Filter;
  onRemove: () => void;
  filterOptions: FilterOption[];
}

const FilterItem = ({ filter, onRemove, filterOptions }: FilterItemProps) => {
  const getFieldLabel = (field: string) => {
    // Convert snake_case to Title Case dynamically
    return field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatValue = (
    value: string | boolean | number | Array<string | number>,
    type: string,
    operator: string
  ) => {
    if (type === "boolean") {
      return value === true || value === "true" ? "Yes" : "No";
    }

    if (operator === "range") {
      const [min, max] = String(value).split(",");
      return `${min} to ${max}`;
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value);
  };

  const getFieldType = (field: string) => {
    const option = filterOptions.find((opt) => opt.field === field);
    return option?.data_type || "string";
  };

  return (
    <div className="filter-tag">
      <span className="filter-tag-field">{getFieldLabel(filter.field)}</span>
      <span className="filter-tag-operator">
        {filter.operator.replace(/_/g, " ")}
      </span>
      <span className="filter-tag-value">
        {formatValue(filter.value, getFieldType(filter.field), filter.operator)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="filter-tag-remove"
        aria-label="Remove filter"
      >
        ×
      </button>
    </div>
  );
};

export default FilterItem;
