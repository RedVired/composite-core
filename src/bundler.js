import fs from "node:fs";
import * as luaparse from "luaparse";

export function bundle(luacode, modulesPath) {
  let bundled = luacode;
  //get import list
  let importList = {};
  for (let importMatch of luacode.matchAll(
    /import\s+(?<imports>.+)\sfrom\s+"(?<packName>.+)"/g,
  )) {
    importList[importMatch.groups.packName] = [];
    //one element to import
    if (!/[{}]/g.test(importMatch.groups.imports)) {
      importList[importMatch.groups.packName].push(importMatch.groups.imports);
    } else if (/{(.+)}/g.test(importMatch.groups.imports)) {
      //list of elements
      let elementMatch = importMatch.groups.imports.matchAll(/[^{},\s]+/g);
      for (let element of elementMatch) {
        importList[importMatch.groups.packName].push(element[0]);
      }
    }
  }
  //bundling
  let injectCode = "--import ";
  for (let pack in importList) {
    for (let element of importList[pack]) {
      let rawCode;
      try {
        rawCode = fs.readFileSync(modulesPath + pack + "/index.lua", "utf-8");
      } catch (error) {
        console.error(`cannot read ${modulesPath + pack + "/index.lua"}`);
      }
      //creating regexp whith function name
      let funcRegex = new RegExp(
        `export\\s+(?<func>function\\s+${element}.+?end)`,
        "s",
      );
      if (funcRegex.test(rawCode)) {
        injectCode += "\n" + rawCode.match(funcRegex).groups.func;
      }
      console.log(funcRegex);
    }
  }
  injectCode += "\n--import end\n";

  for (let importMatch of luacode.matchAll(/.*import.+/g)) {
    bundled = bundled.replace(importMatch[0], "");
  }

  bundled = injectCode + bundled;

  return bundled;
}

export function getRequireList(luacode) {
  let list = [];
  for (let requireMatch of luacode.matchAll(
    /require\s*\(['"](?<name>[^'"]+)['"]\s*\)/g,
  )) {
    list.push(requireMatch.groups.name);
  }
  return list;
}

export function getExport(luacode) {
  //finding export "return"
  const ast = luaparse.parse(luacode, {ranges: true});
  let returnName;
  for (let i of ast.body) {
    if (i.type == "ReturnStatement") {
      returnName = i.arguments[0].name;
    }
  }
  //getting export code
  let retunCode;
  for (let i of ast.body) {
    if (i.type == "AssignmentStatement" && i.variables[0].name == returnName) {
      try {
        retunCode = luacode.substring(i.init[0].range[0], i.init[0].range[1]);
      } catch (error) {
        console.log("пиздец: " + error)
        console.log(i.init[0])
      }
      
    }
  }
  return retunCode;
}

//importCode - obj {"name": "code"}
export function requireReplace(luacode, importCode = {}) {
  for (let requireMatch of luacode.matchAll(
    /require\s*\(['"](?<name>[^'"]+)['"]\s*\)/g,
  )) {
    luacode = luacode.replace(requireMatch[0], importCode[requireMatch.groups.name]);
  }
  return luacode;
}
