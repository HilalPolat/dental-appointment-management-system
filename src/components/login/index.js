import React, { useEffect, useState } from "react";
import "../../assets/css/about.css";
import "../../assets/css/login.css";
import data from "../../data/lang/tr.json";
import Footer from "../../layout/footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSection = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    // ADMIN KONTROLÜ
    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("user");

      const nowIso = new Date().toISOString();
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("lastLogin", nowIso);
      sessionStorage.setItem("isAdmin", "true");
      sessionStorage.setItem("lastLogin", nowIso);

      navigate("/admin");
      return;
    }

    // NORMAL KULLANICI GİRİŞİ
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      const loggedUser = res.data.user; 
      const nowIso = new Date().toISOString();

      localStorage.setItem("userId", loggedUser.id);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("isAdmin", "false");
      localStorage.setItem("lastLogin", nowIso);

    
      sessionStorage.setItem("userId", loggedUser.id);
      sessionStorage.setItem("user", JSON.stringify(loggedUser));
      sessionStorage.setItem("isAdmin", "false");
      sessionStorage.setItem("lastLogin", nowIso);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error || "Giriş sırasında bir hata oluştu.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="about d-flex justify-content-center">
        <h1 className="about_1">{data["login-big-title"]} </h1>
        <h1 className="about_2"> {data["login-big-title"]} </h1>
        <h1 className="about_1"> {data["login-big-title"]}</h1>
      </div>

      <section id="loginSection">
        <div className="d-flex flex-column justify-content-center align-items-center mt-5">
          <h2>
            {data["login-title-1"]} /{" "}
            <a href="/register">{data["login-title-2"]}</a>
          </h2>
          <br />

          <form
            onSubmit={handleSubmit}
            className="login-form d-flex flex-column justify-content-center align-items-center mt-3"
          >
            <input
              name="email"
              required
              type="email"
              placeholder={data["login_form_mail"]}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              name="password"
              required
              type="password"
              placeholder={data["login_form_password"]}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="public_btn"
              style={{ marginTop: 16 }}
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : data["login-title-1"]}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default LoginSection;
