function getRequireList(luacode) {
  let list = [];
  for (let requireMatch of luacode.matchAll(
    /require\s*\(['"](?<name>[^'"]+)['"]\s*\)/g,
  )) {
    list.push(requireMatch.groups.name);
  }
  return list;
}

// getModuleCode(packName): luacode
function getDeps(luacode, getModuleCode, depsTree = [], deep = 0) {
  if (/require\s*\(['"](?<name>[^'"]+)['"]\s*\)/.test(luacode)) {
    let requireList = getRequireList(luacode);
    depsTree[deep] = requireList;
    for (let pack of requireList) {
      getDeps(getModuleCode(pack), getModuleCode, depsTree, deep + 1);
    }
  }
  if (deep === 0) {
    depsTree = depsTree.reverse();
    let treeCache = {};
    //bulding depslist list
    let depsList = [];
    for (let d of depsTree) {
      for (let p of d) {
        if (!treeCache[p]) {
          depsList.push(p);
          treeCache[p] = true;
        }
      }
    }
    return depsList;
  }
}

//replace require with m_pack function call. calling last
function requireReplace(luacode) {
  for (let requireMatch of luacode.matchAll(
    /require\s*\(['"](?<name>[^'"]+)['"]\s*\)/g,
  )) {
    luacode = luacode.replace(requireMatch[0], `m_${requireMatch.groups.name}()`);
  }
  return luacode;
}

function injectDeps(luacode, depsList, getModuleCode) {
  let injectCode = "";
  for (let p of depsList) {
    injectCode = `${injectCode}\n--${p}\nfunction m_${p}()\n${getModuleCode(p)}\nend`;
  }
  luacode = `${injectCode}\n${luacode}`;
  return luacode;
}

// getModuleCode(packName): luacode
export function bundle(luacode, getModuleCode) {
  let deps = getDeps(luacode, getModuleCode)
  luacode = injectDeps(luacode, deps, getModuleCode)
  luacode = requireReplace(luacode)
  return luacode
}
