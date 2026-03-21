const https = require("https");

exports.handler = async function (event, context) {
  const end = new Date();
  const start = new Date(end - 3 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 19);

  const usgsUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=02394000&parameterCd=00010&startDT=${fmt(start)}&endDT=${fmt(end)}`;

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(usgsUrl, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error("Failed to parse USGS response")); }
        });
      }).on("error", reject);
    });

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
