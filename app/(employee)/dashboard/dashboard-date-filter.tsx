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

export function DashboardDateFilter({
  dateFrom,
  dateTo,
}: {
  dateFrom?: string;
  dateTo?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setRange = useCallback(
    (from: string | undefined, to: string | undefined) => {
      const next = new URLSearchParams(searchParams);
      if (from) next.set("from", from);
      else next.delete("from");
      if (to) next.set("to", to);
      else next.delete("to");
      router.push(`/dashboard?${next.toString()}`);
    },
    [router, searchParams]
  );

  const today = toYYYYMMDD(new Date());
  const presets = [
    { label: "All time", from: undefined, to: undefined },
    {
      label: "Last 7 days",
      from: toYYYYMMDD(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      to: today,
    },
    {
      label: "Last 30 days",
      from: toYYYYMMDD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      to: today,
    },
    {
      label: "This month",
      from: toYYYYMMDD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      to: today,
    },
  ];

  const isActive = (from: string | undefined, to: string | undefined) =>
    (from ?? "") === (dateFrom ?? "") && (to ?? "") === (dateTo ?? "");

  const activePresetIndex = presets.findIndex((p) => isActive(p.from, p.to));
  const dropdownValue = activePresetIndex >= 0 ? String(activePresetIndex) : "custom";

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="dashboard-date-preset">Date range</InputLabel>
        <Select
          labelId="dashboard-date-preset"
          label="Date range"
          value={dropdownValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "custom") return;
            const p = presets[Number(v)];
            if (p) setRange(p.from, p.to);
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
          slotProps={{ htmlInput: { "aria-label": "From date" } }}
          value={dateFrom ?? ""}
          onChange={(e) => setRange(e.target.value || undefined, dateTo)}
          sx={{ width: 150 }}
        />
        <Typography component="span" variant="body2" color="text.secondary">–</Typography>
        <TextField
          type="date"
          size="small"
          slotProps={{ htmlInput: { "aria-label": "To date" } }}
          value={dateTo ?? ""}
          onChange={(e) => setRange(dateFrom, e.target.value || undefined)}
          sx={{ width: 150 }}
        />
      </Box>
    </Box>
  );
}
