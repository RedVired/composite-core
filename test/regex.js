import * as luaparse from "luaparse";

const code = `
let = require("exam")

mytable = {
a = 2,
f = function ()
  return "foo"
end
}

myfunc = function ()
	print("foo")
	return foo
end

return myfunc
`;

// Парсим код
const ast = luaparse.parse(code, {ranges: true});

//console.log(ast.body)


for (let i of ast.body) {
  if (i.type == "AssignmentStatement") {
    console.log(i)
    console.log(code.substring(i.init[0].range[0], i.init[0].range[1]))
  }
}
