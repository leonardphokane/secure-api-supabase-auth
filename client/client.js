import fetch from "node-fetch";

// Paste the fresh tokens you just received from /auth/login
let accessToken = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjA0ZDA4OWI1LTc4MWYtNGY4ZC1iNThhLTNhMWI4ZjE5MzQzOSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2l5Ym9hanZsaG50c2t1ZWVqamNjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmM2NiNWQ1Mi1kNTVjLTRkMmYtOGYxZi1mOTAxYjc3Y2YwODciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkxNTAwNDkwLCJpYXQiOjE3OTE0OTY4OTAsImVtYWlsIjoibGVvbmFyZHBob2thbmUxQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzkxNDk2ODkwfV0sInNlc3Npb25faWQiOiIwMTYyNGMzOS1lZmRiLTQ2MWYtODI5NS0yZDdjODMxNTBmOTkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.LJgc2KhUdoFzVYIP0053kxSRwBBdwaRZxfUeLqTM4RUCuimuW3OABRMSZ_KDsx43vQ13uvvIEaru3vEpCc_DZg";
let refreshToken = "cl2tzpfqtook";

async function callProtected() {
  const res = await fetch("http://localhost:3000/protected/profile", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "X-Refresh-Token": refreshToken,
    },
  });

  // Capture new tokens if middleware refreshed
  const newAccess = res.headers.get("x-access-token");
  const newRefresh = res.headers.get("x-refresh-token");

  if (newAccess && newRefresh) {
    accessToken = newAccess;
    refreshToken = newRefresh;
    console.log("🔄 Tokens refreshed automatically");
  }

  const data = await res.json();
  console.log("Protected response:", data);
}

callProtected();
