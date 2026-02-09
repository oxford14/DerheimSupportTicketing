"use client";

import { useState } from "react";
import { updateUser } from "@/lib/actions/admin";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
] as const;

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

type EditUserDialogProps = {
  user: UserRow;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditUserDialog({ user, open, onClose, onSuccess }: EditUserDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSaving(true);
    const result = await updateUser(user.id, formData);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit user</DialogTitle>
      <Box component="form" action={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            name="email"
            label="Email"
            type="email"
            required
            size="small"
            fullWidth
            defaultValue={user.email}
          />
          <TextField
            name="full_name"
            label="Full name"
            size="small"
            fullWidth
            defaultValue={user.full_name ?? ""}
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="edit-user-role">Role</InputLabel>
            <Select
              name="role"
              labelId="edit-user-role"
              label="Role"
              defaultValue={user.role}
            >
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="password"
            label="New password (leave blank to keep current)"
            type="password"
            size="small"
            fullWidth
            inputProps={{ minLength: 6 }}
            placeholder="••••••••"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
