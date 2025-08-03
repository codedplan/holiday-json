const fs = require("fs");
const path = require("path");
const axios = require("axios");
const xml2js = require("xml2js");

const SERVICE_KEY = "E9p5enYBptZunAoB1oqlsOkP2SIXEqWmZwMrxb4vyqbtgbbSMsjn6fcDsP1VPqkbWG5NIqwPSr1F9bGw41MvHQ%3D%3D";

const years = [2025, 2026];

async function fetchHolidays(year, month) {
  const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?ServiceKey=${SERVICE_KEY}&solYear=${year}&solMonth=${String(month).padStart(2, "0")}&numOfRows=100&pageNo=1&_type=xml`;

  try {
    const res = await axios.get(url, { responseType: "text" });

    const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });

    const items = parsed.response.body.items.item;
    if (!items) return [];

    const holidays = Array.isArray(items) ? items : [items];

    return holidays.map((item) => {
      const raw = item.locdate;
      return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`;
    });
  } catch (err) {
    console.error(`❌ ${year}-${String(month).padStart(2, "0")} 데이터 요청 실패: ${err.message}`);
    return [];
  }
}

async function updateHolidaysJson() {
  const allHolidays = new Set();

  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const holidays = await fetchHolidays(year, month);
      holidays.forEach((d) => allHolidays.add(d));
    }
  }

  const sorted = Array.from(allHolidays).sort();
  const outputPath = path.resolve(__dirname, "../public/holidays.json");

  fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2), "utf8");
  console.log(`✅ ${sorted.length}개 휴일 저장 완료: ${outputPath}`);
}

updateHolidaysJson();
