"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTicketInternalNote } from "@/lib/actions/admin";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

export function InternalNoteForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await addTicketInternalNote(ticketId, body.trim(), formData);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setBody("");
    form.reset();
    router.refresh();
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      <TextField
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="e.g. Following up—why isn't this resolved yet? Status?"
        multiline
        rows={3}
        required
        size="small"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "warning.light",
            "&.Mui-focused": { bgcolor: "background.paper" },
          },
        }}
      />
      <TextField
        id="note-attachments"
        name="attachments"
        type="file"
        inputProps={{ multiple: true, accept: "image/jpeg,image/png,image/gif,image/webp" }}
        size="small"
        fullWidth
      />
      <Typography variant="caption" color="text.secondary">
        JPEG, PNG, GIF, or WebP. Max 5MB each.
      </Typography>
      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        sx={{ bgcolor: "warning.dark", "&:hover": { bgcolor: "warning.main" } }}
      >
        {submitting ? "Sending…" : "Add internal note"}
      </Button>
    </Box>
  );
}
