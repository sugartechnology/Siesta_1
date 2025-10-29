import React from "react";

const LoadingSpinner = ({
  size = 64,
  color = "#000",
  strokeWidth = 4,
  duration = "1s",
  style,
}) => {
  const radius = 20;
  const dashArray = 90;
  const dashOffset = 150;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      role="img"
      aria-label="Yükleniyor"
      style={style}
    >
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dashArray} ${dashOffset}`}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur={duration}
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default LoadingSpinner;
