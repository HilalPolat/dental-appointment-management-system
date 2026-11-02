const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json()); // body'den JSON okumak için

// Basit test endpoint
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

//  KAYIT OL (REGISTER) endpoint'i
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, district, birthDate } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !email ||
      !password ||
      !district ||
      !birthDate
    ) {
      return res.status(400).json({ error: "Eksik alanlar var." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Bu e-posta ile zaten kayıt olunmuş." });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, phone, email, password_hash, district, birth_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id,
                 first_name,
                 last_name,
                 phone,
                 email,
                 district,
                 birth_date,
                 created_at,
                 last_login`,
      [firstName, lastName, phone, email, hash, district, birthDate]
    );

    const user = result.rows[0];

    //  misafir randevları yeni hesaba bağla
    try {
      await pool.query(
        `UPDATE appointments
         SET user_id = $1
         WHERE user_id IS NULL AND email = $2`,
        [user.id, email]
      );
    } catch (updateErr) {
      console.error("REGISTER -> appointments UPDATE error:", updateErr);
    }

    res.status(201).json({
      message: "Kayıt başarılı",
      user,
    });
  } catch (err) {
    console.error("REGISTER error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  GİRİŞ (LOGIN) endpoint'i
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "E-posta ve şifre gerekli." });
    }

    const result = await pool.query(
      `SELECT id,
              first_name,
              last_name,
              phone,
              email,
              password_hash,
              last_login,
              district,
              birth_date
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı." });
    }

    const user = result.rows[0];

    // Şifre doğru mu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı." });
    }

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    const { password_hash, ...safeUser } = user;

    return res.json({
      message: "Giriş başarılı",
      user: safeUser,
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  RANDEVU OLUŞTURMA ENDPOINT'İ
app.post("/api/appointments", async (req, res) => {
  try {
    const { fullName, email, phone, department, date, time, userId } = req.body;

    if (!fullName || !email || !phone || !department || !date || !time) {
      return res.status(400).json({ error: "Eksik alanlar var." });
    }

    let finalUserId = null;

    // front-end'den userId geldiyse, önce gerçekten var mı diye kontrol et
    if (userId) {
      const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [
        userId,
      ]);
      if (userCheck.rows.length > 0) {
        finalUserId = userId;
      } else {
        console.warn(
          "appointments: Geçersiz userId geldi, yok sayılıyor =>",
          userId
        );
      }
    }

    //  Hâlâ finalUserId yoksa, email üzerinden kullanıcı bulmaya çalış
    if (!finalUserId) {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      if (existingUser.rows.length > 0) {
        finalUserId = existingUser.rows[0].id;
      }
    }

    const insertQuery = `
      INSERT INTO appointments (full_name, email, phone, department, date, time, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
      fullName,
      email,
      phone,
      department,
      date,
      time,
      finalUserId,
    ]);

    return res.status(201).json({
      success: true,
      appointment: result.rows[0],
    });
  } catch (err) {
    console.error("Appointment insert error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

//  ADMIN - TÜM RANDEVULARI LİSTELE
app.get("/api/admin/appointments", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,
              user_id,
              full_name,
              email,
              phone,
              department,
              date,
              time,
              created_at
       FROM appointments
       ORDER BY date DESC, time DESC`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("GET /api/admin/appointments error:", err);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  ADMIN - RANDEVU iptal
app.delete("/api/admin/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Randevu id gerekli." });
    }

    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Randevu bulunamadı." });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/appointments/:id error:", err);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  BELİRLİ BÖLÜM + TARİH İÇİN DOLU SAATLER
app.get("/api/appointments/slots", async (req, res) => {
  try {
    const { department, date } = req.query; // ?department=...&date=YYYY-MM-DD

    if (!department || !date) {
      return res
        .status(400)
        .json({ error: "department ve date query parametreleri zorunlu." });
    }

    const result = await pool.query(
      `SELECT time FROM appointments
       WHERE department = $1 AND date = $2`,
      [department, date]
    );

    const times = result.rows.map((row) => row.time);

    return res.json({ times });
  } catch (err) {
    console.error("GET /api/appointments/slots error:", err);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// KULLANICI DETAYI
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id,
              first_name,
              last_name,
              email,
              phone,
              district,
              birth_date,
              created_at,
              last_login
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  KULLANICI GÜNCELLEME (PROFİL)
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      district,
    } = req.body;

    if (!first_name && !last_name && !phone && !district) {
      return res
        .status(400)
        .json({ error: "Güncellenecek en az bir alan göndermelisiniz." });
    }

    // Mevcut kullanıcı var mı?
    const existing = await pool.query(`SELECT id FROM users WHERE id = $1`, [
      id,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Dinamik UPDATE
    const fields = [];
    const values = [];
    let idx = 1;

    if (first_name !== undefined) {
      fields.push(`first_name = $${idx++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      fields.push(`last_name = $${idx++}`);
      values.push(last_name);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (district !== undefined) {
      fields.push(`district = $${idx++}`);
      values.push(district);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id,
                first_name,
                last_name,
                email,
                phone,
                district,
                birth_date,
                created_at,
                last_login;
    `;

    const result = await pool.query(query, values);
    const updatedUser = result.rows[0];

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("PUT /api/users/:id error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  KULLANICININ RANDEVULARI
app.get("/api/users/:id/appointments", async (req, res) => {
  try {
    const { id } = req.params;

    // Önce kullanıcının email'ini çek
    const userRes = await pool.query(`SELECT email FROM users WHERE id = $1`, [
      id,
    ]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    const userEmail = userRes.rows[0].email;

    const result = await pool.query(
      `SELECT id,
              full_name,
              email,
              phone,
              department,
              date,
              time,
              created_at
       FROM appointments
       WHERE user_id = $1
          OR (user_id IS NULL AND email = $2)
       ORDER BY date ASC, time ASC`,
      [id, userEmail]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/users/:id/appointments error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  KULLANICININ GELECEK RANDEVU SAYISI
app.get("/api/users/:id/upcoming-count", async (req, res) => {
  try {
    const { id } = req.params;

    const userRes = await pool.query(`SELECT email FROM users WHERE id = $1`, [
      id,
    ]);

    if (userRes.rows.length === 1) {
      const userEmail = userRes.rows[0].email;

      const result = await pool.query(
        `SELECT COUNT(*) AS count
         FROM appointments
         WHERE (user_id = $1 OR (user_id IS NULL AND email = $2))
           AND date >= CURRENT_DATE`,
        [id, userEmail]
      );

      const upcomingCount = parseInt(result.rows[0].count, 10);
      return res.json({ upcomingCount });
    }

    // Kullanıcı yoksa 0 dön
    res.json({ upcomingCount: 0 });
  } catch (err) {
    console.error("GET /api/users/:id/upcoming-count error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// RANDEVU İPTAL (DELETE) – Kullanıcı kendi randevusunu iptal ederken
app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Randevu id gerekli." });
    }

    // sadece kendi randevusunu silebilsin
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Kullanıcı bilgisi eksik (userId)." });
    }

    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Randevu bulunamadı veya size ait değil." });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/appointments/:id error:", err);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  ADMIN – HASTA LİSTESİ
app.get("/api/admin/patients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,
              first_name,
              last_name,
              email,
              phone,
              district,
              birth_date,
              created_at,
              last_login
       FROM users
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/admin/patients error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

//  Sunucuyu dinlet
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`API server ${port} portunda çalışıyor`);
});
