const DEFAULT_SITE = "02394000";

function resolveSite(event) {
  const raw = event?.queryStringParameters?.site;
  return /^\d{8,15}$/.test(raw ?? "") ? raw : DEFAULT_SITE;
}

export const handler = async function (event) {
  const site = resolveSite(event);
  const usgsUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${site}&parameterCd=00010&period=P3D`;

  try {
    const res = await fetch(usgsUrl);
    if (!res.ok) throw new Error(`USGS API returned ${res.status}`);
    const data = await res.json();

    const series = data?.value?.timeSeries ?? [];
    const ts = series.find(
      (s) => s.variable?.variableCode?.[0]?.value === "00010"
    );

    if (!ts) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No temperature series found", site }),
      };
    }

    const vals = (ts.values?.[0]?.value ?? []).filter(
      (v) => v.value !== "-999999"
    );

    if (!vals.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No valid readings", site }),
      };
    }

    // Aggregate to hourly: group by YYYY-MM-DDTHH, pick reading closest to :00
    const groups = {};
    for (const v of vals) {
      const d = new Date(v.dateTime);
      const key = d.toISOString().slice(0, 13);
      const mins = d.getMinutes();
      if (!groups[key] || mins < groups[key].mins) {
        groups[key] = { mins, value: v };
      }
    }

    const readings = Object.values(groups)
      .map((g) => ({
        tempC: parseFloat(g.value.value),
        dateTime: g.value.dateTime,
      }))
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=900",
      },
      body: JSON.stringify({ readings, site }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
