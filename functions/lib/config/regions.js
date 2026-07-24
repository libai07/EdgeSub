const REGIONS = [
  { code: "HK", name: "香港", flag: "🇭🇰", order: 1, keywords: ["🇭🇰","HK","HKG","Hong Kong","HongKong","香港","港服","港区"] },
  { code: "JP", name: "日本", flag: "🇯🇵", order: 2, keywords: ["🇯🇵","JP","JPN","Japan","日本","东京","東京","大阪","名古屋","Tokyo","Osaka","Nagasaki"] },
  { code: "SG", name: "新加坡", flag: "🇸🇬", order: 3, keywords: ["🇸🇬","SG","SGP","Singapore","新加坡","狮城","獅城"] },
  { code: "KR", name: "韩国", flag: "🇰🇷", order: 4, keywords: ["🇰🇷","KR","KOR","Korea","South Korea","韩国","韓國","首尔","首爾","Seoul"] },
  { code: "TW", name: "台湾", flag: "🇹🇼", order: 5, keywords: ["🇹🇼","TW","TWN","Taiwan","台湾","台灣","台北","Taipei"] },
  { code: "CN", name: "中国", flag: "🇨🇳", order: 6, keywords: ["🇨🇳","CN","CHN","China","中国","回国","北京","上海","广州","深圳","杭州","青岛"] },
  { code: "MO", name: "澳门", flag: "🇲🇴", order: 7, keywords: ["🇲🇴","MO","MAC","Macao","Macau","澳门","澳門"] },
  { code: "GAME", name: "游戏", flag: "🎮", order: 8, keywords: ["🎮","游戏","遊戲","GAME","专用","IEPL","IPLC","专线","低倍率"] },
  { code: "TH", name: "泰国", flag: "🇹🇭", order: 20, keywords: ["🇹🇭","TH","THA","Thailand","泰国","泰國","Bangkok","曼谷"] },
  { code: "VN", name: "越南", flag: "🇻🇳", order: 21, keywords: ["🇻🇳","VN","VNM","Vietnam","越南","Hanoi","胡志明"] },
  { code: "MY", name: "马来西亚", flag: "🇲🇾", order: 22, keywords: ["🇲🇾","MY","MYS","Malaysia","马来","Malay","马来西亚","吉隆坡","Kuala Lumpur"] },
  { code: "PH", name: "菲律宾", flag: "🇵🇭", order: 23, keywords: ["🇵🇭","PH","PHL","Philippines","菲律宾","菲律賓","马尼拉","Manila"] },
  { code: "ID", name: "印尼", flag: "🇮🇩", order: 24, keywords: ["🇮🇩","ID","IDN","Indonesia","印尼","雅加达","Jakarta"] },
  { code: "IN", name: "印度", flag: "🇮🇳", order: 25, keywords: ["🇮🇳","IN","IND","India","印度","孟买","Mumbai"] },
  { code: "US", name: "美国", flag: "🇺🇸", order: 30, keywords: ["🇺🇸","US","USA","United States","America","美国","美國","美西","美东","洛杉矶","西雅图","纽约","硅谷","达拉斯","芝加哥","Los Angeles","LAX","Seattle","New York","NYC","San Jose","Dallas","Chicago"] },
  { code: "CA", name: "加拿大", flag: "🇨🇦", order: 31, keywords: ["🇨🇦","CAN","Canada","加拿大","多伦多","温哥华","Toronto","Vancouver"] },
  { code: "GB", name: "英国", flag: "🇬🇧", order: 40, keywords: ["🇬🇧","GB","GBR","United Kingdom","Britain","英国","英國","伦敦","London"] },
  { code: "DE", name: "德国", flag: "🇩🇪", order: 41, keywords: ["🇩🇪","DE","DEU","Germany","Deutschland","德国","德國","法兰克福","Frankfurt","柏林"] },
  { code: "NL", name: "荷兰", flag: "🇳🇱", order: 42, keywords: ["🇳🇱","NL","NLD","Netherlands","荷兰","荷蘭","阿姆斯特丹","Amsterdam"] },
  { code: "FR", name: "法国", flag: "🇫🇷", order: 43, keywords: ["🇫🇷","FR","FRA","France","法国","法國","巴黎","Paris"] },
  { code: "RU", name: "俄罗斯", flag: "🇷🇺", order: 44, keywords: ["🇷🇺","RU","RUS","Russia","俄罗斯","俄羅斯","莫斯科","Moscow"] },
  { code: "CH", name: "瑞士", flag: "🇨🇭", order: 45, keywords: ["🇨🇭","CH","CHE","Switzerland","瑞士","苏黎世","Zurich"] },
  { code: "SE", name: "瑞典", flag: "🇸🇪", order: 46, keywords: ["🇸🇪","SE","SWE","Sweden","瑞典","斯德哥尔摩","Stockholm"] },
  { code: "IT", name: "意大利", flag: "🇮🇹", order: 51, keywords: ["🇮🇹","ITA","Italy","意大利","米兰","Milan"] },
  { code: "ES", name: "西班牙", flag: "🇪🇸", order: 52, keywords: ["🇪🇸","ESP","Spain","西班牙","马德里","Madrid"] },
  { code: "TR", name: "土耳其", flag: "🇹🇷", order: 53, keywords: ["🇹🇷","TUR","Turkey","土耳其","伊斯坦布尔","Istanbul"] },
  { code: "AU", name: "澳大利亚", flag: "🇦🇺", order: 60, keywords: ["🇦🇺","AU","AUS","Australia","澳洲","澳大利亚","悉尼","Sydney"] },
  { code: "BR", name: "巴西", flag: "🇧🇷", order: 70, keywords: ["🇧🇷","BR","BRA","Brazil","巴西","圣保罗","Sao Paulo"] },
  { code: "AE", name: "阿联酋", flag: "🇦🇪", order: 80, keywords: ["🇦🇪","AE","ARE","Emirates","UAE","阿联酋","阿聯酋","迪拜","Dubai"] },
  { code: "IL", name: "以色列", flag: "🇮🇱", order: 81, keywords: ["🇮🇱","IL","ISR","Israel","以色列"] },
  { code: "RELAY", name: "中转", flag: "🔁", order: 90, keywords: ["🔁","中转","中繼","Relay"] },
];

const SHORT_CODE_RE = /^[A-Za-z]{2,4}$/;
const FLAG_RE = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/;

const MATCHERS = REGIONS.map((region) => {
  const patterns = region.keywords.map((kw) => {
    const lower = kw.toLowerCase();
    if (SHORT_CODE_RE.test(kw)) {
      const re = new RegExp(`(^|[^a-z])${escapeRegExp(lower)}([^a-z]|$)`, "i");
      return (norm) => re.test(norm);
    }
    return (norm) => norm.includes(lower);
  });
  return {
    region,
    test: (normalized) => patterns.some((fn) => fn(normalized)),
  };
});

export function detectRegion(name = "") {
  const raw = String(name || "");
  const norm = normalizeForMatch(raw);

  for (const m of MATCHERS) {
    if (m.test(norm)) return m.region;
  }

  if (FLAG_RE.test(raw)) {
    return UNKNOWN_REGION;
  }

  return null;
}

export const UNKNOWN_REGION = { code: "UN", name: "未知", flag: "🌐", order: 98 };

function normalizeForMatch(name) {
  let s = String(name || "");
  try { s = decodeURIComponent(s); } catch {}
  return s.toLowerCase().replace(/[-_]/g, " ");
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}