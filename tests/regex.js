import fs from "node:fs";

const code = fs.readFileSync("./composite_modules/example/index.lua", "utf-8");

const match = code.matchAll(/export\s+(?<func>function\s+(?<funcName>\w+).+?end)/gs);
for (let i of match) {
  console.log(i);
}
