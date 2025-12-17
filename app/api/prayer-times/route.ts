import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? "Batam";
  const country = searchParams.get("country") ?? "Indonesia";

  // Contoh pakai AlAdhan (tanpa API key).
  // Kamu bisa ganti ke sumber lain kapan pun.
  const url = new URL("https://api.aladhan.com/v1/timingsByCity");
  url.searchParams.set("city", city);
  url.searchParams.set("country", country);
  url.searchParams.set("method", "11"); // metode umum; silakan sesuaikan jika punya preferensi

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch prayer times" }, { status: 500 });
  }

  const json = await res.json();

  // Ambil yang kita butuhkan saja
  const timings = json?.data?.timings ?? {};
  const date = json?.data?.date?.gregorian?.date ?? null;
  const timezone = json?.data?.meta?.timezone ?? "Asia/Jakarta";

  return NextResponse.json({
    city,
    country,
    date,
    timezone,
    timings: {
      Fajr: timings.Fajr,
      Dhuhr: timings.Dhuhr,
      Asr: timings.Asr,
      Maghrib: timings.Maghrib,
      Isha: timings.Isha,
    },
  });
}
