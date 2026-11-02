import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../layout/sidebar";
import AppointmentForm from "../appointmentForm";
import "../../assets/css/dashboard.css";
import { FaPlus, FaClock, FaUser } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Select from "../../components/customSelect";

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

const Dashboard = () => {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [upcomingSearch, setUpcomingSearch] = useState("");

  // Profil düzenleme state’leri
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    district: "",
  });

  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const formatDateTimeTR = (iso) =>
    iso
      ? new Intl.DateTimeFormat("tr-TR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(iso))
      : "";

  const formatDayMonth = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return { day: "", month: "" };
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleDateString("tr-TR", { month: "short" }),
    };
  };

  const formatFullTR = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

  //  Giriş kontrolü + verileri çek
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    // login yoksa YA DA admin ise -> dashboard'a izin verme
    if (!storedId || isAdmin) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, appRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${storedId}`),
          axios.get(`http://localhost:5000/api/users/${storedId}/appointments`),
        ]);
        setUser(userRes.data);
        setAppointments(appRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Veriler alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const lastLogin =
    sessionStorage.getItem("lastLogin") || localStorage.getItem("lastLogin");

  // Yaklaşan / geçmiş randevu ayrımı
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });

  const pastAppointments = appointments.filter((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });

  const upcomingCount = upcomingAppointments.length;
  const pastCount = pastAppointments.length;

  const filteredUpcomingAppointments = upcomingAppointments.filter((a) => {
    const keyword = upcomingSearch.toLowerCase().trim();
    if (!keyword) return true;

    const formatted = formatFullTR(a.date).toLowerCase();
    return formatted.includes(keyword);
  });

  const ConfirmToast = ({ onConfirm, onCancel }) => (
    <div style={{ textAlign: "center" }}>
      <p style={{ marginBottom: 12, color: "#000" }}>
        Bu randevuyu iptal etmek istediğinize emin misiniz?
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button
          onClick={() => {
            toast.dismiss();
            onConfirm();
          }}
          style={{
            background: "#e63946",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Evet
        </button>
        <button
          onClick={() => {
            toast.dismiss();
            onCancel();
          }}
          style={{
            background: "#ddd",
            color: "#000",
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Hayır
        </button>
      </div>
    </div>
  );

  const handleCancelAppointment = (id) => {
    toast.info(
      <ConfirmToast
        onConfirm={async () => {
          try {
            await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
              data: { userId: user.id },
            });
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            toast.success("Randevu başarıyla iptal edildi.");
          } catch (err) {
            console.error("Randevu iptal hata:", err);
            toast.error("Randevu iptal edilirken bir hata oluştu.");
          }
        }}
        onCancel={() => toast.info("İptal işlemi geri alındı.")}
      />,
      { autoClose: false }
    );
  };

  // Profil düzenlemeyi aç
  const handleStartEditProfile = () => {
    if (!user) return;
    setProfileForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      district: user.district || "",
    });
    setIsEditingProfile(true);
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEditProfile = () => {
    // Formu tekrar user'dan doldurup edit moddan çık
    if (user) {
      setProfileForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        district: user.district || "",
      });
    }
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        phone: profileForm.phone.trim(),
        district: profileForm.district.trim(),
      };

      const res = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        payload
      );

      const updatedUser = res.data.user;

      setUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profil bilgileriniz güncellendi.");
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Profil güncellenirken bir hata oluştu.";
      toast.error(msg);
    }
  };

  if (loading) return <div className="container mt-5">Yükleniyor...</div>;

  if (!user) {
    return (
      <div className="container mt-5">
        Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="menu_toggle">
        <input type="checkbox" id="checkbox" />
        <label onClick={toggleMenu} htmlFor="checkbox" className="toggle">
          <div className="bars" id="bar1"></div>
          <div className="bars" id="bar2"></div>
          <div className="bars" id="bar3"></div>
        </label>
      </div>

      <ToastContainer />

      <Sidebar
        activePage={page}
        menuOpen={menuOpen}
        onSelect={(p) => {
          setPage(p);
          setMenuOpen(false);
        }}
      />

      <main className="dashboard-content">
        {/* ANA SAYFA */}
        {page === "home" && (
          <div className="dashboard-home-card">
            <h1>
              Hoş geldiniz,{" "}
              <span>
                {user.first_name} {user.last_name}
              </span>
            </h1>

            <div className="dashboard-info">
              <p>
                <strong>Son girişiniz:</strong>{" "}
                {lastLogin ? formatDateTimeTR(lastLogin) : "Bugün"}
              </p>
              <p>
                <strong>Aktif randevu sayınız:</strong> {upcomingCount}
              </p>
            </div>

            <div className="dashboard-actions">
              <button onClick={() => setPage("appointment")}>
                <FaPlus color="#000" /> Randevu Al
              </button>
              <button onClick={() => setPage("upcoming")}>
                <FaClock color="#000" /> Yaklaşan Randevular
              </button>
              <button onClick={() => setPage("profile")}>
                <FaUser color="#000" /> Profil Bilgilerim
              </button>
            </div>
          </div>
        )}

        {/* RANDEVU AL */}
        {page === "appointment" && (
          <AppointmentForm
            user={user}
            onCreated={(newApp) => {
              setAppointments((prev) => [...prev, newApp]);
              toast.success("Randevunuz başarıyla oluşturuldu!");
              setPage("upcoming");
            }}
          />
        )}

        {/* YAKLAŞAN RANDEVULAR */}
        {page === "upcoming" && (
          <section className="dashboard-home-card dashboard-upcoming-card">
            <div className="upcoming-header">
              <div className="d-flex flex-column align-items-baseline">
                <h2>Yaklaşan Randevular</h2>
                <p className="upcoming-sub">
                  Önümüzdeki günlerde planlanan randevularınız.
                </p>
              </div>
              <div className="upcoming-count-badge">{upcomingCount} adet</div>
            </div>

            {/* Tarihe göre arama input’u */}
            <div
              className="admin-search-box"
              style={{ margin: "12px 0", maxWidth: "100%" }}
            >
              <input
                type="text"
                placeholder="Tarihe göre ara (örn: 04 Aralık, 2025, Aralık)"
                value={upcomingSearch}
                onChange={(e) => setUpcomingSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 15,
                }}
              />
            </div>

            {filteredUpcomingAppointments.length === 0 ? (
              <div className="upcoming-empty">
                {upcomingCount === 0 ? (
                  <>
                    <p>Yaklaşan randevunuz bulunmuyor.</p>
                    <button
                      type="button"
                      className="public_btn mt-3"
                      onClick={() => setPage("appointment")}
                    >
                      Randevu Oluştur
                    </button>
                  </>
                ) : (
                  <p>Aramanıza uygun randevu bulunamadı.</p>
                )}
              </div>
            ) : (
              <ul className="upcoming-list">
                {filteredUpcomingAppointments.map((a) => {
                  const { day, month } = formatDayMonth(a.date);
                  return (
                    <li key={a.id} className="upcoming-item">
                      <div className="upcoming-date-box">
                        <span className="upcoming-day">{day}</span>
                        <span className="upcoming-month">{month}</span>
                      </div>

                      <div className="upcoming-main">
                        <div className="upcoming-line">
                          <span className="upcoming-time">{a.time}</span>
                          <span className="upcoming-dept">{a.department}</span>
                        </div>
                        <div className="upcoming-meta">
                          Tarih: {formatFullTR(a.date)}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="upcoming-cancel-btn"
                        onClick={() => handleCancelAppointment(a.id)}
                      >
                        İptal Et
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* GEÇMİŞ RANDEVULAR */}
        {page === "history" && (
          <section className="dashboard-home-card dashboard-upcoming-card">
            <div className="upcoming-header">
              <div className="d-flex flex-column align-items-baseline">
                <h2>Randevu Geçmişim</h2>
                <p className="upcoming-sub">
                  Geçmiş tarihlerde tamamlanmış randevularınızı burada
                  görüntüleyebilirsiniz.
                </p>
              </div>
              <div className="upcoming-count-badge">{pastCount} adet</div>
            </div>

            {pastAppointments.length === 0 ? (
              <div className="upcoming-empty">
                <p>Geçmiş randevunuz bulunmuyor.</p>
              </div>
            ) : (
              <ul className="upcoming-list">
                {pastAppointments.map((a) => {
                  const { day, month } = formatDayMonth(a.date);

                  return (
                    <li key={a.id} className="upcoming-item past-appointment">
                      <div className="upcoming-date-box">
                        <span className="upcoming-day">{day}</span>
                        <span className="upcoming-month">{month}</span>
                      </div>

                      <div className="upcoming-main">
                        <div className="upcoming-line">
                          <span className="upcoming-time">{a.time}</span>
                          <span className="upcoming-dept">{a.department}</span>
                        </div>
                        <div className="upcoming-meta">
                          Tarih: {formatFullTR(a.date)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* PROFİL */}
        {page === "profile" && (
          <section className="dashboard-home-card dashboard-upcoming-card">
            <div className="upcoming-header">
              <div className="d-flex flex-column align-items-baseline">
                <h2>Profil Bilgilerim</h2>
                <p className="upcoming-sub">
                  Kişisel bilgilerinizi görüntüleyebilir ve
                  güncelleyebilirsiniz.
                </p>
              </div>

              {!isEditingProfile ? (
                <button
                  type="button"
                  className="public_btn"
                  style={{ padding: "6px 14px", fontSize: 14 }}
                  onClick={handleStartEditProfile}
                >
                  Bilgileri Güncelle
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="public_btn"
                    style={{ padding: "6px 14px", fontSize: 14 }}
                    onClick={handleSaveProfile}
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    className="public_btn"
                    style={{
                      padding: "6px 14px",
                      fontSize: 14,
                      background: "#555",
                    }}
                    onClick={handleCancelEditProfile}
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>

            <ul className="upcoming-list">
              {/* Ad Soyad */}
              <li className="upcoming-item">
                <div className="upcoming-main">
                  <div className="upcoming-line">
                    <span className="upcoming-dept">Ad Soyad:</span>
                  </div>
                  {!isEditingProfile ? (
                    <div className="upcoming-meta">
                      {user.first_name} {user.last_name}
                    </div>
                  ) : (
                    <div className="d-flex gap-2 mt-2">
                      <input
                        style={{ width: "300px" }}
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) =>
                          handleProfileChange("first_name", e.target.value)
                        }
                        placeholder="Ad"
                        className="profile-input"
                      />
                      <input
                        style={{ width: "300px" }}
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) =>
                          handleProfileChange("last_name", e.target.value)
                        }
                        placeholder="Soyad"
                        className="profile-input"
                      />
                    </div>
                  )}
                </div>
              </li>

              {/* Telefon */}
              <li className="upcoming-item">
                <div className="upcoming-main">
                  <div className="upcoming-line">
                    <span className="upcoming-dept">Telefon:</span>
                  </div>
                  {!isEditingProfile ? (
                    <div className="upcoming-meta">{user.phone}</div>
                  ) : (
                    <input
                      style={{ width: "300px" }}
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      placeholder="Telefon"
                      className="profile-input mt-2"
                    />
                  )}
                </div>
              </li>

              {/* İlçe */}
              <li className="upcoming-item">
                <div className="upcoming-main">
                  <div className="upcoming-line">
                    <span className="upcoming-dept">İlçe:</span>
                  </div>

                  {!isEditingProfile ? (
                    <div className="upcoming-meta">
                      {user.district || "Belirtilmemiş"}
                    </div>
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        zIndex: 40,
                        width: "100%",
                        maxWidth: 300,
                        marginTop: 8,
                      }}
                    >
                      <Select
                        name="district"
                        options={districtOptions}
                        placeholder="İlçe seçiniz"
                        value={
                          districtOptions.find(
                            (opt) => opt.value === profileForm.district
                          ) || null
                        }
                        onChange={(opt) =>
                          handleProfileChange("district", opt ? opt.value : "")
                        }
                      />
                    </div>
                  )}
                </div>
              </li>

              <li className="upcoming-item">
                <div className="upcoming-main">
                  <div className="upcoming-line">
                    <span className="upcoming-dept">E-posta:</span>
                  </div>
                  <div className="upcoming-meta">{user.email || "-"}</div>
                </div>
              </li>

              {/* Üyelik Tarihi */}
              <li className="upcoming-item">
                <div className="upcoming-main">
                  <div className="upcoming-line">
                    <span className="upcoming-dept">Üyelik Tarihi:</span>
                  </div>
                  <div className="upcoming-meta">
                    {user.created_at ? formatFullTR(user.created_at) : "-"}
                  </div>
                </div>
              </li>
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
