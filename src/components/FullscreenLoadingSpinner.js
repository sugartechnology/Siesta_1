import LoadingSpinner from "./LoadingSpinner";
import "./FullscreenLoadingSpinner.css";

export const FullscreenLoadingSpinner = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fullscreen-loading-spinner-container">
      <LoadingSpinner />
    </div>
  );
};
