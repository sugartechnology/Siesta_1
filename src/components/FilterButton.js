import React, { useState, useRef, useEffect } from "react";
import "./FilterButton.css";

const FilterButton = ({
  label,
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = "Select options...",
  multiple = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  // Handle option selection
  const handleOptionClick = (option) => {
    if (multiple) {
      const newSelection = selectedValues.includes(option.value)
        ? selectedValues.filter((val) => val !== option.value)
        : [...selectedValues, option.value];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([option.value]);
      setIsOpen(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedValues.length === filteredOptions.length) {
      onSelectionChange([]);
    } else {
      const allValues = filteredOptions.map((option) => option.value);
      onSelectionChange(allValues);
    }
  };

  // Get display text
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    }

    if (selectedValues.length === 1) {
      const selectedOption = options.find(
        (opt) => opt.value === selectedValues[0]
      );
      return selectedOption ? selectedOption.label : placeholder;
    }

    return `${selectedValues.length} selected`;
  };

  // Check if option is selected
  const isSelected = (value) => selectedValues.includes(value);

  return (
    <div
      className={`fb-filter-button-container ${className}`}
      ref={dropdownRef}
    >
      <button
        className={`fb-filter-btn ${isOpen ? "active" : ""} ${
          selectedValues.length > 0 ? "has-selection" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="fb-filter-btn-text">
          {label ? label : getDisplayText()}
        </span>
        <svg
          width="7"
          height="12"
          viewBox="0 0 7 12"
          fill="none"
          className={`fb-filter-btn-arrow ${isOpen ? "rotated" : ""}`}
        >
          <path
            d="M1 1L6 6L1 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fb-filter-dropdown">
          {/* Search input */}
          {options.length > 5 && (
            <div className="fb-filter-search">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="fb-filter-search-input"
              />
            </div>
          )}

          {/* Select All option 
          {multiple && filteredOptions.length > 1 && (
            <div className="fb-filter-option select-all">
              <button className="fb-filter-option-btn" onClick={handleSelectAll}>
                {selectedValues.length === filteredOptions.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          )}*/}

          {/* Options list */}
          <div className="fb-filter-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`fb-filter-option ${
                    isSelected(option.value) ? "selected" : ""
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="fb-filter-option-content">
                    <span className="fb-filter-option-label">
                      {option.label}
                    </span>
                    {/*isSelected(option.value) && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13.5 4.5L6 12L2.5 8.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )*/}
                  </div>
                </div>
              ))
            ) : (
              <div className="fb-filter-option no-results">
                <span className="fb-filter-option-label">No options found</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
