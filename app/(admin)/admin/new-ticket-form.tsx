"use client";

import { useState } from "react";
import { createTicket } from "@/lib/actions/tickets";
import { getPriorityChipColor } from "@/lib/priority-status-styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

const SOURCES = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "portal", label: "Portal" },
  { value: "other", label: "Other" },
] as const;

export function NewAdminTicketForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [priority, setPriority] = useState<string>("low");
  const [source, setSource] = useState<string>("phone");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    formData.set("source", source);
    formData.set("priority", priority);

    const result = await createTicket(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    const form = document.getElementById("admin-new-ticket-form") as HTMLFormElement;
    form?.reset();
    setPriority("low");
    setSource("phone");
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        New ticket
      </Typography>
      <Box component="form" id="admin-new-ticket-form" action={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success">Ticket created.</Alert>}

        <TextField
          id="title"
          name="title"
          label="Title"
          required
          placeholder="e.g. Printer not working"
          fullWidth
          size="small"
          autoComplete="off"
        />

        <TextField
          name="description"
          label="Description"
          placeholder="Add any details you received from the user..."
          multiline
          rows={4}
          fullWidth
          size="small"
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Attach photos</Typography>
          <TextField
            name="attachments"
            type="file"
            inputProps={{ accept: "image/jpeg,image/png,image/gif,image/webp", multiple: true }}
            fullWidth
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            JPEG, PNG, GIF, or WebP. Max 5MB each.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="source-label">Source</InputLabel>
            <Select
              name="source"
              labelId="source-label"
              label="Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            >
              {SOURCES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              name="priority"
              labelId="priority-label"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            label={PRIORITIES.find((p) => p.value === priority)?.label ?? priority}
            size="small"
            color={getPriorityChipColor(priority)}
            sx={{ fontWeight: 500 }}
          />
        </Box>

        <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: "flex-start" }}>
          Create ticket
        </Button>
      </Box>
    </Paper>
  );
}

