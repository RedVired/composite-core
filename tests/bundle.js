import fs from "node:fs";
import * as bundler from "../src/bundler.js";

console.log(bundler.bundle(fs.readFileSync("./a.lua", "utf-8"), "./composite_modules/"));
