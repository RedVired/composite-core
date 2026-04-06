import fs from "node:fs";

export function bundle(luacode, modulesPath) {
    let bundled = luacode
    for (let match of luacode.matchAll(/import\s+"(.+?)"/g)) {
        bundled = bundled.replace(match[0], fs.readFileSync(modulesPath + match[1] + "/index.lua"))
        //console.log(match)
    }
    return bundled
}