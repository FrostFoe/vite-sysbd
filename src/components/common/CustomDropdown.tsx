import { ChevronDown } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={`custom-dropdown-wrapper ${className}`}
      id={id}
    >
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`custom-dropdown-button ${isOpen ? "open" : ""} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className={`${!value ? "custom-dropdown-item placeholder" : ""}`}>
          {displayLabel}
        </span>
        <ChevronDown className="custom-dropdown-icon" />
      </button>

      {/* Dropdown Menu */}
      <div className={`custom-dropdown-menu ${isOpen ? "open" : ""}`}>
        {options.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-text">
            No options available
          </div>
        ) : (
          options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`custom-dropdown-item w-full text-left ${
                value === option.value ? "selected" : ""
              }`}
            >
              {option.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
