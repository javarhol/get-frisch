export const handler = async function (event, context) {
  const usgsUrl = "https://waterservices.usgs.gov/nwis/iv/?format=json&sites=02394000&parameterCd=00010&period=PT3H";

  try {
    const res = await fetch(usgsUrl);
    if (!res.ok) throw new Error(`USGS API returned ${res.status}`);
    const data = await res.json();

    const series = data?.value?.timeSeries ?? [];
    const ts = series.find(
      (s) => s.variable?.variableCode?.[0]?.value === "00010"
    );

    if (!ts) {
      return { statusCode: 404, body: JSON.stringify({ error: "No temperature series found" }) };
    }

    const vals = (ts.values?.[0]?.value ?? []).filter(
      (v) => v.value !== "-999999"
    );

    if (!vals.length) {
      return { statusCode: 404, body: JSON.stringify({ error: "No valid readings" }) };
    }

    const latest = vals[vals.length - 1];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tempC: parseFloat(latest.value),
        dateTime: latest.dateTime,
        siteName: ts.sourceInfo?.siteName ?? "Allatoona Lake",
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
