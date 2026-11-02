import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/about.css";
import "../../assets/css/register.css";
import data from "../../data/lang/tr.json";
import Footer from "../../layout/footer";
import { useNavigate } from "react-router-dom";
import Select from "../../components/customSelect";

const RegisterSection = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleBeforeUnload = () => window.scrollTo(0, 0);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;

    if (!form.district.value) {
      alert("Lütfen ilçe seçiniz.");
      setLoading(false);
      return;
    }

    const payload = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      phone: form.phone.value,
      email: form.email.value,
      password: form.password.value,
      district: form.district.value,
      birthDate: form.birthDate.value,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/register", payload);
      const newUser = res.data?.user;

      if (newUser) {
        // Eski kullanıcı / admin bilgilerini ez
        localStorage.setItem("userId", newUser.id);
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("isAdmin", "false");
        localStorage.setItem("lastLogin", new Date().toISOString());

        // Dashboard useEffect'i hem session hem local baktığı için
        sessionStorage.setItem("userId", newUser.id);
        sessionStorage.setItem("user", JSON.stringify(newUser));
        sessionStorage.setItem("isAdmin", "false");
        sessionStorage.setItem("lastLogin", new Date().toISOString());
      }

      alert("Kayıt başarılı!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Kayıt sırasında bir hata oluştu.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const districtOptions = [
    { value: "Akyurt", label: "Akyurt" },
    { value: "Altındağ", label: "Altındağ" },
    { value: "Çamlıdere", label: "Çamlıdere" },
    { value: "Çankaya", label: "Çankaya" },
    { value: "Etimesgut", label: "Etimesgut" },
    { value: "Gölbaşı", label: "Gölbaşı" },
    { value: "Keçiören", label: "Keçiören" },
    { value: "Mamak", label: "Mamak" },
    { value: "Polatlı", label: "Polatlı" },
    { value: "Pursaklar", label: "Pursaklar" },
    { value: "Sincan", label: "Sincan" },
    { value: "Yenimahalle", label: "Yenimahalle" },
  ];

  return (
    <>
      <div className="about d-flex justify-content-center">
        <h1 className="about_1">{data["register-big-title"]} </h1>
        <h1 className="about_2">{data["register-big-title"]} </h1>
        <h1 className="about_1">{data["register-big-title"]}</h1>
      </div>

      <section id="registerSection">
        <div className="d-flex flex-column justify-content-center align-items-center mt-5">
          <h2>
            <a href="/login">{data["login-title-1"]} </a> /{" "}
            {data["login-title-2"]}
          </h2>
          <br />

          <form
            className="login-form d-flex flex-column justify-content-center align-items-center mt-3"
            onSubmit={handleSubmit}
          >
            <input
              name="firstName"
              required
              type="text"
              placeholder={data["register_form_name"]}
            />

            <input
              name="lastName"
              required
              type="text"
              placeholder={data["register_form_surname"]}
            />

            <input
              name="birthDate"
              required
              type="date"
              max={new Date().toISOString().split("T")[0]}
              placeholder="Doğum Tarihi"
              style={{ color: "gray" }}
            />

            <input
              name="phone"
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              placeholder={data["register_form_phone"]}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              className="form-control"
            />

            <input
              name="email"
              required
              type="email"
              placeholder={data["register_form_mail"]}
            />

            <Select
              name="district"
              placeholder="İlçe seçiniz"
              options={districtOptions}
            />

            <input
            style={{fontSize:"inherit"}}
              name="password"
              required
              type="password"
              placeholder={data["register_form_password"]}
            />

            <button
              type="submit"
              className="public_btn"
              style={{ marginTop: 16 }}
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : data["login-title-2"]}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default RegisterSection;
