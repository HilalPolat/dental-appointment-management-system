import React from "react";
import {
  FaHome,
  FaList,
  FaUsers,
  FaStar,
  FaChartPie,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../assets/css/layout.css";
import "../../assets/css/sidebar.css";

const AdminSidebar = ({
  activePage,
  onSelect = () => {},
  menuOpen = false,
}) => {
  const navigate = useNavigate();

  const handleSelect = (page) => {
    onSelect(page);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  return (
    <div className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <img className="" src="/assets/logo/logo.png" alt="logo" />
      </div>

      <ul className="sidebar-menu">
        {/* Ana Sayfa */}
        <li
          className={`my-2 ${activePage === "home" ? "sidebar-item-active" : ""}`}
          onClick={() => handleSelect("home")}
        >
          <FaHome /> <span>Genel Bakış</span>
        </li>

        {/* Randevu Listesi */}
        <li
          className={`my-2 ${
            activePage === "appointments" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("appointments")}
        >
          <FaList /> <span>Randevu Listesi</span>
        </li>

        {/* Hasta Listesi */}
        <li
          className={`my-2 ${
            activePage === "patients" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("patients")}
        >
          <FaUsers /> <span>Hasta Listesi</span>
        </li>

        {/* En Aktif Hastalar */}
        <li
          className={`my-2 ${
            activePage === "activePatients" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("activePatients")}
        >
          <FaStar /> <span>En Aktif Hastalar</span>
        </li>

        {/* İlçe Dağılımı */}
        <li
          className={`my-2 ${
            activePage === "districts" ? "sidebar-item-active" : ""
          }`}
          onClick={() => handleSelect("districts")}
        >
          <FaChartPie /> <span>İlçe Dağılımı</span>
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

export default AdminSidebar;
