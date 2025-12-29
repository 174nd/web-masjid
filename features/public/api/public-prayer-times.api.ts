export type PublicPrayerTimesTimings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type PublicPrayerTimesResponse = {
  city: string;
  country: string;
  date: string | null;
  timezone: string;
  timings: PublicPrayerTimesTimings;
};

export async function getPublicPrayerTimes({
  city,
  country,
  signal,
}: {
  city: string;
  country: string;
  signal?: AbortSignal;
}): Promise<PublicPrayerTimesResponse> {
  const usp = new URLSearchParams();
  usp.set("city", city);
  usp.set("country", country);

  const res = await fetch(`/api/prayer-times?${usp.toString()}`, {
    method: "GET",
    signal,
  });

  const data = (await res.json().catch(() => null)) as PublicPrayerTimesResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil jadwal sholat.");

  return data as PublicPrayerTimesResponse;
}
