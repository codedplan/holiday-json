// scripts/update-holidays.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 💡 발급받은 인증키 (Encoding된 것 사용)
const SERVICE_KEY = "E9p5enYBptZunAoB1oqlsOkP2SIXEqWmZwMrxb4vyqbtgbbSMsjn6fcDsP1VPqkbWG5NIqwPSr1F9bGw41MvHQ%3D%3D";

// 📅 조회할 연도 설정 (올해와 내년)
const years = [2025, 2026];

async function fetchHolidays(year, month) {
  const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?ServiceKey=${SERVICE_KEY}&solYear=${year}&solMonth=${String(month).padStart(2, "0")}`;
  try {
    const res = await axios.get(url, { responseType: "text" });

    const data = res.data;
    const holidays = [];

    // XML 파싱
    const matches = data.matchAll(/<locdate>(\d{8})<\/locdate>/g);
    for (const match of matches) {
      const raw = match[1]; // YYYYMMDD
      const formatted = `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`;
      holidays.push(formatted);
    }

    return holidays;
  } catch (err) {
    console.error(`❌ ${year}-${month} 데이터 요청 실패:`, err.message);
    return [];
  }
}

async function updateHolidaysJson() {
  const allHolidays = new Set();

  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const holidays = await fetchHolidays(year, month);
      holidays.forEach((date) => allHolidays.add(date));
    }
  }

  const sorted = Array.from(allHolidays).sort();

  const outputPath = path.resolve(__dirname, "../public/holidays.json");
  fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2), "utf8");
  console.log(`✅ ${sorted.length}개 휴일 저장 완료: ${outputPath}`);
}

updateHolidaysJson();
