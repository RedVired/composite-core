import fs from "fs";

const code = `
a = require("function")

M = {}

M.shmee = function ()
  return "foo"
end

function M.foo ()
  return "foo"
end

return M
`;

function getRequireList(luacode) {
  let list = [];
  for (let requireMatch of luacode.matchAll(
    /require\s*\(['"](?<name>[^'"]+)['"]\s*\)/g,
  )) {
    list.push(requireMatch.groups.name);
  }
  return list;
}

function getDeps(luacode, getModuleCode, depsTree = [], deep = 0) {
  if (/require\s*\(['"](?<name>[^'"]+)['"]\s*\)/.test(luacode)) {
    let requireList = getRequireList(luacode);
    depsTree[deep] = requireList;
    for (let pack of requireList) {
      getDeps(getModuleCode(pack), getModuleCode, depsTree, deep + 1);
    }
  }
  if (deep === 0) {
    depsTree = depsTree.reverse()
    //console.log(depsTree)
    let treeCache = {};
    //bulding depslist list
    let depsList = []
    for (let d of depsTree) {
      for (let p of d) {
        if (!treeCache[p]) {
          depsList.push(p)
          treeCache[p] = true
        }
      }
    }
    /*for (let i = depsTree.length - 1; i >= 0; i--) {
      for (let pidx in depsTree[i]) {
        let p = depsTree[i][pidx];
        if (treeCache[p]) {
          depsTree[i].splice(pidx, 1);
        } else {
          treeCache[p] = true;
        }
      }
    }
    */
    console.log(Object.keys(treeCache))
    return depsList;
  }
}

let depsTree = {};

console.log(
  getDeps(code, (name) => {
    return fs.readFileSync(`./composite_modules/${name}/index.lua`, "utf-8");
  }),
);
//console.log(fs.readFileSync(`./composite_modules/function/index.lua`, "utf-8"))

//array.splice(index, 1)
//var size = Object.keys(myObj).length;