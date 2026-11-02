import data from "../../data/lang/tr.json";
import "../../assets/css/layout.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../../assets/css/cardDetail.css";

const Header = () => {
  function toTop() {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.body.style.overflow = "scroll";
  }

  const location = useLocation();

  const [menuVisible, setMenuVisible] = useState(false);

  function toggleMenu() {
    setMenuVisible(!menuVisible);

    if (!menuVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }

  return (
    <>
      <nav className="header-list col-12 ">
        <div className="container d-flex justify-content-center position-relative header">
          <div className="col-xl-6 header_img">
            <Link onClick={toTop} to={"/"}>
              <img className="" src="/assets/logo/logo.png" alt="logo" />
            </Link>
          </div>

          <ul className="d-flex justify-content-around col-xl-6 col-sm-10 col header_links">
            <Link onClick={toTop} to={"/"}>
              <li
                style={{ paddingBottom: "15px" }}
                className={location.pathname === "/home" ? "active_link" : ""}
              >
                {data["header-1"]}
              </li>
            </Link>
            {/* SERVICES - dropdown versiyonu */}
            <li
              className={`dropdown-link ${
                location.pathname === "/services" ? "active_link" : ""
              }`}
            >
              <Link onClick={toTop} to="/services">
                {data["header-2"]}
              </Link>

              <ul className="dropdown-menu">
                {[1, 2, 3, 4].map((i) => {
                  const title = data[`dropdown_${i}`];
                  if (!title) return null; // boşsa atla
                  return (
                    <li key={i}>
                      <Link
                        to={`/services/${title
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {title.charAt(0).toLowerCase() + title.slice(1)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* ABOUT */}
            <Link onClick={toTop} to={"/about"}>
              <li
                style={{ paddingBottom: "15px" }}
                className={location.pathname === "/about" ? "active_link" : ""}
              >
                {data["header-3"]}
              </li>
            </Link>

            {/* CONTACT */}
            <Link onClick={toTop} to={"/contact"}>
              <li
                style={{ paddingBottom: "15px" }}
                className={
                  location.pathname === "/contact" ? "active_link" : ""
                }
              >
                {data["header-4"]}
              </li>
            </Link>

            {/* SIGN IN */}
            <Link onClick={toTop} to={"/login"}>
              <li
                className={
                  location.pathname === "/login" ? "active_link" : ""
                }
              >
               <h3 style={{margin:'0px', 'paddingBottom':'7px'}} class="bi bi-person"></h3>
              </li>
            </Link>
          </ul>

          {/* <button  onClick={toggleMenu} className="text-light">
          </button> */}
        </div>
        <div className="menu_toggle">
          <input type="checkbox" id="checkbox" />
          <label onClick={toggleMenu} for="checkbox" class="toggle">
            <div class="bars" id="bar1"></div>
            <div class="bars" id="bar2"></div>
            <div class="bars" id="bar3"></div>
          </label>
        </div>

        {/* {menuVisible && ( */}
        <div className={`menu_phone ${menuVisible ? "menu_phone_open" : ""}`}>
          <ul className="d-flex col-xl-6 col-sm-10 col menu_toggle_phone">
            <Link onClick={toTop} to={"/home"}>
              <li
                className={location.pathname === "/home" ? "active_link" : ""}
              >
                {data["header-1"]}
              </li>
            </Link>
            <Link onClick={toTop} to={"/services"}>
              <li
                className={
                  location.pathname === "/services" ? "active_link" : ""
                }
              >
                {data["header-2"]}
              </li>
            </Link>
            <Link onClick={toTop} to={"/about"}>
              <li
                className={location.pathname === "/about" ? "active_link" : ""}
              >
                {data["header-3"]}
              </li>
            </Link>
            <Link onClick={toTop} to={"/contact"}>
              <li
                className={
                  location.pathname === "/contact" ? "active_link" : ""
                }
              >
                {data["header-4"]}
              </li>
            </Link>
          </ul>
          <ul className="menu_icons d-flex justify-content-center align-items-center ">
            <li>
              <img src="/assets/logo/logo.png" alt="logo" />
            </li>
          </ul>
        </div>
        {/* )} */}
      </nav>
    </>
  );
};

export default Header;
