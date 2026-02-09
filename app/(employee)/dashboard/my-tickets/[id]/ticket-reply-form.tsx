"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTicketReply } from "@/lib/actions/tickets";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
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
    const result = await addTicketReply(ticketId, body.trim(), formData);
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
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a reply..."
        multiline
        rows={3}
        required
        size="small"
        fullWidth
      />
      <Box>
        <TextField
          id="reply-attachments"
          name="attachments"
          type="file"
          inputProps={{ multiple: true, accept: "image/jpeg,image/png,image/gif,image/webp" }}
          size="small"
          fullWidth
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          JPEG, PNG, GIF, or WebP. Max 5MB each.
        </Typography>
      </Box>
      <Button type="submit" variant="contained" color="primary" disabled={submitting}>
        {submitting ? "Sending…" : "Send reply"}
      </Button>
    </Box>
  );
}
