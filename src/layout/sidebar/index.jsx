import React from "react";
import {
  FaHome,
  FaCalendarAlt,
  FaClock,
  FaList,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../assets/css/layout.css";
import "../../assets/css/sidebar.css";

const Sidebar = ({ activePage, onSelect = () => {}, menuOpen = false }) => {
  const navigate = useNavigate();

  const handleSelect = (page) => {
    onSelect(page);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <img className="" src="/assets/logo/logo.png" alt="logo" />
      </div>

      <ul className="sidebar-menu">
        <li
          className={`my-2 ${
            activePage === "home" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("home")}
        >
          <FaHome /> <span>Ana Sayfa</span>
        </li>

        <li
          className={`my-2 ${
            activePage === "appointment" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("appointment")}
        >
          <FaCalendarAlt /> <span>Randevu Al</span>
        </li>

        <li
          className={`my-2 ${
            activePage === "upcoming" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("upcoming")}
        >
          <FaClock /> <span>Yaklaşan Randevu</span>
        </li>

        <li
          className={`my-2 ${
            activePage === "history" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("history")}
        >
          <FaList /> <span>Randevu Geçmişi</span>
        </li>

        <li
          className={`my-2 ${
            activePage === "profile" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("profile")}
        >
          <FaUser /> <span>Profil Bilgilerim</span>
        </li>
      </ul>

      <div className="sidebar-footer mb-4">
        <button type="button" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
