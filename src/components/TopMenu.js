import "./TopMenu.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";

const TopMenu = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const auth = useAuth();
  const handleLogout = () => {
    setProfileOpen(false);
    auth.logout();
  };
  return (
    <div className="top-menu">
      <div className="menu-section">
        <div
          className="back-icon"
          onClick={() => navigate(-1)}
          style={{ cursor: "pointer" }}
        >
          <img src="/assets/back-icon.svg" alt="Back" />
        </div>
        <nav className="nav-links">
          <span
            className="nav-link"
            onClick={() => {
              navigate("/home");
            }}
          >
            Home
          </span>
          <span
            className="nav-link"
            onClick={() => {
              navigate("/collections");
            }}
          >
            Collections
          </span>
          <span
            className="nav-link"
            onClick={() => {
              navigate("/projects");
            }}
          >
            Projects
          </span>
        </nav>
      </div>

      <div className="logo-section">
        <div className="logo">
          <img src="/assets/logo.png" alt="Siesta Exclusive" />
        </div>
      </div>

      <div className="menu-actions">
        <div
          className="profile-icon"
          style={{ position: "relative" }}
          onClick={() => setProfileOpen((o) => !o)}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 23C2 21.4087 2.61458 19.8826 3.70854 18.7573C4.8025 17.6321 6.28622 17 7.83331 17H19.4999C21.047 17 22.5308 17.6321 23.6247 18.7573C24.7187 19.8826 25.3333 21.4087 25.3333 23C25.3333 23.7956 25.026 24.5587 24.479 25.1213C23.932 25.6839 23.1901 25.9999 22.4166 25.9999H4.91666C4.14311 25.9999 3.40125 25.6839 2.85427 25.1213C2.30729 24.5587 2 23.7956 2 23Z"
              stroke="black"
              /*stroke-width="1.5"
              stroke-linejoin="round"*/
            />
            <path
              d="M13.6665 10.9999C16.0827 10.9999 18.0415 8.98524 18.0415 6.49997C18.0415 4.01471 16.0827 2 13.6665 2C11.2503 2 9.2915 4.01471 9.2915 6.49997C9.2915 8.98524 11.2503 10.9999 13.6665 10.9999Z"
              stroke="black"
              /* stroke-width="1.5"*/
            />
          </svg>
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                top: "36px",
                right: 0,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 0",
                zIndex: 1000,
                minWidth: "140px",
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
