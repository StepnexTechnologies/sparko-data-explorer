"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      const firstOption = document.querySelector(
        ".select-option"
      ) as HTMLElement;
      if (firstOption) firstOption.focus();
    }
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent,
    optionValue: string,
    index: number
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(optionValue);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextOption = document.querySelectorAll(".select-option")[
        index + 1
      ] as HTMLElement;
      if (nextOption) nextOption.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        if (inputRef.current) inputRef.current.focus();
      } else {
        const prevOption = document.querySelectorAll(".select-option")[
          index - 1
        ] as HTMLElement;
        if (prevOption) prevOption.focus();
      }
    }
  };

  return (
    <div className="searchable-select" ref={dropdownRef}>
      <div
        className={`select-trigger ${isOpen ? "active" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="select-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="select-arrow">▼</span>
        {value && (
          <button
            type="button"
            className="select-clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="select-dropdown">
          <div className="select-search">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="select-search-input"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="select-options" role="listbox" title="Options">
            {filteredOptions.length === 0 ? (
              <div className="select-no-results">No results found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`select-option ${
                    option.value === value ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(option.value)}
                  tabIndex={0}
                  role="option"
                  aria-selected={option.value === value ? "true" : "false"}
                  onKeyDown={(e) => handleOptionKeyDown(e, option.value, index)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
