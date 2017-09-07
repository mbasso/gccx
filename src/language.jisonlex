%%

\s+																		return 'WHITESPACE'

"<"																		return '<'
">"																		return '>'
"/"																		return '/'
"*"																		return '*'
"-"																		return '-'
":"																		return ':'
"!"																		return '!'
"{"																		return '{'
"}"																		return '}'

"VNode"																return 'VNode'
"string"															return 'string'

[a-zA-Z]															return 'CHAR'

<<EOF>>                     					return 'EOF'
(.|\n)                    						return 'ANY'