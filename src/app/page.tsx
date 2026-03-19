"use client";

/**
 * Demo page showing the Google Maps component with a synced left panel.
 *
 * Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file to enable the map.
 */

import { MarkerData } from "@/components/Map/Map";
import MapClient from "@/components/Map/MapClient";

const SAMPLE_MARKERS: MarkerData[] = [
  {
    id: "1",
    lat: 46.2044,
    lng: 6.1432,
    title: "Bel-Air",
    description: "Central Geneva stop near the old town and shopping district.",
  },
  {
    id: "2",
    lat: 46.2067,
    lng: 6.1462,
    title: "Rive",
    description:
      "Busy lakeside transit hub connecting the city center to the east.",
  },
  {
    id: "3",
    lat: 46.2096,
    lng: 6.1423,
    title: "Molard",
    description: "Historic square with dense foot traffic and retail frontage.",
  },
  {
    id: "4",
    lat: 46.1987,
    lng: 6.1355,
    title: "Plainpalais",
    description:
      "Student-heavy district with markets, trams, and civic events.",
  },
  {
    id: "5",
    lat: 46.2015,
    lng: 6.1284,
    title: "Uni Mail",
    description:
      "University quarter with broad sidewalks and steady daytime demand.",
  },
  {
    id: "6",
    lat: 46.2124,
    lng: 6.1545,
    title: "Eaux-Vives Gare",
    description: "Modern station area with dense residential blocks nearby.",
  },
  {
    id: "7",
    lat: 46.2155,
    lng: 6.1531,
    title: "Parc La Grange",
    description: "Green pocket above the lake with seasonal tourist activity.",
  },
  {
    id: "8",
    lat: 46.2178,
    lng: 6.1477,
    title: "Baby-Plage",
    description: "Popular waterfront access point with strong summer footfall.",
  },
  {
    id: "9",
    lat: 46.2108,
    lng: 6.1311,
    title: "Cornavin",
    description:
      "Main rail station and one of the busiest interchanges in Geneva.",
  },
  {
    id: "10",
    lat: 46.2149,
    lng: 6.1106,
    title: "Nations",
    description:
      "International district with embassies, NGOs, and conference traffic.",
  },
  {
    id: "11",
    lat: 46.2112,
    lng: 6.1167,
    title: "Botanic Garden",
    description: "Calmer lakeside edge with family-oriented destinations.",
  },
  {
    id: "12",
    lat: 46.2061,
    lng: 6.1145,
    title: "Pâquis",
    description:
      "Dense mixed-use neighborhood between the station and the lake.",
  },
  {
    id: "13",
    lat: 46.1991,
    lng: 6.1487,
    title: "Jet d'Eau",
    description:
      "Iconic waterfront landmark with heavy visitor demand all year.",
  },
  {
    id: "14",
    lat: 46.1953,
    lng: 6.1516,
    title: "Parc des Eaux-Vives",
    description:
      "Residential edge with gardens and event venues near the lake.",
  },
  {
    id: "15",
    lat: 46.1934,
    lng: 6.1391,
    title: "Bains des Pâquis",
    description:
      "Highly visited public bathing pier and food spot on the harbor.",
  },
  {
    id: "16",
    lat: 46.2078,
    lng: 6.1599,
    title: "Grange-Canal",
    description: "Eastern corridor with residential density and local retail.",
  },
  {
    id: "17",
    lat: 46.1879,
    lng: 6.1668,
    title: "Chêne-Bourg",
    description:
      "Outer Geneva node tying urban neighborhoods to suburban flows.",
  },
  {
    id: "18",
    lat: 46.1938,
    lng: 6.1218,
    title: "Acacias",
    description:
      "Fast-changing district with offices, housing, and tram access.",
  },
  {
    id: "19",
    lat: 46.1865,
    lng: 6.1328,
    title: "Carouge Marché",
    description:
      "Compact artisan quarter just south of Geneva with strong local identity.",
  },
  {
    id: "20",
    lat: 46.2204,
    lng: 6.0962,
    title: "Petit-Saconnex",
    description:
      "Northwest residential zone with schools, parks, and local services.",
  },
];

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col">
      <MapClient
        markers={SAMPLE_MARKERS}
        defaultCenter={{ lat: 46.2044, lng: 6.1432 }}
        defaultZoom={13}
        renderMarker={({ marker, isSelected }) => (
          <article
            className={[
              "grid min-w-47.5 max-w-60 gap-1.5 rounded-2xl border border-slate-900/10 bg-white/95 px-3.5 py-3 text-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.18)] backdrop-blur-sm transition duration-200",
              "origin-bottom hover:-translate-y-1 hover:scale-[1.02] hover:border-blue-600/45 hover:shadow-[0_18px_36px_rgba(37,99,235,0.24)]",
              isSelected &&
                "-translate-y-1 scale-[1.02] border-blue-600/45 shadow-[0_18px_36px_rgba(37,99,235,0.24)]",
            ].join(" ")}
          >
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-blue-600">
              Featured stop
            </span>
            {marker.title ? (
              <h2 className="text-base font-bold leading-tight">
                {marker.title}
              </h2>
            ) : null}
            {marker.description ? (
              <p className="text-[0.78rem] leading-[1.45] text-slate-600">
                {marker.description}
              </p>
            ) : null}
            <span className="text-[0.72rem] tabular-nums text-slate-500">
              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
            </span>
          </article>
        )}
      />
    </main>
  );
}
