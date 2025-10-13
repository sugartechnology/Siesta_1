import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomType.css';

const RoomType = () => {
  const navigate = useNavigate();

  const imgLogo = "http://localhost:3845/assets/56b68463c1acec5ac9da8e728326a8fb6cf8482d.png";
  const imgImage6 = "http://localhost:3845/assets/4a1241dee68c38aadf7a8a66e00f48c6edd7dfb5.png";
  const imgImage7 = "http://localhost:3845/assets/2302229e67e98da47e7e37f184790783b60e2ffc.png";
  const imgImage8 = "http://localhost:3845/assets/99e7166d77352fcc0ba070de30b202997c8d2143.png";

  const roomTypes = [
    { id: 1, name: 'Balcony', image: imgImage8 },
    { id: 2, name: 'Garden', image: imgImage7 },
    { id: 3, name: 'Cafe', image: imgImage7 },
    { id: 4, name: 'Pool', image: imgImage6 },
    { id: 5, name: 'Gazebo', image: imgImage8 },
    { id: 6, name: 'Rattan', image: imgImage7 },
    { id: 7, name: 'Piknik', image: imgImage7 },
    { id: 8, name: 'Restaurant', image: imgImage6 },
  ];

  const handleRoomTypeClick = (roomType) => {
    console.log('Room type selected:', roomType);
    // Navigate to products page with selected room type
    navigate('/products', { state: { roomType: roomType.name } });
  };

  const handleNext = () => {
    navigate('/products');
  };

  return (
    <div className="room-type-container">
      <div className="room-type-content-wrapper">
        {/* Top Menu */}
        <div className="room-type-top-menu">
          <div className="menu-left">
            <div className="back-icon" onClick={() => navigate('/home')}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 24L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="menu-item" onClick={() => navigate('/home')}>Home</span>
            <span className="menu-item" onClick={() => navigate('/catalog')}>Collections</span>
            <span className="menu-item" onClick={() => navigate('/projects')}>Projects</span>
          </div>
          <div className="menu-center">
            <img src={imgLogo} alt="Siesta" className="logo" />
          </div>
          <div className="menu-right">
            <div className="profile-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M23.3333 24.5V22.1667C23.3333 20.9906 22.8609 19.862 22.0103 19.0114C21.1597 18.1609 20.0311 17.6875 18.8542 17.6875H9.14583C7.96875 17.6875 6.8401 18.1609 5.9895 19.0114C5.13891 19.862 4.66667 20.9906 4.66667 22.1667V24.5" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 14C16.5773 14 18.6667 11.9106 18.6667 9.33333C18.6667 6.75609 16.5773 4.66667 14 4.66667C11.4228 4.66667 9.33333 6.75609 9.33333 9.33333C9.33333 11.9106 11.4228 14 14 14Z" stroke="black" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Room Types Grid */}
        <div className="room-types-grid">
          {roomTypes.map((roomType) => (
            <div
              key={roomType.id}
              className="room-type-card"
              onClick={() => handleRoomTypeClick(roomType)}
            >
              <div className="room-image-container">
                <img src={roomType.image} alt={roomType.name} className="room-image" />
                <div className="room-image-overlay"></div>
              </div>
              <div className="room-name-vertical">
                {roomType.name}
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button className="next-button-bottom" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default RoomType;
