import fs from "node:fs";
import path from "node:path";

const YEARS = (process.env.YEARS || String(new Date().getFullYear()))
  .split(",").map(s => s.trim()).filter(Boolean);

const OUT_DIR = "data";
const RAMADAN_DIR = (year) => path.join(OUT_DIR, "ramadan", String(year));

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function writeJSON(fp, obj){
  ensureDir(path.dirname(fp));
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2), "utf8");
}
function trimHHMM(t){
  if (!t || typeof t !== "string") return "";
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
}
async function fetchJSON(url){
  const r = await fetch(url, { headers: { "Accept":"application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}

async function main(){
  ensureDir(OUT_DIR);

  // 1) zones list (negeri/daerah/jakimCode) untuk dropdown
  const zones = await fetchJSON("https://api.waktusolat.app/zones");
  writeJSON(path.join(OUT_DIR, "zones.json"), zones);

  const codes = zones.map(z => z.jakimCode).filter(Boolean);

  for (const year of YEARS){
    console.log("Building year:", year);
    ensureDir(RAMADAN_DIR(year));

    for (const zone of codes){
      const u = new URL("https://www.e-solat.gov.my/index.php");
      u.searchParams.set("r", "esolatApi/takwimsolat");
      u.searchParams.set("zone", zone);
      u.searchParams.set("period", "year");
      u.searchParams.set("year", year);

      try{
        const data = await fetchJSON(u.toString());
        const list = data?.prayerTime || [];

        const rows = list
          .filter(x => typeof x?.hijri === "string" && x.hijri.split("-")[1] === "09")
          .map((x,i)=>({
            no: i+1,
            hijri: x.hijri,
            date: x.date,
            day: x.day,
            imsak: trimHHMM(x.imsak),    // rasmi
            fajr: trimHHMM(x.fajr),      // rasmi
            maghrib: trimHHMM(x.maghrib) // rasmi
          }));

        writeJSON(path.join(RAMADAN_DIR(year), `${zone}.json`), {
          source: "e-solat.gov.my (JAKIM)",
          zone,
          year: Number(year),
          count: rows.length,
          rows
        });

        console.log(" OK", zone, rows.length);
      } catch (e){
        writeJSON(path.join(RAMADAN_DIR(year), `${zone}.json`), {
          source: "e-solat.gov.my (JAKIM)",
          zone,
          year: Number(year),
          error: String(e?.message || e),
          count: 0,
          rows: []
        });
        console.log(" FAIL", zone, e.message);
      }
    }
  }
}

main();
