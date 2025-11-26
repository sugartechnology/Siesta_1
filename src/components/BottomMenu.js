import "./BottomMenu.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import homeIcon from "../assets/home_icon.svg";
import collectionsIcon from "../assets/collections_icon.svg";
import projectsIcon from "../assets/projects_icon.svg";

const BottomMenu = () => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const auth = useAuth();
  const handleLogout = () => {
    setProfileOpen(false);
    auth.logout();
  };
  return (
    <div className="bottom-menu">
      <div className="bm-menu-section">
        <nav className="bm-nav-links">
          <span
            className="bm-nav-link"
            onClick={() => {
              navigate("/home");
            }}
          >
            <img src={homeIcon} alt="Home" />
            Home
          </span>
          <span
            className="bm-nav-link"
            onClick={() => {
              navigate("/collections");
            }}
          >
            <img src={collectionsIcon} alt="Collections" />
            Collections
          </span>
          <span
            className="bm-nav-link"
            onClick={() => {
              navigate("/projects");
            }}
          >
            <img src={projectsIcon} alt="Projects" />
            Projects
          </span>
        </nav>
      </div>
    </div>
  );
};

export default BottomMenu;
