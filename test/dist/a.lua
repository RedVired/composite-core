
--basic
function m_basic()
print("foo")

return "return"
end
--table
function m_table()
m_basic()

mytable = {foo = "foo"}

return mytable
end
--function
function m_function()
t = m_table()
b = m_basic()

local myfunc = function ()
	print("foo")
	return foo
end

return myfunc
end
a = m_function()