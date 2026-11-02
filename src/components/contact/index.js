import React, { useEffect, useRef, useState } from "react";
import "../../assets/css/contact.css";
import data from "../../data/lang/tr.json";
import Footer from "../../layout/footer";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "../../components/customSelect";
import Calendar from "../../components/calender";

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

const ContactSection = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const formRef = useRef(null);

  const [formDate, setFormDate] = useState(null);
  const [formTime, setFormTime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  const options =
    data.departments?.map((d) => ({ label: d.name, value: d.slug })) ??
    [1, 2, 3, 4]
      .map((i) => {
        const label = data[`dropdown_${i}`];
        const value = data[`card_${i}_slug`];
        return label && value ? { label, value } : null;
      })
      .filter(Boolean);

  // Güvenli Date parse
  const normalizeToDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val) ? null : val;
    if (Array.isArray(val)) return normalizeToDate(val[0]);
    if (typeof val === "string") {
      const d = new Date(val);
      return isNaN(d) ? null : d;
    }
    if (typeof val === "object") {
      const { year, month, day } = val;
      if (year && (month || month === 0) && day) {
        const d1 = new Date(year, month, day);
        if (!isNaN(d1)) return d1;
        const d2 = new Date(year, month - 1, day);
        if (!isNaN(d2)) return d2;
      }
    }
    return null;
  };

  const handleDateChange = (raw) => {
    const d = normalizeToDate(raw);
    if (d) setFormDate(d);
    setShowCalendar(false);
  };

  const formatTR = (d) =>
    d
      ? new Intl.DateTimeFormat("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d)
      : "";

  //  Tarihi YYYY-MM-DD formatına çevir (UTC kaymasını engellemek için)
  const formatYMD = (d) => {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // FORM SUBMIT
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!formRef.current) return;

    const fd = new FormData(formRef.current);
    const fullName = fd.get("fullName");
    const phone = fd.get("phone");
    const email = fd.get("email");
    const district = fd.get("district");
    const department = fd.get("department");
    const date = fd.get("date");
    const time = fd.get("time");
    const birthDate = fd.get("birthDate");

    //  LocalStorage’daki kullanıcıyı al
    const storedUserRaw = localStorage.getItem("user");
    let userId = null;

    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        //  Sadece formdaki e-posta, login kullanıcının e-postasıyla aynıysa userId gönder
        if (storedUser.email === email) {
          userId = storedUser.id;
        }
      } catch (err) {
        console.error("storedUser parse error:", err);
      }
    }

    if (!date || !time) {
      toast.error("Lütfen tarih ve saat seçiniz.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/appointments", {
        fullName,
        email,
        phone,
        district,
        department,
        date,
        time,
        birthDate,
        userId,
      });

      console.log(res.data);
      toast.success("Randevunuz kaydedildi!");

      // Formu temizle
      formRef.current.reset();
      setFormDate(null);
      setFormTime("");
      setShowCalendar(false);
      setShowTimeOptions(false);
    } catch (err) {
      console.error(err);
      toast.error("Randevu kaydedilirken bir hata oluştu.");
    }
  };

  return (
    <>
      <div className="contact d-flex justify-content-center pb-5">
        <h1 className="contact_1 me-3">{data["contact-big-t1"]}</h1>
        <h1 className="contact_1">{data["contact-big-t2"]}</h1>
        <h1 className="contact_2 me-3">{data["contact-big-t1"]}</h1>
        <h1 className="contact_2">{data["contact-big-t2"]} </h1>
        <h1 className="contact_1 me-3">{data["contact-big-t1"]}</h1>
        <h1 className="contact_1">{data["contact-big-t2"]}</h1>
      </div>

      <div className="container mb-5">
        <div className="row align-items-start g-4">
          <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center">
            <ToastContainer />

            <form
              ref={formRef}
              className="form w-100"
              onSubmit={onSubmitHandler}
            >
              <div className="d-flex justify-content-center form-top contact_form">
                <div className="form_top_input d-flex flex-column justify-content-center align-items-center w-100">
                  <h3>{data["contact_form_title"]}</h3>

                  <input
                    name="fullName"
                    required
                    type="text"
                    placeholder={data["contact_form_name"]}
                  />

                  <input
                    name="phone"
                    required
                    type="tel"
                    placeholder={data["contact_form_phone"]}
                  />
                  <input
                    name="email"
                    required
                    type="email"
                    placeholder={data["register_form_mail"]}
                  />

                  <input
                    name="birthDate"
                    required
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="contact_form d-flex justify-content-center">
                <div className="form_top_input d-flex flex-column justify-content-center align-items-center form-part-2 w-100">
                  <div
                    style={{
                      position: "relative",
                      zIndex: 40,
                      width: "100%",
                      maxWidth: 400,
                    }}
                  >
                    <Select
                      name="district"
                      options={districtOptions}
                      placeholder="ilçe seçiniz"
                      onChange={(val) => console.log("District:", val)}
                    />
                  </div>

                  <div
                    style={{
                      position: "relative",
                      zIndex: 30,
                      width: "100%",
                      maxWidth: 400,
                      marginTop: 8,
                    }}
                  >
                    {options.length === 0 ? (
                      <small style={{ color: "#f88" }}>
                        Bölümler bulunamadı. JSON anahtarlarını kontrol et.
                      </small>
                    ) : (
                      <Select
                        name="department"
                        options={options}
                        placeholder={
                          data["select_department"] || "bölüm seçiniz"
                        }
                        onChange={(val) => console.log("Department:", val)}
                      />
                    )}
                  </div>

                  {/* TARİH + SAAT BLOĞU */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 400,
                      zIndex: 10,
                    }}
                  >
                    {/* Tarih seçimi kutusu */}
                    <div className="custom-select message">
                      <div
                        className="custom-select__label"
                        role="button"
                        tabIndex={0}
                        onClick={() => setShowCalendar((v) => !v)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setShowCalendar((v) => !v);
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        <span>
                          {formDate
                            ? formatTR(formDate)
                            : data["select_date"] || "tarih seçiniz"}
                        </span>
                        <span className="custom-select__arrow">▾</span>
                      </div>

                      <input
                        type="hidden"
                        name="date"
                        value={formDate ? formatYMD(formDate) : ""}
                      />
                    </div>

                    {showCalendar && (
                      <div
                        className="calendar-popover"
                        style={{
                          position: "absolute",
                          zIndex: 9999,
                          left: 0,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Calendar
                          value={formDate}
                          selectedDate={formDate}
                          date={formDate}
                          currentDate={formDate}
                          onChange={handleDateChange}
                          onSelect={handleDateChange}
                          onDayClick={handleDateChange}
                          defaultActiveStartDate={formDate || new Date()}
                        />
                      </div>
                    )}

                    {/* Saat seçimi kutusu */}
                    <div
                      className="custom-select message"
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 400,
                        marginTop: 12,
                      }}
                    >
                      <div
                        className="custom-select__label"
                        role="button"
                        tabIndex={0}
                        onClick={() => setShowTimeOptions((v) => !v)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setShowTimeOptions((v) => !v);
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        <span>{formTime || "saat seçiniz"}</span>
                        <span className="custom-select__arrow">▾</span>
                      </div>

                      <input type="hidden" name="time" value={formTime || ""} />

                      {showTimeOptions && (
                        <ul
                          className="custom-select__menu"
                          style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            left: 0,
                            width: "100%",
                            background: "#000",
                            borderRadius: 8,
                            zIndex: 5,
                            maxHeight: 200,
                            overflowY: "auto",
                          }}
                        >
                          {Array.from({ length: 17 }, (_, i) => {
                            const hour = 9 + Math.floor(i / 2);
                            const minute = i % 2 === 0 ? "00" : "30";
                            const timeStr = `${hour
                              .toString()
                              .padStart(2, "0")}:${minute}`;
                            return (
                              <li
                                key={timeStr}
                                className={`custom-select__option ${
                                  formTime === timeStr ? "is-active" : ""
                                }`}
                                onClick={() => {
                                  setFormTime(timeStr);
                                  setShowTimeOptions(false);
                                }}
                                style={{
                                  padding: "8px 12px",
                                  cursor: "pointer",
                                  textAlign: "center",
                                }}
                              >
                                {timeStr}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="public_btn"
                    style={{ marginTop: 16, width: "65%" }}
                  >
                    {data["contact_form_btn"]}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="col-12 col-lg-6">
            <div className="contact_form contact_links d-flex flex-column gap-4 align-items-stretch mb-5">
              <div className="d-flex align-items-center">
                <div className="icon_div d-flex justify-content-center align-items-center me-3">
                  <img
                    src="/assets/img/icon/icons_arrow-back.png"
                    alt="arrow"
                  />
                </div>
                <div className="contact_link_icons">
                  <h5>{data["footer-contact-1"]}</h5>
                  <a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {data["footer-contact-2"]}
                    <br /> {data["footer-contact-7"]}
                  </a>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="icon_div d-flex justify-content-center align-items-center me-3">
                  <img src="/assets/img/icon/icon_phone.png" alt="phone_icon" />
                </div>
                <div className="contact_link_icons">
                  <h5>{data["footer-contact-3"]}</h5>
                  <a href="tel:+905555555555">{data["footer-contact-4"]}</a>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="icon_div d-flex justify-content-center align-items-center me-3">
                  <img src="/assets/img/icon/icon-mail.png" alt="mail_icon" />
                </div>
                <div className="contact_link_icons">
                  <h5>{data["footer-contact-5"]}</h5>
                  <a href="mailto:info@clinic.com">
                    {data["footer-contact-6"]}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactSection;
