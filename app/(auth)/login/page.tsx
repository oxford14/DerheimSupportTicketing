"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }
      if (res?.ok) {
        // Full page navigation so the new session is picked up (required when using redirect: false, especially in production)
        window.location.href = callbackUrl;
        return;
      }
      // API may have failed (e.g. 500) or returned an unexpected shape
      setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Derheim Support
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your account
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </Box>
    </Paper>
  );
}

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Suspense fallback={<Typography color="text.secondary">Loading…</Typography>}>
        <LoginForm />
      </Suspense>
    </Box>
  );
}
