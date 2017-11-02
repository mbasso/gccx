%%

\s+																		return 'WHITESPACE'

"return"															    return 'return'

"->"																	return '->'

"<"																		return yy.isTagOpen(this.matches.input) ? 'TAG_OPEN' : '<'
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
"'"																		return "'"

[a-zA-Z_][a-zA-Z0-9_]*								return 'IDENTIFIER'

<<EOF>>                     					return 'EOF'
(.|\n)                    						return 'ANY'