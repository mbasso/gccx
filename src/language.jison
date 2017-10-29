%{
    function yyerror(line, msg) {
        throw new Error('Error while parsing CPX code at line ' + line + ': ' + msg);
    }
%}

%start file

%%

file
    : EOF
        { return ''; }
    | code EOF
        { return $1.trim(); }
    ;

code
    :
        { $$ = ''; }

    // copy
    
    | code safeChar
        { $$ = $1 + $2; }
    | code "'"
        { $$ = $1 + $2; }
    | code space
        { $$ = $1 + $2; }

    // escape

    | code '"' doubleQuoteString '"'
        { $$ = $1 + $2 + $3 + $4; }
    | code "{" code "}"
        { $$ = $1 + $2 + $3 + $4; }
    | code ">"
        { $$ = $1 + $2; }
    | code "<"
        { $$ = $1 + $2; }
    | code tagOpen tagOpen
        { $$ = $1 + $2 + $3; }

    | code IDENTIFIER space "<"
        { $$ = $1 + $2 + $3 + $4; }
    | code IDENTIFIER "<"
        { $$ = $1 + $2 + $3; }
    | code IDENTIFIER space tagOpen tagOpen
        { $$ = $1 + $2 + $3 + $4 + $5; }
    | code IDENTIFIER tagOpen tagOpen
        { $$ = $1 + $2 + $3 + $4; }
    | code IDENTIFIER space tagOpen code ">"
        { $$ = $1 + $2 + $3 + $4 + $5 + $6; }
    | code IDENTIFIER tagOpen code ">"
        { $$ = $1 + $2 + $3 + $4 + $5; }

    | code IDENTIFIER space
        { $$ = $1 + $2 + $3; }

    // CPX

    | code CPXElement
        { $$ = $1 + yy.createVNode($2); }
    ;

CPXElement
    : CPXSelfClosingElement
    | CPXOpeningElement space CPXChildren space CPXClosingElement
        %{
            if ($1.sel !== $5) {
                yyerror(yylineno, 'open tag "' + yy.getTagName($1.sel) + '" does not match close tag "' + yy.getTagName($5) + '"');
            }

            $$ = {
                type: 'CPXElement',
                sel: $1.sel,
                data: $1.data,
                children: $3, 
            }
        %}
    ;

CPXSelfClosingElement
    : tagOpen space CPXElementName space CPXAttributes space "/" space ">"
        { $$ = { type: 'CPXElement', sel: $3, data: $5 }; }
    | CPXComment
    ;

CPXOpeningElement
    : tagOpen space CPXElementName space CPXAttributes space ">"
        { $$ = { sel: $3, data: $5 }; }
    ;

CPXClosingElement
    : tagOpen space "/" space CPXElementName space ">"
        { $$ = $5; }
    ;

CPXElementName
    : CPXIdentifier
        { $$ = 'u8"' + $1 + '"'; }
    | CPXNamespacedName
        { $$ = 'u8"' + $1 + '"'; }
    | CPXMemberExpression
    ;

CPXIdentifier
    : IDENTIFIER
    | "VNode"
    | "Children"
    | "string"
    | "return"
    | CPXIdentifier "-" CPXIdentifier
        { $$ = $1 + $2 + $3; }
    ;

CPXNamespacedName
    : CPXIdentifier ":" CPXIdentifier
        { $$ = $1 + $2 + $3; }
    ;

CPXMemberExpression
    : CPXIdentifier "->" CPXIdentifier
        { $$ = $1 + $2 + $3; }
    | CPXIdentifier "." CPXIdentifier
        { $$ = $1 + $2 + $3; }
    | CPXMemberExpression "->" CPXIdentifier
        { $$ = $1 + $2 + $3; }
    | CPXMemberExpression "." CPXIdentifier
        { $$ = $1 + $2 + $3; }
    ;

CPXComment
    : tagOpen "!" "-" "-" any "-" "->"
        { $$ = { type: 'CPXComment', value: yy.normalizeNewLines($5) }; }
    | tagOpen "!" "-" "-" "-" "->"
        { $$ = { type: 'CPXComment', value: '' }; }
    ;

CPXAttributes
    :
        { $$ = []; }
    // | CPXSpreadAttribute CPXAttributes
    | CPXAttributes space CPXAttribute
        { $$ = $1.concat($3); }
    ;

// CPXSpreadAttribute

CPXAttribute
    : CPXAttributeIdentifier space CPXAttributeAssignment
        %{
            var value = $3.value;
            if ($3.type === 'shorthand') {
                if ($1.type === 'attr') {
                    value = 'u8"true"';
                } else if ($1.type === 'prop') {
                    value = 'emscripten::val(true)';
                } else if ($1.type === 'callback') {
                    yyerror(yylineno, 'cannot set callback "' + $1.name + '" to "true" using shorthand notation. Maybe you want to use an {attr} or a [prop]?');
                }
            } else if ($3.type === 'string') {
                if ($1.type === 'attr') {
                    value = 'u8"' + $3.value + '"';
                } else if ($1.type === 'prop') {
                    value = 'emscripten::val(std::wstring(L"' + $3.value + '"))';
                } else if ($1.type === 'callback') {
                    yyerror(yylineno, 'cannot set callback "' + $1.name + '" using string notation. Maybe you want to use an {attr}, a [prop] or a (callback)={func}?');
                }
            }
            
            $$ = {
                type: $1.type,
                name: 'u8"' + $1.name + '"',
                value: value,
            };
        %}
    ;

CPXAttributeIdentifier
    : CPXAttributeName
        %{
            var name = $1;
            var type = 'attr';
            if (name.indexOf('on') === 0) {
                name = name.toLowerCase();
                type = 'callback';
            } else if (name === 'value' || name === 'checked') {
                type = 'prop';
            }
            $$ = { type: type, name: name };
        %}
    | "{" space CPXAttributeName space  "}"
        { $$ = { type: 'attr', name: $3 }; }
    | "[" space CPXAttributeName space  "]"
        { $$ = { type: 'prop', name: $3 }; }
    | "(" space CPXAttributeName space  ")"
        { $$ = { type: 'callback', name: $3 }; }
    ;

CPXAttributeName
    : CPXIdentifier
    | CPXNamespacedName
    ;

CPXAttributeAssignment
    : 
        { $$ = { type: 'shorthand' }; }
    | "=" space CPXAttributeValue
        { $$ = $3; }
    ;

CPXAttributeValue
    : '"' doubleQuoteString '"'
        { $$ = { type: 'string', value: yy.normalizeNewLines($2) }; }
    | "'" singleQuoteString "'"
        { $$ = { type: 'string', value: yy.normalizeNewLines($2.replace("\\'", "'")) }; }
    | "{" code "}"
        { $$ = { type: 'code', value: $2.trim() }; }
    ;

CPXChildren
    :
        { $$ = []; }
    | CPXChildren CPXChild
        { $$ = $1.concat($2); }
    ;

CPXChild
    : CPXText
        { $$ = { type: 'CPXText', value: yy.normalizeNewLines(yy.escapeQuotes($1)) }; }
    | space CPXElement
        { $$ = $2; }
    | space CPXExpression
        { $$ = $2; }
    ;

CPXExpression
    : "{" space "/" "*" any "*" "/" space "}"
        { $$ = { type: 'comment' }; }
    | "{" space code space "}"
        { $$ = { type: 'VNode', value: $3.trim() }; }
    | "{" ":" "string" space code space "}"
        { $$ = { type: 'string', value: $5 }; }
    | "{" ":" "VNode" space code space "}"
        { $$ = { type: 'VNode', value: $5.trim() }; }
    | "{" ":" "Children" space code space "}"
        { $$ = { type: 'Children', value: $5.trim() }; }
    ;

CPXText
    :
        { $$ = '' }
    | CPXTextCharacter CPXText
        { $$ = $1 + $2; }
    ;

CPXTextCharacter
    : '"'
    | "'"
    | safeChar
    ;

angleCurlyBrackets
    : tagOpen
    | ">"
    | "{"
    | "}"
    ;

singleQuoteString
    : 
        { $$ = '' }
    | singleQuoteString singleQuoteChar
        { $$ = $1 + $2; }
    ;

singleQuoteChar
    : "\\" "'"
        { $$ = $1 + $2; }
    | safeChar
    | angleCurlyBrackets
    | '"'
    ;

doubleQuoteString
    : 
        { $$ = '' }
    | doubleQuoteString doubleQuoteChar
        { $$ = $1 + $2; }
    ;

doubleQuoteChar
    : "\\" '"'
        { $$ = $1 + $2; }
    | safeChar
    | angleCurlyBrackets
    | "'"
    ;

space
    :
        { $$ = ''; }
    | WHITESPACE
    ;

tagOpen
    : TAG_OPEN
    | "<"
    ;

any
    :
    | char
    | any char
        { $$ = $1 + $2; }
    ;

safeChar
    : space
    | "->"
    | "/"
    | "*"
    | "-"
    | ":"
    | "!"
    | "."
    | "["
    | "]"
    | "("
    | ")"
    | "="
    | "\\"
    | "VNode"
    | "Children"
    | "string"
    | "return"
    | IDENTIFIER
    | ANY
    ;

char
    : safeChar
    | angleCurlyBrackets
    | '"'
    | "'"
    ;
