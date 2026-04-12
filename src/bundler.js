import fs from "node:fs";

export function bundle(luacode, modulesPath) {
  let bundled = luacode;
  for (let importMatch of luacode.matchAll(/import\s+"(?<packName>.+?)"/g)) {
    let exportMatch = fs.readFileSync(modulesPath + match[1] + "/index.lua").matchAll(/export\s+(?<func>function\s+(?<funcName>\w+).+?end)/gs)
    let injectCode = "--import"
    for (let exportMatchCode of exportMatch) {
        injectCode = injectCode + "\n${exportMatchCode.groups.func}"
    }
    
    let bundled = bundled.replace(
      importMatch[0],
      fs.readFileSync(modulesPath + match[1] + "/index.lua"),
    );
  }
  return bundled;
}
