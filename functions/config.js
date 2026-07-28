import { normalizePath } from "./utils.js";

const DEFAULT_REGIONS = [
  { code: "HK", name: "香港", flag: "🇭🇰", order: 1, kw: ["🇭🇰","HK","HKG","Hong Kong","HongKong","香港","港服","港区"] },
  { code: "JP", name: "日本", flag: "🇯🇵", order: 2, kw: ["🇯🇵","JP","JPN","Japan","日本","东京","東京","大阪","名古屋","Tokyo","Osaka","Nagoya"] },
  { code: "SG", name: "新加坡", flag: "🇸🇬", order: 3, kw: ["🇸🇬","SG","SGP","Singapore","新加坡","狮城","獅城"] },
  { code: "KR", name: "韩国", flag: "🇰🇷", order: 4, kw: ["🇰🇷","KR","KOR","Korea","South Korea","韩国","韓國","首尔","首爾","Seoul","釜山","Busan"] },
  { code: "TW", name: "台湾", flag: "🇹🇼", order: 5, kw: ["🇹🇼","TW","TWN","Taiwan","台湾","台灣","台北","Taipei"] },
  { code: "US", name: "美国", flag: "🇺🇸", order: 6, kw: ["🇺🇸","US","USA","United States","America","美国","美國","美西","美东","洛杉矶","西雅图","纽约","芝加哥","达拉斯","硅谷","迈阿密","Los Angeles","Seattle","New York","Chicago","Dallas","Miami","San Jose","LAX","NYC"] },
  { code: "CA", name: "加拿大", flag: "🇨🇦", order: 7, kw: ["🇨🇦","CA","CAN","Canada","加拿大","温哥华","多伦多","蒙特利尔","Vancouver","Toronto","Montreal"] },
  { code: "GB", name: "英国", flag: "🇬🇧", order: 8, kw: ["🇬🇧","GB","GBR","United Kingdom","Britain","UK","英国","英國","伦敦","London","曼彻斯特","Manchester"] },
  { code: "DE", name: "德国", flag: "🇩🇪", order: 9, kw: ["🇩🇪","DE","DEU","Germany","Deutschland","德国","德國","法兰克福","Frankfurt","柏林","Berlin","慕尼黑","Munich"] },
  { code: "FR", name: "法国", flag: "🇫🇷", order: 10, kw: ["🇫🇷","FR","FRA","France","法国","法國","巴黎","Paris","马赛","Marseille"] },
  { code: "NL", name: "荷兰", flag: "🇳🇱", order: 11, kw: ["🇳🇱","NL","NLD","Netherlands","Holland","荷兰","荷蘭","阿姆斯特丹","Amsterdam"] },
  { code: "AU", name: "澳大利亚", flag: "🇦🇺", order: 12, kw: ["🇦🇺","AU","AUS","Australia","澳大利亚","澳洲","悉尼","墨尔本","Sydney","Melbourne","布里斯班","Brisbane"] },
  { code: "BR", name: "巴西", flag: "🇧🇷", order: 13, kw: ["🇧🇷","BR","BRA","Brazil","巴西","圣保罗","São Paulo","Sao Paulo","里约","Rio","Rio de Janeiro"] },
  { code: "IN", name: "印度", flag: "🇮🇳", order: 14, kw: ["🇮🇳","IN","IND","India","印度","孟买","新德里","Mumbai","Bombay","New Delhi","班加罗尔","Bangalore"] },
  { code: "AE", name: "阿联酋", flag: "🇦🇪", order: 15, kw: ["🇦🇪","AE","ARE","UAE","United Arab Emirates","阿联酋","阿聯酋","迪拜","Dubai","阿布扎比","Abu Dhabi"] },
  { code: "SE", name: "瑞典", flag: "🇸🇪", order: 16, kw: ["🇸🇪","SE","SWE","Sweden","瑞典","斯德哥尔摩","Stockholm"] },
  { code: "IT", name: "意大利", flag: "🇮🇹", order: 17, kw: ["🇮🇹","IT","ITA","Italy","意大利","米兰","Milan","Milano","罗马","Rome","Roma"] },
  { code: "ES", name: "西班牙", flag: "🇪🇸", order: 18, kw: ["🇪🇸","ES","ESP","Spain","西班牙","马德里","Madrid","巴塞罗那","Barcelona"] },
  { code: "CH", name: "瑞士", flag: "🇨🇭", order: 19, kw: ["🇨🇭","CH","CHE","Switzerland","瑞士","苏黎世","Zurich","日内瓦","Geneva","Genève"] },
  { code: "TH", name: "泰国", flag: "🇹🇭", order: 20, kw: ["🇹🇭","TH","THA","Thailand","泰国","泰國","曼谷","Bangkok"] },
  { code: "MY", name: "马来西亚", flag: "🇲🇾", order: 21, kw: ["🇲🇾","MY","MYS","Malaysia","马来西亚","馬來西亞","吉隆坡","Kuala Lumpur"] },
  { code: "ID", name: "印尼", flag: "🇮🇩", order: 22, kw: ["🇮🇩","ID","IDN","Indonesia","印尼","印度尼西亚","雅加达","Jakarta"] },
  { code: "VN", name: "越南", flag: "🇻🇳", order: 23, kw: ["🇻🇳","VN","VNM","Vietnam","越南","河内","胡志明","Hanoi","Ho Chi Minh"] },
  { code: "PH", name: "菲律宾", flag: "🇵🇭", order: 24, kw: ["🇵🇭","PH","PHL","Philippines","菲律宾","馬尼拉","马尼拉","Manila"] },
  { code: "TR", name: "土耳其", flag: "🇹🇷", order: 25, kw: ["🇹🇷","TR","TUR","Turkey","土耳其","伊斯坦布尔","Istanbul","安卡拉","Ankara"] },
  { code: "MX", name: "墨西哥", flag: "🇲🇽", order: 26, kw: ["🇲🇽","MX","MEX","Mexico","墨西哥","墨西哥城","Mexico City"] },
  { code: "ZA", name: "南非", flag: "🇿🇦", order: 27, kw: ["🇿🇦","ZA","ZAF","South Africa","南非","约翰内斯堡","开普敦","Johannesburg","Cape Town"] },
  { code: "AR", name: "阿根廷", flag: "🇦🇷", order: 28, kw: ["🇦🇷","AR","ARG","Argentina","阿根廷","布宜诺斯艾利斯","Buenos Aires"] },
  { code: "NO", name: "挪威", flag: "🇳🇴", order: 29, kw: ["🇳🇴","NO","NOR","Norway","挪威","奥斯陆","Oslo"] },
  { code: "RU", name: "俄罗斯", flag: "🇷🇺", order: 30, kw: ["🇷🇺","RU","RUS","Russia","俄罗斯","俄国","莫斯科","圣彼得堡","Moscow","St Petersburg","Saint Petersburg"] },
];

const UNKNOWN = { code: "UN", name: "未知", flag: "🌐", order: 99, kw: [] };

function loadCustom(env) {
  const raw = String(env.REGIONS_JSON || "").trim();
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter(r => r.code && r.name && r.flag && typeof r.order === "number" && Array.isArray(r.kw));
  } catch {}
  return [];
}

export function getRegions(env) {
  return [...loadCustom(env), ...DEFAULT_REGIONS].sort((a,b) => a.order - b.order);
}

export function matchRegion(name, regions) {
  const norm = decodeURIComponent(String(name || "")).toLowerCase().replace(/[-_]/g, " ");
  for (const r of regions) {
    for (const k of r.kw) {
      const lk = k.toLowerCase();
      if (/^[a-z0-9]{2,6}$/i.test(k)) {
        if (new RegExp(`(^|[^a-z])${lk}([^a-z]|$)`, "i").test(norm)) return r;
      } else if (norm.includes(lk)) return r;
    }
  }
  return UNKNOWN;
}

export function getConfig(env) {
  return {
    subPath: normalizePath(env.SUB_PATH),
    token: String(env.SUB_TOKEN || "").trim(),
    filter: String(env.FILTER || "").trim().split(/\s+/).filter(Boolean),
    title: String(env.SUB_TITLE || "").trim() || "EdgeSub",
    dnsRemote: String(env.DNS_REMOTE_SERVER || "dns.google").trim(),
    dnsDirect: String(env.DNS_DIRECT_SERVER || "223.5.5.5").trim(),
    tunInterface: String(env.TUN_INTERFACE_NAME || "tun0").trim(),
  };
}