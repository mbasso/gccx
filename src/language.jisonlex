%%

\s+																		return 'WHITESPACE'

"<"																		return '<'
">"																		return '>'
"/"																		return '/'
"-"																		return '-'
":"																		return ':'
"!"																		return '!'
"{"																		return '{'
"}"																		return '}'

[a-z]																	return 'LOWERCASE_CHAR'

<<EOF>>                     					return 'EOF'
(.|\n)                    						return 'ANY'