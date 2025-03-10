export const validateFilterValue = (
  value: string | boolean | number | Array<string | number>,
  dataType: string,
  operator: string,
): { valid: boolean; message: string } => {
  if (value === undefined || value === null || value === "") {
    return { valid: false, message: "Value cannot be empty" }
  }

  switch (dataType) {
    case "number":
      if (operator === "range") {
        const [min, max] = String(value).split(",")

        if (!min || !max) {
          return { valid: false, message: "Both minimum and maximum values are required for range" }
        }

        if (isNaN(Number(min)) || isNaN(Number(max))) {
          return { valid: false, message: "Range values must be numbers" }
        }

        if (Number(min) > Number(max)) {
          return { valid: false, message: "Minimum value cannot be greater than maximum value" }
        }
      } else if (isNaN(Number(value))) {
        return { valid: false, message: "Value must be a number" }
      }
      break

    case "boolean":
      if (String(value) !== "true" && String(value) !== "false") {
        return { valid: false, message: "Value must be true or false" }
      }
      break

    case "array":
      if (!Array.isArray(value) && typeof value !== "string") {
        return { valid: false, message: "Value must be an array or comma-separated string" }
      }
      break

    case "json":
      if (operator === "contains_key" || operator === "contains_value") {
        if (typeof value !== "string") {
          return { valid: false, message: "Value must be a string" }
        }
      } else {
        try {
          JSON.parse(String(value))
        } catch {
          return { valid: false, message: "Value must be valid JSON" }
        }
      }
      break

    case "date":
      if (operator === "range") {
        const [start, end] = String(value).split(",")
        if (!start || !end) {
          return { valid: false, message: "Both start and end dates are required for range" }
        }

        const startDate = new Date(start)
        const endDate = new Date(end)

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return { valid: false, message: "Invalid date format" }
        }

        if (startDate > endDate) {
          return { valid: false, message: "Start date cannot be after end date" }
        }
      } else {
        const date = new Date(String(value))
        if (isNaN(date.getTime())) {
          return { valid: false, message: "Invalid date format" }
        }
      }
      break
  }

  return { valid: true, message: "" }
}

export const formatFilterValue = (
  value: string | boolean | number | Array<string | number>,
  type: string,
): string | boolean | number | Array<string | number> => {
  switch (type) {
    case "number":
      return Number(value)
    case "boolean":
      return value === "true"
    case "array":
      return typeof value === "string" ? value.split(",").map((v) => v.trim()) : value
    default:
      return value
  }
}

