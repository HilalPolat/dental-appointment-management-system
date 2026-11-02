import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../layout/sidebar/adminSidebar";
import "../../assets/css/dashboard.css";
import "../../assets/css/adminDashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

const DISTRICT_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#00c49f",
  "#0088fe",
  "#a4de6c",
  "#d0ed57",
  "#ffbb28",
  "#ff8042",
];

const AdminDashboard = () => {
  const [page, setPage] = useState("home");
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Filtre/Sıralama state
  const [dateFilter, setDateFilter] = useState("all"); // all | today | upcoming | past
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  const [patientSearch, setPatientSearch] = useState(""); // Hasta arama
  const navigate = useNavigate();

  const formatFullTR = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "";

  const formatDayMonth = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return { day: "", month: "" };
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    };
  };

  const createDateTime = (appt) => {
    const base = new Date(appt.date);
    if (!appt.time) return base;
    const [h, m] = appt.time.split(":");
    base.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
    return base;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, patientsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/appointments"),
          axios.get("http://localhost:5000/api/admin/patients"),
        ]);

        console.log("ADMIN appointments:", appsRes.data);
        console.log("ADMIN patients:", patientsRes.data);

        setAppointments(appsRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (err) {
        console.error("ADMIN FETCH ERROR:", err);
        toast.error("Admin verileri alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Admin randevu iptali
  const handleCancelAppointment = (id) => {
    toast.info(
      <ConfirmToast
        onConfirm={async () => {
          try {
            await axios.delete(
              `http://localhost:5000/api/admin/appointments/${id}`
            );

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

  if (loading) return <div className="container mt-5">Yükleniyor...</div>;

  // === ORTAK TARİH OBJELERİ ===
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Bugünkü randevular
  const todayAppointments = appointments.filter((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  // Bu ayki randevular
  const thisMonthAppointments = appointments.filter((a) => {
    const d = new Date(a.date);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth()
    );
  });

  // Bölümlere göre sayım
  const departmentCounts = appointments.reduce((acc, a) => {
    const key = a.department || "Bilinmeyen";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const mostPopularDepartment =
    Object.keys(departmentCounts).length > 0
      ? Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  // Tarih yazıları
  const todayLabel = formatFullTR(today.toISOString());
  const thisMonthLabel = today.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  // En yakın randevular
  const upcomingForHome = appointments
    .filter((a) => {
      const dt = createDateTime(a);
      return dt.getTime() >= Date.now();
    })
    .sort((a, b) => createDateTime(a) - createDateTime(b))
    .slice(0, 3);

  // Randevu sayfası filtre + sıralama
  const filteredAppointments = appointments.filter((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today":
        return d.getTime() === today.getTime();
      case "upcoming":
        return d.getTime() > today.getTime();
      case "past":
        return d.getTime() < today.getTime();
      case "all":
      default:
        return d.getTime() >= today.getTime();
    }
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const da = createDateTime(a);
    const db = createDateTime(b);
    if (sortOrder === "asc") return da - db;
    return db - da;
  });

  const visibleCount = sortedAppointments.length;

  // İlçe dağılımı için veri
  const districtCounts = patients.reduce((acc, p) => {
    const key = p.district || "Belirtilmemiş";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const districtData = Object.entries(districtCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const totalDistrictPatients = districtData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  //  En çok hastası olan ilçe
  const topDistrict =
    districtData.length > 0
      ? [...districtData].sort((a, b) => b.value - a.value)[0]
      : null;

  // Hasta arama isim
  const filteredPatients = patients.filter((u) => {
    const keyword = patientSearch.toLowerCase().trim();
    if (!keyword) return true;

    const first = (u.first_name || "").toLowerCase();
    const last = (u.last_name || "").toLowerCase();
    const full = `${first} ${last}`.trim();

    return (
      first.includes(keyword) ||
      last.includes(keyword) ||
      full.includes(keyword)
    );
  });

  //SAATLERE GÖRE RANDEVU DAĞILIMI 
  const timeCounts = appointments.reduce((acc, a) => {
    const key = a.time || "Belirtilmemiş";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const timeData = Object.entries(timeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const totalTimeAppointments = timeData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const topTimeEntry =
    timeData.length > 0
      ? [...timeData].sort((a, b) => b.value - a.value)[0]
      : null;

  const calcAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const d = new Date(birthDateStr);
    if (isNaN(d)) return null;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  };

  const ageBuckets = {
    "0-12": 0,
    "13-17": 0,
    "18-30": 0,
    "31-45": 0,
    "46-60": 0,
    "61+": 0,
  };

  patients.forEach((p) => {
    const age = calcAge(p.birth_date);
    if (age == null) return;

    if (age <= 12) ageBuckets["0-12"]++;
    else if (age <= 17) ageBuckets["13-17"]++;
    else if (age <= 30) ageBuckets["18-30"]++;
    else if (age <= 45) ageBuckets["31-45"]++;
    else if (age <= 60) ageBuckets["46-60"]++;
    else ageBuckets["61+"]++;
  });

  const ageData = Object.entries(ageBuckets)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="dashboard-layout">
      <div className="menu_toggle">
        <input className="d-none" type="checkbox" id="admin-checkbox" />
        <label onClick={toggleMenu} htmlFor="admin-checkbox" className="toggle">
          <div className="bars" id="bar1"></div>
          <div className="bars" id="bar2"></div>
          <div className="bars" id="bar3"></div>
        </label>
      </div>

      <ToastContainer />

      <AdminSidebar
        activePage={page}
        menuOpen={menuOpen}
        onSelect={(p) => {
          setPage(p);
          setMenuOpen(false);
        }}
      />

      <main className="dashboard-content">
        {/* ADMIN ANA SAYFA*/}
        {page === "home" && (
          <div className="admin-home-columns">
            <div className="admin-home-row">
              <section className="dashboard-home-card admin-summary-card">
                <h2 style={{ fontSize: "26px" }}>Genel Bakış</h2>
                <p className="upcoming-sub">
                  Clinik randevu sisteminin bugünkü ve bu ayki durumu.
                </p>
                <br />
                <div className="admin-summary-list">
                  <div className="admin-summary-item">
                    <span className="admin-summary-label">
                      Bugünkü (<strong>{todayLabel}</strong>) Randevu Sayısı
                    </span>
                    <span className="admin-summary-value">
                      <b>{todayAppointments.length}</b>
                    </span>
                  </div>

                  <div className="admin-summary-item">
                    <span className="admin-summary-label">
                      <strong>{thisMonthLabel}</strong> Boyunca Oluşturulan
                      Toplam Randevu Sayısı
                    </span>
                    <span className="admin-summary-value">
                      <b>{thisMonthAppointments.length}</b>
                    </span>
                  </div>

                  <div className="admin-summary-item">
                    <span className="admin-summary-label">
                      En Çok Randevu Alınan Bölüm:
                    </span>
                    <span className="admin-summary-value">
                      <b>{mostPopularDepartment || "-"}</b>
                    </span>
                    <br />
                    <span className="admin-summary-desc">
                      {mostPopularDepartment
                        ? `Şu ana kadar en fazla randevu ${mostPopularDepartment} bölümüne alınmıştır.`
                        : "Bölümlere göre randevu istatistiği oluşturmak için yeterli veri bulunmuyor."}
                    </span>
                  </div>
                </div>
              </section>

              <section className="dashboard-home-card admin-time-pie-card">
                <h2 style={{ fontSize: "26px" }}>
                  Saatlere Göre Randevu Dağılımı
                </h2>
                <p className="upcoming-sub">
                  Randevuların gün içindeki saatlere göre dağılımı.
                </p>

                {timeData.length === 0 ? (
                  <div className="upcoming-empty">
                    <p>Henüz saat dağılımı oluşturmak için yeterli veri yok.</p>
                  </div>
                ) : (
                  <>
                    <div
                      className="admin-summary-item"
                      style={{ marginTop: 12 }}
                    >
                      <span className="admin-summary-label">
                        En Çok Tercih Edilen Saat:
                      </span>
                      <span className="admin-summary-value">
                        <b>
                          {topTimeEntry?.name} ({topTimeEntry?.value} randevu
                          {totalTimeAppointments > 0 &&
                            ` - ${(
                              (topTimeEntry.value / totalTimeAppointments) *
                              100
                            ).toFixed(1)}%`}
                          )
                        </b>
                      </span>
                    </div>

                    <div style={{ width: "100%", height: 300, marginTop: 16 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={timeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            labelLine={false}
                            label={({ name, value }) => {
                              const pct =
                                totalTimeAppointments > 0
                                  ? (
                                      (value / totalTimeAppointments) *
                                      100
                                    ).toFixed(1)
                                  : 0;
                              return `${name} (${value} - ${pct}%)`;
                            }}
                          >
                            {timeData.map((entry, index) => (
                              <Cell
                                key={`time-cell-${entry.name}`}
                                fill={
                                  DISTRICT_COLORS[
                                    index % DISTRICT_COLORS.length
                                  ]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => {
                              const pct =
                                totalTimeAppointments > 0
                                  ? (
                                      (value / totalTimeAppointments) *
                                      100
                                    ).toFixed(1)
                                  : 0;
                              return [`${value} randevu (${pct}%)`, name];
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </section>
            </div>

            <div className="admin-home-row">
              <section className="dashboard-home-card admin-age-card">
                <h2 style={{ fontSize: "26px" }}>
                  Yaş Aralığına Göre Hasta Dağılımı
                </h2>
                <p className="upcoming-sub">
                  Sistemde kayıtlı hastaların yaş aralıklarına göre dağılımı.
                </p>

                {ageData.length === 0 ? (
                  <div className="upcoming-empty">
                    <p>Yaş bilgisi bulunan hasta kaydı yok.</p>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 260, marginTop: 8 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={ageData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {ageData.map((entry, index) => (
                            <Cell
                              key={`age-cell-${entry.name}`}
                              fill={
                                DISTRICT_COLORS[index % DISTRICT_COLORS.length]
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className="dashboard-home-card dashboard-upcoming-card admin-nearest-card">
                <div className="upcoming-header">
                  <div className="d-flex flex-column align-items-baseline">
                    <h2>En Yakın Randevular</h2>
                    <p className="upcoming-sub">
                      Bugünden itibaren en yakın {upcomingForHome.length}{" "}
                      randevu.
                    </p>
                  </div>
                </div>

                {upcomingForHome.length === 0 ? (
                  <div className="upcoming-empty">
                    <p>Yakında planlanmış randevu bulunmuyor.</p>
                  </div>
                ) : (
                  <ul className="upcoming-list">
                    {upcomingForHome.map((a) => {
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
                              <span className="upcoming-dept">
                                {a.department}
                              </span>
                            </div>
                            <div className="upcoming-meta d-flex flex-column align-items-baseline">
                              <div>Hasta Adı: {a.full_name}</div>
                              <div>E-posta: {a.email}</div>
                              <div>Telefon: {a.phone}</div>
                              <div>Tarih: {formatFullTR(a.date)}</div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        {/*TÜM RANDEVULAR SAYFASI */}
        {page === "appointments" && (
          <section className="dashboard-home-card dashboard-upcoming-card">
            <div className="upcoming-header">
              <div className="d-flex flex-column align-items-baseline">
                <h2>Tüm Randevular</h2>
                <p className="upcoming-sub">
                  Sistemdeki tüm hastaların randevularının listesi.
                </p>
              </div>
              <div className="upcoming-count-badge">{visibleCount} adet</div>
            </div>

            <div className="admin-filters">
              <div className="admin-filter-group">
                <span className="admin-filter-label">Filtre:</span>
                <button
                  type="button"
                  className={`admin-filter-btn ${
                    dateFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setDateFilter("all")}
                >
                  Tümü
                </button>
                <button
                  type="button"
                  className={`admin-filter-btn ${
                    dateFilter === "today" ? "active" : ""
                  }`}
                  onClick={() => setDateFilter("today")}
                >
                  Bugün
                </button>
                <button
                  type="button"
                  className={`admin-filter-btn ${
                    dateFilter === "upcoming" ? "active" : ""
                  }`}
                  onClick={() => setDateFilter("upcoming")}
                >
                  Gelecek
                </button>
                <button
                  type="button"
                  className={`admin-filter-btn ${
                    dateFilter === "past" ? "active" : ""
                  }`}
                  onClick={() => setDateFilter("past")}
                >
                  Geçmiş
                </button>
              </div>

              <div className="admin-filter-group">
                <span className="admin-filter-label">Sırala:</span>
                <button
                  type="button"
                  className={`admin-filter-btn ${
                    sortOrder === "asc" ? "active" : ""
                  }`}
                  onClick={() => setSortOrder("asc")}
                >
                  En Yakın İlk
                </button>
                <button
                  type="button"
                  className={`admin-filter-btn ${
                    sortOrder === "desc" ? "active" : ""
                  }`}
                  onClick={() => setSortOrder("desc")}
                >
                  En Uzak İlk
                </button>
              </div>
            </div>

            {sortedAppointments.length === 0 ? (
              <div className="upcoming-empty">
                <p>Filtreye uygun randevu bulunmuyor.</p>
              </div>
            ) : (
              <ul className="upcoming-list">
                {sortedAppointments.map((a) => {
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

                        <div className="upcoming-meta d-flex flex-column align-items-baseline">
                          <div>Hasta Adı: {a.full_name}</div>
                          <div>E-posta: {a.email}</div>
                          <div>Telefon: {a.phone}</div>
                          <div>Tarih: {formatFullTR(a.date)}</div>
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

        {/* HASTA LİSTESİ SAYFASI  */}
        {page === "patients" && (
          <section className="dashboard-home-card dashboard-upcoming-card">
            <div className="upcoming-header">
              <div className="d-flex flex-column align-items-baseline">
                <h2>Hasta Listesi</h2>
                <p className="upcoming-sub">
                  Sistemde kayıtlı tüm hastaların listesi.
                </p>
              </div>
              <div className="upcoming-count-badge">
                {filteredPatients.length} adet
              </div>
            </div>

            {/* Arama kutusu */}
            <div className="admin-search-box" style={{ margin: "12px 0" }}>
              <input
                type="text"
                placeholder="Hasta ara"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 15,
                }}
              />
            </div>

            {filteredPatients.length === 0 ? (
              <div className="upcoming-empty">
                <p>Arama kriterine uygun hasta bulunmuyor.</p>
              </div>
            ) : (
              <ul className="upcoming-list">
                {filteredPatients.map((u) => (
                  <li key={u.id} className="upcoming-item">
                    <div className="upcoming-main">
                      <div className="upcoming-line">
                        <span className="upcoming-time">
                          Hasta Adı: {u.first_name} {u.last_name}
                        </span>
                      </div>

                      <div
                        className="upcoming-meta d-flex flex-column align-items-baseline"
                        style={{ marginTop: 4 }}
                      >
                        <span>E-posta: {u.email}</span>
                        <span>Telefon: {u.phone || "-"}</span>
                        <span>İlçe: {u.district || "Belirtilmemiş"}</span>
                        <span>
                          Kayıt Tarihi:{" "}
                          {u.created_at ? formatFullTR(u.created_at) : "-"}
                        </span>
                        <span>
                          Son Giriş:{" "}
                          {u.last_login ? formatFullTR(u.last_login) : "-"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/*  EN AKTİF HASTALAR SAYFASI  */}
        {page === "activePatients" && (
          <section className="dashboard-home-card dashboard-upcoming-card">
            <div className="upcoming-header">
              <div className="d-flex flex-column align-items-baseline">
                <h2>En Aktif Hastalar</h2>
                <p className="upcoming-sub">
                  Sistemde en fazla randevuya sahip hastaların listesi.
                </p>
              </div>
            </div>

            {patients.length === 0 ? (
              <div className="upcoming-empty">
                <p>Hiç hasta kaydı bulunamadı.</p>
              </div>
            ) : (
              <ul className="upcoming-list">
                {patients
                  .map((u) => ({
                    ...u,
                    totalAppointments: appointments.filter(
                      (a) => a.user_id === u.id
                    ).length,
                  }))
                  .filter((u) => u.totalAppointments > 0)
                  .sort((a, b) => b.totalAppointments - a.totalAppointments)
                  .slice(0, 10)
                  .map((u) => (
                    <li key={u.id} className="upcoming-item">
                      <div className="upcoming-main">
                        <div className="upcoming-line">
                          <span className="upcoming-time">
                            Hasta Adı: {u.first_name} {u.last_name}
                          </span>
                          <span className="upcoming-dept-patient">
                            {u.totalAppointments} randevu
                          </span>
                        </div>

                        <div
                          className="upcoming-meta d-flex flex-column align-items-baseline"
                          style={{ marginTop: 8 }}
                        >
                          <div>E-posta: {u.email}</div>
                          <div>Telefon: {u.phone}</div>
                          <div>Kayıt Tarihi: {formatFullTR(u.created_at)}</div>
                          <div>
                            Son Giriş:{" "}
                            {u.last_login ? formatFullTR(u.last_login) : "-"}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        )}

        {/* İLÇE DAĞILIMI SAYFASI */}
        {page === "districts" && (
          <section className="dashboard-home-card dashboard-upcoming-card">
            <div className="d-flex align-items-center justify-content-center f-column">
              <div>
                <h2 style={{ fontSize: "26px" }}>
                  İlçelere Göre Hasta Dağılımı
                </h2>
                <p className="upcoming-sub">
                  Kayıtlı hastaların hangi ilçelerden geldiğini yüzde olarak
                  görüntüleyebilirsiniz.
                </p>

                {topDistrict && (
                  <p className="upcoming-sub" style={{ marginTop: 6 }}>
                    En çok hastanın bulunduğu ilçe:{" "}
                    <strong>{topDistrict.name}</strong> ({topDistrict.value}{" "}
                    hasta
                    {totalDistrictPatients > 0 &&
                      ` - ${(
                        (topDistrict.value / totalDistrictPatients) *
                        100
                      ).toFixed(1)}%`}
                    )
                  </p>
                )}
              </div>
            </div>

            {districtData.length === 0 ? (
              <div className="upcoming-empty">
                <p>İlçe bilgisi bulunan hasta kaydı bulunmuyor.</p>
              </div>
            ) : (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={districtData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      labelLine={false}
                      label={({ name, value }) => {
                        const pct =
                          totalDistrictPatients > 0
                            ? ((value / totalDistrictPatients) * 100).toFixed(1)
                            : 0;
                        return `${name} (${value} - ${pct}%)`;
                      }}
                    >
                      {districtData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={DISTRICT_COLORS[index % DISTRICT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                        const pct =
                          totalDistrictPatients > 0
                            ? ((value / totalDistrictPatients) * 100).toFixed(1)
                            : 0;
                        return [`${value} hasta (${pct}%)`, name];
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
