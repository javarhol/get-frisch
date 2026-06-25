// USGS does not offer a free-text site-name search. The site service does
// accept a state code + filters for sites that actively report a parameter,
// so we fetch the (small) list of temperature-reporting sites in a state and
// filter by name on our side.

function parseRdb(text) {
  const lines = text.split("\n").filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) return [];
  const header = lines[0].split("\t");
  // lines[1] is the column-format row ("5s\t15s\t..."), skip it.
  const idx = (name) => header.indexOf(name);
  const iSite = idx("site_no");
  const iName = idx("station_nm");
  const iLat = idx("dec_lat_va");
  const iLng = idx("dec_long_va");
  const out = [];
  for (let i = 2; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length <= iSite) continue;
    out.push({
      id: cols[iSite],
      name: cols[iName] ?? "",
      lat: parseFloat(cols[iLat]) || null,
      lng: parseFloat(cols[iLng]) || null,
    });
  }
  return out;
}

export const handler = async function (event) {
  const state = (event?.queryStringParameters?.state ?? "").trim().toUpperCase();
  const q = (event?.queryStringParameters?.q ?? "").trim().toLowerCase();

  if (!/^[A-Z]{2}$/.test(state)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "state (2-letter code) is required" }),
    };
  }

  const url =
    `https://waterservices.usgs.gov/nwis/site/?format=rdb` +
    `&stateCd=${state}` +
    `&siteStatus=active` +
    `&hasDataTypeCd=iv` +
    `&parameterCd=00010`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`USGS site service returned ${res.status}`);
    const text = await res.text();
    let sites = parseRdb(text).map((s) => ({ ...s, state }));

    if (q) {
      sites = sites.filter(
        (s) => s.name.toLowerCase().includes(q) || s.id.includes(q)
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
      body: JSON.stringify({ sites: sites.slice(0, 50) }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
