import React, { useEffect, useState } from "react";
import axios from "axios";
import data from "../../data/lang/tr.json";
import "../../assets/css/appointmentForm.css";
import Select from "../customSelect";
import Calendar from "../calender";
import { toast } from "react-toastify";

const TOTAL_SLOT_COUNT = 17; 

const formatTR = (d) =>
  d
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d)
    : "";

const normalizeToDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val) ? null : val;
  if (Array.isArray(val)) return normalizeToDate(val[0]);
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d)) return d;
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

// 🔹 Date -> "YYYY-MM-DD" (timezone kaymasını engellemek için)
const formatYMD = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDeptValue = (selected) => {
  if (!selected) return "";
  if (typeof selected === "string") return selected;
  return selected.value || "";
};

const AppointmentForm = ({ user, onCreated }) => {
  const options =
    data.departments?.map((d) => ({ label: d.name, value: d.slug })) ??
    [1, 2, 3, 4]
      .map((i) => {
        const label = data[`dropdown_${i}`];
        const value = data[`card_${i}_slug`];
        return label && value ? { label, value } : null;
      })
      .filter(Boolean);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formDate, setFormDate] = useState(null); // Date
  const [formTime, setFormTime] = useState(""); // "HH:MM"
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  const [bookedTimes, setBookedTimes] = useState([]); // dolu saatler
  const [fullyBookedDates, setFullyBookedDates] = useState([]); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const handleDateChange = (raw) => {
    const d = normalizeToDate(raw);
    if (d) {
      setFormDate(d);
      setFormTime("");    
      setBookedTimes([]);  
    }
    setShowCalendar(false);
  };

  useEffect(() => {
    const deptSlug = getDeptValue(selectedDepartment);
    if (!deptSlug || !formDate) {
      setBookedTimes([]);
      return;
    }

    const controller = new AbortController();

    const fetchSlots = async () => {
      try {
        const dateStr = formatYMD(formDate);

        const res = await axios.get(
          "http://localhost:5000/api/appointments/slots",
          {
            params: {
              department: deptSlug,
              date: dateStr,
            },
            signal: controller.signal,
          }
        );

        const times = res.data.times || [];
        setBookedTimes(times);

        if (times.length >= TOTAL_SLOT_COUNT) {
          setFullyBookedDates((prev) =>
            prev.includes(dateStr) ? prev : [...prev, dateStr]
          );

          toast.warning(
            "Bu tarihte seçilebilir saat kalmamış. Lütfen başka bir tarih seçin."
          );

          setFormDate(null);
          setFormTime("");
          setShowTimeOptions(false);
        }
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }
        console.error("Slots fetch error:", err);
        toast.error("Saatler yüklenirken bir hata oluştu.");
      }
    };

    fetchSlots();
    return () => controller.abort();
  }, [selectedDepartment, formDate]); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const department = getDeptValue(selectedDepartment);

    if (!department || !formDate || !formTime) {
      toast.warn("Lütfen bölüm, tarih ve saat seçiniz.");
      return;
    }

    if (!user) {
      toast.error("Önce giriş yapmalısınız.");
      return;
    }

    // güvenlik: seçilen saat o an dolu ise engelle
    if (bookedTimes.includes(formTime)) {
      toast.error("Bu saat başka bir randevu tarafından alınmış.");
      return;
    }

    const dateStr = formatYMD(formDate);
    const fullName = `${user.first_name} ${user.last_name}`;

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/appointments", {
        fullName,
        email: user.email,
        phone: user.phone,
        department,
        date: dateStr,
        time: formTime,
        userId: user.id,
      });

      setFormDate(null);
      setFormTime("");
      setSelectedDepartment(null);
      setBookedTimes([]);

      onCreated?.(res.data.appointment);
    } catch (err) {
      console.error("Appointment create error:", err);
      const msg =
        err.response?.data?.error || "Randevu oluşturulurken hata oluştu.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="appointment-form d-flex flex-column gap-3"
      style={{ maxWidth: 500 }}
    >
      <h3 style={{ marginBottom: 12 }}>Randevu Bilgileri</h3>

      <input
        type="text"
        name="fullName_display"
        className="w-100"
        value={`${user.first_name} ${user.last_name}`}
        readOnly
        disabled
        placeholder="İsim"
      />
      <input
        type="email"
        name="email_display"
        className="w-100"
        value={user.email}
        readOnly
        disabled
        placeholder="E-posta"
      />
      <input
        type="tel"
        name="phone_display"
        className="w-100"
        value={user.phone}
        readOnly
        disabled
        placeholder="Telefon"
      />

      {/* Bölüm seçimi  */}
      <div
        className="w-100 department-select-wrapper dashboard-select"
        style={{ position: "relative", zIndex: 11000 }}
      >
        {options.length === 0 ? (
          <small style={{ color: "#f88" }}>
            Bölümler bulunamadı. JSON anahtarlarını kontrol et.
          </small>
        ) : (
          <Select
            name="department"
            options={options}
            placeholder={data["select_department"] || "bölüm seçiniz"}
            value={selectedDepartment}
            onChange={(val) => {
              setSelectedDepartment(val);
              setFormDate(null);
              setFormTime("");
              setBookedTimes([]);
            }}
          />
        )}
      </div>

      {/* TARİH + SAAT BLOĞU */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
        }}
      >
        {/* Tarih seçimi */}
        <div className="custom-select message dashboard-select">
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
              disabledDates={fullyBookedDates}
            />
          </div>
        )}

        {/* Saat seçimi */}
        <div
          className="custom-select message dashboard-select"
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
                zIndex: 1000,
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {Array.from({ length: TOTAL_SLOT_COUNT }, (_, i) => {
                const hour = 9 + Math.floor(i / 2);
                const minute = i % 2 === 0 ? "00" : "30";
                const timeStr = `${hour.toString().padStart(2, "0")}:${minute}`;
                const isBooked = bookedTimes.includes(timeStr);

                return (
                  <li
                    key={timeStr}
                    className={`custom-select__option ${
                      formTime === timeStr ? "is-active" : ""
                    } ${isBooked ? "is-disabled" : ""}`}
                    onClick={() => {
                      if (isBooked) return;
                      setFormTime(timeStr);
                      setShowTimeOptions(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: isBooked ? "not-allowed" : "pointer",
                      textAlign: "center",
                      opacity: isBooked ? 0.4 : 1,
                      textDecoration: isBooked ? "line-through" : "none",
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
        style={{ marginTop: 16, alignSelf: "flex-start" }}
        disabled={loading}
      >
        {loading ? "Kaydediliyor..." : "Randevu Oluştur"}
      </button>
    </form>
  );
};

export default AppointmentForm;
