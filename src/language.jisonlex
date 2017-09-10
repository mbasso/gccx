%%

\s+																		return 'WHITESPACE'

"VNode"																return 'VNode'
"string"															return 'string'

"->"																	return '->'

"<"																		return '<'
">"																		return '>'
"/"																		return '/'
"*"																		return '*'
"."																		return '.'
"-"																		return '-'
":"																		return ':'
"!"																		return '!'
"="																		return '='
"{"																		return '{'
"}"																		return '}'
"["																		return '['
"]"																		return ']'
"("																		return '('
")"																		return ')'

\\																		return '\\'
\"																		return '"'

[a-zA-Z_][a-zA-Z0-9_]*								return 'IDENTIFIER'

<<EOF>>                     					return 'EOF'
(.|\n)                    						return 'ANY'