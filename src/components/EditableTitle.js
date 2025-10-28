import React, { useState, useEffect, useRef } from "react";
import "./EditableTitle.css";

const EditableTitle = ({
  value,
  onChange,
  placeholder = "Click to edit",
  className = "",
  inputClassName = "",
  spanClassName = "",
  autoFocus = false,
  onBlur,
  onKeyPress,
  style = {},
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value || "");
  };

  const handleChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onChange) {
      onChange(editValue);
    }
    if (onBlur) {
      onBlur(editValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (onChange) {
        onChange(editValue);
      }
    }
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  return (
    <div className={`editable-title-container ${className}`} style={style}>
      {isEditing ? (
        <input
          ref={inputRef}
          id="editable-title-input"
          type="text"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`editable-title-input ${inputClassName || className}`}
        />
      ) : (
        <div
          className={`editable-title-span ${spanClassName}`}
          onClick={handleClick}
        >
          {value || placeholder}
        </div>
      )}
    </div>
  );
};

export default EditableTitle;
