#!/usr/bin/env python3
"""Býr til src/content/climate.ts úr klukkustundagögnum PVGIS.

Sækir seriescalc-API PVGIS 5.3 (ókeypis, án lykils) fyrir hvern stað, hvern halla
og hvert ár, og meðaltalar niður í dægursveiflu hvers mánaðar (12 × 24 gildi).

  python3 scripts/generate-climate.py > src/content/climate.ts

Vindhraðinn er geymdur sem þriðja rót af meðaltali v³ svo orkuinnihaldið haldist
rétt þegar aflferill vindmyllu er reiknaður (vindafl vex með v³).
"""

import json
import statistics
import sys
import urllib.request
from collections import defaultdict

LOCS = [
    ("reykjavik", "Reykjavík", 64.13, -21.90),
    ("akureyri", "Akureyri", 65.68, -18.09),
    ("egilsstadir", "Egilsstaðir", 65.26, -14.39),
]
TILTS = [15, 35, 60, 90]
YEARS = [2021, 2022, 2023]
BASE = "https://re.jrc.ec.europa.eu/api/v5_3/seriescalc"


def fetch(lat, lon, tilt, year):
    url = (
        f"{BASE}?lat={lat}&lon={lon}&angle={tilt}&aspect=0&pvcalculation=1"
        f"&peakpower=1&loss=14&outputformat=json&startyear={year}&endyear={year}"
    )
    for _ in range(4):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001
            print(f"retry {e}", file=sys.stderr)
    raise SystemExit(f"PVGIS svaraði ekki: {url}")


def arr(rows):
    return "[" + ",".join("[" + ",".join(str(v) for v in row) + "]" for row in rows) + "]"


def main():
    blocks = []
    for slug, name, lat, lon in LOCS:
        solar = {}
        wind_cube = defaultdict(list)
        temp = defaultdict(list)
        wind_mean = defaultdict(list)
        db = ""
        for tilt in TILTS:
            acc = defaultdict(list)
            for year in YEARS:
                data = fetch(lat, lon, tilt, year)
                db = data["inputs"]["meteo_data"]["radiation_db"]
                for h in data["outputs"]["hourly"]:
                    t = h["time"]  # YYYYMMDD:HHMM (UTC = ísl. tími)
                    key = (int(t[4:6]) - 1, int(t[9:11]))
                    acc[key].append(h["P"])
                    if tilt == TILTS[0]:
                        wind_cube[key].append(h["WS10m"] ** 3)
                        wind_mean[key].append(h["WS10m"])
                        temp[key].append(h["T2m"])
            solar[tilt] = [
                [round(statistics.fmean(acc[(m, hr)])) for hr in range(24)] for m in range(12)
            ]
            print(f"{slug} {tilt}° ok", file=sys.stderr)

        wind = [
            [round(statistics.fmean(wind_cube[(m, hr)]) ** (1 / 3), 1) for hr in range(24)]
            for m in range(12)
        ]
        mean10 = round(statistics.fmean([v for vals in wind_mean.values() for v in vals]), 2)
        cube10 = round(sum(sum(row) for row in wind) / 288, 2)
        solar_src = "\n      ".join(f"{t}: {arr(solar[t])}," for t in TILTS)
        blocks.append(
            f"""  {{
    slug: "{slug}",
    name: "{name}",
    lat: {lat},
    lon: {lon},
    db: "{db}",
    windMean10m: {mean10},
    windCubeMean10m: {cube10},
    solar: {{
      {solar_src}
    }},
    wind: {arr(wind)},
    temp: {arr([[round(statistics.fmean(temp[(m, hr)]), 1) for hr in range(24)] for m in range(12)])},
  }}"""
        )
    print("\n".join(blocks))


if __name__ == "__main__":
    main()
