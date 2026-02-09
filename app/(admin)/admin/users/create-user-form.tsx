"use client";

import { useState } from "react";
import { createUser } from "@/lib/actions/admin";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
] as const;

export function CreateUserForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    const result = await createUser(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    const form = document.getElementById("create-user-form") as HTMLFormElement;
    form?.reset();
  }

  return (
    <Box
      component="form"
      id="create-user-form"
      action={handleSubmit}
      sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2, alignItems: "end" }}
    >
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ gridColumn: "1 / -1" }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ gridColumn: "1 / -1" }}>
          User created.
        </Alert>
      )}
      <TextField name="email" label="Email" type="email" required size="small" fullWidth />
      <TextField name="password" label="Password" type="password" required inputProps={{ minLength: 6 }} size="small" fullWidth />
      <TextField name="full_name" label="Full name" size="small" fullWidth />
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
        <FormControl size="small" fullWidth>
          <InputLabel id="create-user-role">Role</InputLabel>
          <Select name="role" labelId="create-user-role" label="Role" defaultValue="employee">
            {ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Add user
        </Button>
      </Box>
    </Box>
  );
}
