export default async (req, context) => {
  const end = new Date();
  const start = new Date(end - 3 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 19);

  const usgsUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=02393500&parameterCd=00010&startDT=${fmt(start)}&endDT=${fmt(end)}`;

  try {
    const res = await fetch(usgsUrl);
    if (!res.ok) throw new Error(`USGS responded with ${res.status}`);
    const data = await res.json();

    const series = data?.value?.timeSeries ?? [];
    const ts = series.find(
      (s) => s.variable?.variableCode?.[0]?.value === "00010"
    );

    if (!ts) {
      return Response.json({ error: "No temperature series found" }, { status: 404 });
    }

    const vals = (ts.values?.[0]?.value ?? []).filter(
      (v) => v.value !== "-999999"
    );

    if (!vals.length) {
      return Response.json({ error: "No valid readings" }, { status: 404 });
    }

    const latest = vals[vals.length - 1];

    return Response.json({
      tempC: parseFloat(latest.value),
      dateTime: latest.dateTime,
      siteName: ts.sourceInfo?.siteName ?? "Allatoona Lake",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

export const config = { path: "/api/temp" };
