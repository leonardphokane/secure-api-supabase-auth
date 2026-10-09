import express from "express";

const router = express.Router();

export default function protectedRoutes(supabase) {
  // Profile route
  router.get("/profile", async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ error: "Access token required" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      res.json({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Dashboard route
  router.get("/dashboard", async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ error: "Access token required" });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // ✅ Token verified — return dashboard message
      res.json({ message: `Welcome to your dashboard, ${user.email}!` });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
}
