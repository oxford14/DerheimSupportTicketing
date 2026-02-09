"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

function toYYYYMMDD(d: Date) {
  return d.toISOString().slice(0, 10);
}

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITIES = [
  { value: "", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TicketsFilters({
  currentStatus,
  currentPriority,
  dateFrom,
  dateTo,
  rangeAll,
  basePath = "/admin/tickets",
}: {
  currentStatus?: string;
  currentPriority?: string;
  dateFrom?: string;
  dateTo?: string;
  rangeAll?: boolean;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${basePath}?${next.toString()}`);
  }

  const setDateRange = useCallback(
    (from: string | undefined, to: string | undefined, allTime?: boolean) => {
      const next = new URLSearchParams(searchParams);
      if (allTime) {
        next.set("range", "all");
        next.delete("from");
        next.delete("to");
      } else {
        next.delete("range");
        if (from) next.set("from", from);
        else next.delete("from");
        if (to) next.set("to", to);
        else next.delete("to");
      }
      router.push(`${basePath}?${next.toString()}`);
    },
    [router, searchParams, basePath]
  );

  const today = toYYYYMMDD(new Date());
  const presets = [
    { label: "Today", from: today, to: today, allTime: false },
    { label: "All time", from: undefined, to: undefined, allTime: true },
    {
      label: "Last 7 days",
      from: toYYYYMMDD(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      to: today,
      allTime: false,
    },
    {
      label: "Last 30 days",
      from: toYYYYMMDD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      to: today,
      allTime: false,
    },
    {
      label: "This month",
      from: toYYYYMMDD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      to: today,
      allTime: false,
    },
  ];

  const isActive = (p: (typeof presets)[number]) =>
    p.allTime ? rangeAll : (p.from ?? "") === (dateFrom ?? "") && (p.to ?? "") === (dateTo ?? "");
  const activePresetIndex = presets.findIndex((p) => isActive(p));
  const dropdownValue = activePresetIndex >= 0 ? String(activePresetIndex) : "custom";

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="date-preset-label">Date range</InputLabel>
          <Select
            labelId="date-preset-label"
            label="Date range"
            value={dropdownValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "custom") return;
              const p = presets[Number(v)];
              if (p) setDateRange(p.from, p.to, p.allTime);
            }}
          >
            {presets.map(({ label }, i) => (
              <MenuItem key={label} value={i}>
                {label}
              </MenuItem>
            ))}
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            type="date"
            size="small"
            label="From"
            value={dateFrom ?? ""}
            onChange={(e) => setDateRange(e.target.value || undefined, dateTo)}
            slotProps={{ htmlInput: { "aria-label": "From date" } }}
            sx={{ width: 150 }}
          />
          <Typography component="span" color="text.secondary">–</Typography>
          <TextField
            type="date"
            size="small"
            label="To"
            value={dateTo ?? ""}
            onChange={(e) => setDateRange(dateFrom, e.target.value || undefined)}
            slotProps={{ htmlInput: { "aria-label": "To date" } }}
            sx={{ width: 150 }}
          />
        </Box>
      </Box>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="filter-status">Status</InputLabel>
        <Select
          labelId="filter-status"
          label="Status"
          value={currentStatus ?? ""}
          onChange={(e) => updateFilter("status", e.target.value)}
        >
          {STATUSES.map((s) => (
            <MenuItem key={s.value || "all"} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="filter-priority">Priority</InputLabel>
        <Select
          labelId="filter-priority"
          label="Priority"
          value={currentPriority ?? ""}
          onChange={(e) => updateFilter("priority", e.target.value)}
        >
          {PRIORITIES.map((p) => (
            <MenuItem key={p.value || "all"} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
