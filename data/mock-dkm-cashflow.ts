export type CashflowRow = {
  id: string;
  date: string; // YYYY-MM-DD
  ref?: string;
  description: string;
  in: number;
  out: number;
  category?: string;
};

export const mockDkmCashflow: CashflowRow[] = [
  {
    id: "cf-001",
    date: "2025-12-10",
    ref: "INF-001",
    description: "Infak Jumat",
    in: 3500000,
    out: 0,
    category: "Infak",
  },
  {
    id: "cf-002",
    date: "2025-12-11",
    ref: "OPR-019",
    description: "Pembelian perlengkapan kebersihan",
    in: 0,
    out: 275000,
    category: "Operasional",
  },
  {
    id: "cf-003",
    date: "2025-12-12",
    ref: "DON-004",
    description: "Donasi Jamaah (Renovasi)",
    in: 5000000,
    out: 0,
    category: "Donasi",
  },
  {
    id: "cf-004",
    date: "2025-12-13",
    ref: "REN-006",
    description: "Biaya tukang renovasi tahap 1",
    in: 0,
    out: 1800000,
    category: "Renovasi",
  },
  {
    id: "cf-005",
    date: "2025-12-14",
    ref: "UTL-003",
    description: "Tagihan listrik",
    in: 0,
    out: 920000,
    category: "Utilitas",
  },
  {
    id: "cf-006",
    date: "2025-12-15",
    ref: "INF-002",
    description: "Infak Harian",
    in: 950000,
    out: 0,
    category: "Infak",
  },
  {
    id: "cf-007",
    date: "2025-12-16",
    ref: "OPR-020",
    description: "Konsumsi kegiatan kajian",
    in: 0,
    out: 430000,
    category: "Operasional",
  },
  {
    id: "cf-008",
    date: "2025-12-17",
    ref: "DON-005",
    description: "Donasi karpet",
    in: 2500000,
    out: 0,
    category: "Pengadaan",
  },
  // tambahkan sebanyak yang kamu butuh untuk test pagination
];
