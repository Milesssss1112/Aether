import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const p = path.join(root, "home.final.html");
let s = fs.readFileSync(p, "utf8");
const before = (s.match(/[\u201C\u201D]/g) || []).length;
s = s
  .replace(/\u201C/g, '"')
  .replace(/\u201D/g, '"')
  .replace(/\u2018/g, "'")
  .replace(/\u2019/g, "'");
fs.writeFileSync(p, s);
console.log("Replaced curly quote pairs (~" + before + " chars) in home.final.html");
