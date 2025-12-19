export type YayasanNews = {
  id: string;
  title: string;
  excerpt: string;
  date: string; // ISO (YYYY-MM-DD)
  href: string;
  category?: string;
  imageUrl?: string;
};

export const mockYayasanNews: YayasanNews[] = [
  {
    id: "yn-001",
    title: "Laporan Program Qurban 1446 H",
    excerpt: "Rekap pelaksanaan qurban, distribusi, dan dokumentasi kegiatan bersama jamaah.",
    date: "2025-12-05",
    href: "/news/laporan-qurban-1446h",
    category: "Qurban",
    imageUrl: "/news/news-1.jpg",
  },
  {
    id: "yn-002",
    title: "Pengadaan Karpet Baru untuk Ruang Utama",
    excerpt: "Pengadaan karpet dilakukan bertahap sesuai prioritas area dan kebutuhan jamaah.",
    date: "2025-11-21",
    href: "/news/pengadaan-karpet",
    category: "Pengadaan",
    imageUrl: "/news/news-2.jpg",
  },
  {
    id: "yn-003",
    title: "Renovasi Area Wudhu Tahap 1",
    excerpt: "Perbaikan aliran air dan tata letak untuk meningkatkan kenyamanan dan kebersihan.",
    date: "2025-11-10",
    href: "/news/renovasi-wudhu-tahap-1",
    category: "Renovasi",
    imageUrl: "/news/news-3.jpg",
  },
  {
    id: "yn-004",
    title: "Program Santunan Jumat Berkah",
    excerpt: "Penyaluran bantuan rutin untuk warga sekitar dan jamaah yang membutuhkan.",
    date: "2025-10-25",
    href: "/news/jumat-berkah",
    category: "Sosial",
    imageUrl: "/news/news-4.jpg",
  },
  {
    id: "yn-005",
    title: "Update Transparansi Infak & Pengeluaran",
    excerpt: "Ringkasan pemasukan dan pengeluaran dipublikasikan untuk menjaga keterbukaan.",
    date: "2025-10-10",
    href: "/news/transparansi-infak",
    category: "Transparansi",
    imageUrl: "/news/news-5.jpg",
  },
  {
    id: "yn-006",
    title: "Pengadaan Sound System untuk Kegiatan Kajian",
    excerpt: "Peningkatan audio dilakukan agar kajian dan kegiatan jamaah lebih nyaman diikuti.",
    date: "2025-09-18",
    href: "/news/pengadaan-sound-system",
    category: "Pengadaan",
    imageUrl: "/news/news-1.jpg",
  },
  {
    id: "yn-007",
    title: "Perbaikan Lampu & Instalasi Listrik Area Serambi",
    excerpt: "Perbaikan dilakukan demi keamanan dan kenyamanan aktivitas jamaah.",
    date: "2025-09-02",
    href: "/news/perbaikan-listrik",
    category: "Perawatan",
    imageUrl: "/news/news-2.jpg",
  },
  {
    id: "yn-008",
    title: "Agenda Kajian Bulanan",
    excerpt: "Jadwal kajian bulanan diumumkan untuk memudahkan jamaah mengikuti kegiatan.",
    date: "2025-08-15",
    href: "/news/agenda-kajian-bulanan",
    category: "Kajian",
    imageUrl: "/news/news-3.jpg",
  },
];
