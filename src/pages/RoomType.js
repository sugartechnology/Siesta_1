import React from "react";
import { useNavigate } from "react-router-dom";
import { getNextPage, roomTypes } from "../utils/NavigationState";
import "./RoomType.css";

const RoomType = () => {
  const navigate = useNavigate();

  const handleRoomTypeClick = (roomType) => {
    // Navigate to products page with selected room type
    const nextPage = getNextPage("room-type", { roomType: roomType });
    navigate(nextPage);
  };

  const handleNext = () => {
    const nextPage = getNextPage("room-type", { roomType: null });
    navigate(nextPage);
  };

  return (
    <div className="room-type-content-wrapper">
      {/* Room Types Grid */}
      <div className="room-types-grid">
        {roomTypes.map((roomType) => (
          <div
            key={roomType.id}
            className="room-type-card"
            onClick={() => handleRoomTypeClick(roomType)}
          >
            <div className="room-image-container">
              <img
                src={roomType.image}
                alt={roomType.name}
                className="room-image"
              />
              <div className="room-image-overlay"></div>
            </div>
            <div className="room-name-vertical">{roomType.name}</div>
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button className="next-button-bottom" onClick={handleNext}>
        Next
      </button>
    </div>
  );
};

export default RoomType;
