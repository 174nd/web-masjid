export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  href: string;
  category?: string;
  imageUrl: string;
  pinned?: boolean;
};

export const mockNews: NewsItem[] = [
  {
    id: "p-001",
    title: "Kegiatan Akbar Akhir Tahun: Kajian & Santunan",
    excerpt: "Agenda kajian akbar dan santunan jamaah, termasuk rundown dan kebutuhan relawan.",
    date: "2025-12-12",
    href: "/news/kegiatan-akbar-akhir-tahun",
    category: "Kegiatan",
    imageUrl: "/news/news-1.jpg",
    pinned: true,
  },
  {
    id: "p-002",
    title: "Update Renovasi & Pengadaan Fasilitas Masjid",
    excerpt: "Perkembangan renovasi, pengadaan karpet, dan rencana tahap berikutnya.",
    date: "2025-12-05",
    href: "/news/update-renovasi-pengadaan",
    category: "Renovasi",
    imageUrl: "/news/news-2.jpg",
    pinned: true,
  },
  {
    id: "p-003",
    title: "Laporan Transparansi Infak & Pengeluaran Bulanan",
    excerpt: "Ringkasan pemasukan dan pengeluaran bulan ini disajikan secara ringkas.",
    date: "2025-11-28",
    href: "/news/transparansi-bulanan",
    category: "Transparansi",
    imageUrl: "/news/news-3.jpg",
    pinned: true,
  },

  // regular list
  {
    id: "n-101",
    title: "Jadwal Kajian Pekanan",
    excerpt: "Rangkaian kajian pekanan dan pengajar yang mengisi.",
    date: "2025-11-20",
    href: "/news/jadwal-kajian-pekanan",
    category: "Kajian",
    imageUrl: "/news/news-4.jpg",
  },
  {
    id: "n-102",
    title: "Program Qurban: Informasi Pendaftaran",
    excerpt: "Syarat, ketentuan, dan mekanisme pendaftaran program qurban.",
    date: "2025-11-10",
    href: "/news/program-qurban-pendaftaran",
    category: "Qurban",
    imageUrl: "/news/news-5.jpg",
  },
  {
    id: "n-103",
    title: "Kerja Bakti Masjid: Jadwal & Koordinasi",
    excerpt: "Koordinasi relawan kerja bakti untuk kebersihan dan kerapihan area masjid.",
    date: "2025-10-31",
    href: "/news/kerja-bakti-jadwal",
    category: "Kegiatan",
    imageUrl: "/news/news-6.jpg",
  },
  {
    id: "n-104",
    title: "Pengadaan Sound System untuk Kajian",
    excerpt: "Pengadaan perangkat audio untuk meningkatkan kenyamanan kegiatan.",
    date: "2025-10-20",
    href: "/news/pengadaan-sound-system",
    category: "Pengadaan",
    imageUrl: "/news/news-7.jpg",
  },
  {
    id: "n-105",
    title: "Santunan Jumat Berkah",
    excerpt: "Program sosial rutin untuk warga sekitar dan jamaah yang membutuhkan.",
    date: "2025-10-10",
    href: "/news/santunan-jumat-berkah",
    category: "Sosial",
    imageUrl: "/news/news-8.jpg",
  },
];
