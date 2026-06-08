import { NextResponse } from "next/server";

// Simple in-memory cache (offices change rarely) — refresh once a day
let cache: { data: Office[]; ts: number } | null = null;
const ONE_DAY = 24 * 60 * 60 * 1000;

type Office = {
  id: string;
  name: string;
  city: string;
  address: string;
};

export async function GET() {
  if (cache && Date.now() - cache.ts < ONE_DAY) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(
      "https://ee.econt.com/services/Nomenclatures/NomenclaturesService.getOffices.json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: "BGR" }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) throw new Error(`Econt API ${res.status}`);
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offices: Office[] = (data.offices || []).map((o: any) => ({
      id: String(o.id ?? o.code ?? ""),
      name: o.name || "",
      city: o.address?.city?.name || "",
      address: o.address?.fullAddress || o.address?.street || "",
    })).filter((o: Office) => o.name);

    // Sort by city, then office name
    offices.sort((a, b) => a.city.localeCompare(b.city, "bg") || a.name.localeCompare(b.name, "bg"));

    cache = { data: offices, ts: Date.now() };
    return NextResponse.json(offices);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
