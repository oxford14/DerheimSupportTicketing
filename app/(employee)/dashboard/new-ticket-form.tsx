"use client";

import { useState, useRef, useEffect } from "react";
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
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

const COMMON_ISSUE_PRESETS = [
  "Email reset request", "Password reset request", "Cannot access email", "VPN connection issue",
  "Software installation request", "Hardware issue", "Network connectivity issue", "Account locked",
  "New employee access request", "Application crash or freeze", "Wi‑Fi not connecting",
];

function filterPresets(query: string): string[] {
  if (!query.trim()) return COMMON_ISSUE_PRESETS.slice(0, 8);
  const q = query.trim().toLowerCase();
  return COMMON_ISSUE_PRESETS.filter((preset) => preset.toLowerCase().includes(q)).slice(0, 8);
}

export function NewTicketForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [priority, setPriority] = useState<string>("low");
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const suggestions = filterPresets(title);

  useEffect(() => {
    if (!showSuggestions || suggestions.length === 0) return;
    setHighlightedIndex(0);
  }, [title, showSuggestions, suggestions.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    formData.set("title", title || (formData.get("title") as string) || "");
    const result = await createTicket(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setTitle("");
    setShowSuggestions(false);
    const form = document.getElementById("new-ticket-form") as HTMLFormElement;
    form?.reset();
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Escape") setShowSuggestions(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (e.key === "Enter" && suggestions[highlightedIndex]) {
      e.preventDefault();
      setTitle(suggestions[highlightedIndex]);
      setShowSuggestions(false);
      return;
    }
    if (e.key === "Escape") setShowSuggestions(false);
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        New ticket
      </Typography>
      <Box component="form" id="new-ticket-form" action={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success">Ticket submitted.</Alert>}

        <Box ref={inputRef} sx={{ position: "relative" }}>
          <TextField
            id="title"
            name="title"
            label="Title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleTitleKeyDown}
            required
            placeholder="e.g. Email reset request"
            fullWidth
            size="small"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <List
              ref={suggestionsRef}
              role="listbox"
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "100%",
                mt: 0.5,
                maxHeight: 220,
                overflow: "auto",
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                py: 0,
                zIndex: 10,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 2, py: 1, display: "block", borderBottom: 1, borderColor: "divider" }}>
                Suggested issues
              </Typography>
              {suggestions.map((s, i) => (
                <ListItemButton
                  key={s}
                  role="option"
                  selected={i === highlightedIndex}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => {
                    setTitle(s);
                    setShowSuggestions(false);
                  }}
                  sx={{ py: 1 }}
                >
                  <Typography variant="body2" noWrap>{s}</Typography>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <TextField
          name="description"
          label="Description"
          placeholder="Describe your issue in detail..."
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
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
          <Chip label={PRIORITIES.find((p) => p.value === priority)?.label ?? priority} size="small" color={getPriorityChipColor(priority)} sx={{ fontWeight: 500 }} />
        </Box>

        <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: "flex-start" }}>
          Submit ticket
        </Button>
      </Box>
    </Paper>
  );
}
