import React from "react";
import data from "../../data/lang/tr.json";
import "../../assets/css/layout.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <div className="footer d-flex justify-content-center container col-12">
        <div className="d-block col-xl-6 col-6 footer_contact_col ">
          <div className="footer_logo_div">
            <Link to={"/"}>
              {" "}
              <img className="" src="/assets/logo/logo.png" alt="logo" />
            </Link>
          </div>

          <ul className="footer_elements footer_contact_elements">
            <li className="mb-4 footer_elements_title">
              {data["footer-contact-title"]}
            </li>
            <li className="footer_subtitle">{data["footer-contact-1"]}</li>
            <li className="">
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
              >
                {data["footer-contact-2"]}
              </a>
            </li>
            <li className="mb-3">
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
              >
                {data["footer-contact-7"]}
              </a>
            </li>

            <li className="footer_subtitle">{data["footer-contact-3"]}</li>
            <li className="mb-3">
              <a href="tel:+905555555555"> {data["footer-contact-4"]}</a>
            </li>
            <li className="footer_subtitle">{data["footer-contact-5"]}</li>
            <li>
              <a className="mail_info" href="mailto:info@clinic.com">
                {" "}
                {data["footer-contact-6"]}
              </a>
            </li>
          </ul>
        </div>

        <div className="d-block col-6">
          <ul className="footer_elements">
            <li
              style={{
                color: "#fff",
                fontSize: "25px",
              }}
              className="mb-4 "
            >
              <a
                className="footer_elements_title footer-servies-title"
                style={{
                  color: "#fff",
                  fontSize: "25px",
                }}
                href="/services"
              >
                {data["footer-servies-title"]}
              </a>
            </li>
            <li
              style={{
                fontWeight: "bold",
              }}
            >
              <a href="/services">{data["footer-servies-1"]}</a>
            </li>
            <li
              style={{
                fontWeight: "bold",
              }}
            >
              <a href="/services">{data["footer-servies-2"]}</a>
            </li>
            <li
              style={{
                fontWeight: "bold",
              }}
            >
              <a href="/services">{data["footer-servies-3"]}</a>
            </li>
            <li
              style={{
                fontWeight: "bold",
              }}
            >
              <a href="/services">{data["footer-servies-4"]}</a>
            </li>
            <li
              style={{
                fontWeight: "bold",
              }}
            >
              <a href="/services">{data["footer-servies-5"]}</a>
            </li>
            <li style={{ marginTop: "50px" }} className="mb-4">
              <a
                className="footer_elements_title"
                style={{
                  color: "#fff",
                  fontSize: "25px",
                }}
                href="/about"
              >
                {data["footer-about-title"]}
              </a>
            </li>
            <li
              style={{
                fontWeight: "bold",
              }}
              className="mb-3"
            >
              <a href="/about">{data["footer-about-1"]}</a>
            </li>
          </ul>
        </div>

        <div>
          <ul className="icons">
            <li className="mb-4">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.instagram.com"
              >
                <img
                  className="me-3"
                  src="/assets/img/icon/instagram.png"
                  alt="instagram_icon"
                />
              </a>
            </li>

            <li className="mb-4">
              <a target="_blank" rel="noreferrer" href="https://twitter.com">
                <img
                  className="me-3"
                  src="/assets/img/icon/twitter.png"
                  alt="instagram_icon"
                />
              </a>
            </li>
            <li className="mb-4">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.facebook.com"
              >
                <img
                  className="me-3"
                  src="/assets/img/icon/facebook.png"
                  alt="instagram_icon"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
