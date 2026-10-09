// middleware/ensureAuth.js
export const ensureAuth = (supabase) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  // Try to get user with access token
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    // If access token invalid/expired, try refresh
    const refreshToken = req.headers["x-refresh-token"];
    if (!refreshToken) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data: refreshed, error: refreshError } =
      await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (refreshError) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Attach new tokens to response headers
    res.setHeader("x-access-token", refreshed.session.access_token);
    res.setHeader("x-refresh-token", refreshed.session.refresh_token);

    req.user = refreshed.user;
    return next();
  }

  // Access token valid
  req.user = data.user;
  next();
};
