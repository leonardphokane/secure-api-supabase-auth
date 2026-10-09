import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import protectedRoutes from "./routes/protected.js"; // ✅ function export
import { ensureAuth } from "./middleware/ensureAuth.js"; // ✅ import middleware

dotenv.config();

const app = express();
app.use(express.json());

// Supabase client (created once here)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Load swagger.json
const swaggerDoc = JSON.parse(fs.readFileSync("./swagger.json", "utf-8"));

// --- Stage 1: Auth Routes ---
app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ user: data.user });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: "Invalid login credentials" });

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

// --- Stage 1b: Logout (fixed to use access token) ---
app.post("/auth/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const accessToken = authHeader.split(" ")[1];
  const { error } = await supabase.auth.admin.signOut(accessToken);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "User logged out successfully" });
});

// --- Stage 1c: Refresh Token Rotation ---
app.post("/auth/refresh", async (req, res) => {
  const refreshToken = req.headers["x-refresh-token"];
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

// --- Stage 2: Public Gate ---
app.get("/public/info", (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
});

// --- Stage 3: Protected Routes (with middleware) ---
app.use("/protected", ensureAuth(supabase), protectedRoutes(supabase)); // ✅ enforce auth + refresh

// --- Swagger UI ---
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Server start
app.listen(process.env.PORT, () => {
  console.log("Server running and connected to Supabase");
});
