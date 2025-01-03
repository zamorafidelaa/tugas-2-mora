import express from "express";
import pool from "./db.js";

const app = express();

app.use(express.json());

// ===== MOVIE ===== //

app.get("/movie", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM movie");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/movie", async (req, res) => {
  const { title, genre, sinopsis, language } = req.body;

  try {
    const checkTitle = await pool.query(
      "SELECT * FROM movie WHERE title = $1",
      [title]
    );
    if (checkTitle.rows.length > 0) {
      return res.status(400).send("Title movie tersebut sudah ada.");
    }

    const result = await pool.query(
      "INSERT INTO movie (title, genre, sinopsis, language) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, genre, sinopsis, language]
    );
    res.status(201).send("Movie berhasil ditambahkan.");
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/movie/:id", async (req, res) => {
  const { id } = req.params;
  const { title, genre, sinopsis, language } = req.body;

  try {
    const result = await pool.query(
      "UPDATE movie SET title = $1, genre = $2, sinopsis = $3, language = $4 WHERE id = $5 RETURNING *",
      [title, genre, sinopsis, language, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/movie/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM movie WHERE id = $1", [id]);
    res.status(200).send(`Movie dengan ID ${id} berhasil dihapus.`);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ===== REGISTER ===== //

app.post("/users/register", async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(400)
      .send("Semua field (name, username, password) harus di isi.");
  }

  if (username.trim() === "") {
    return res.status(400).send("Username tidak boleh kosong.");
  }
  if (username.length < 4) {
    return res.status(400).send("Username harus minimal 4 karakter.");
  }

  if (password.length < 6) {
    return res.status(400).send("Password harus minimal 6 karakter.");
  }

  try {
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).send("Username sudah terdaftar.");
    }

    await pool.query(
      "INSERT INTO users (name, username, password) VALUES ($1, $2, $3)",
      [name, username, password]
    );
    res.status(201).send("Registrasi berhasil.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// ===== LOGIN ===== //

app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).send("Username tidak boleh kosong.");
  }

  if (!password || password.length < 6) {
    return res.status(400).send("Password harus minimal 6 karakter.");
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).send("Username tidak ditemukan.");
    }

    if (user.rows[0].password !== password) {
      return res.status(400).send("Password salah.");
    }

    res.status(200).send("Login berhasil.");
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(3000, () => {
  console.log("Server telah berjalan");
});
