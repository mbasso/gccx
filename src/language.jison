%{
    function yyerror(line, msg) {
        throw new Error('Error while parsing CPX code at line ' + line + ': ' + msg);
    }

    function normalizeNewLines(str) {
        return str.replace(/\s*\n\s*/g, ' ');
    }

    function escape(char, str) {
        return str.replace(new RegExp('(' + char + ')', 'g'), '\\$1')
    }

    var escapeQuotes = escape.bind(null, '"');

    function getTagName(sel) {
        if (sel.indexOf('u8"') === 0) {
            return sel.substring(0, sel.length - 1).replace('u8"', '');
        }
        return sel;
    }

    function filterByType(type, vnode) {
        return vnode.data.filter(function(attribute) {
            return attribute.type === type;
        }).filter(function(obj, index, arr) {
            return arr.map(function(mapObj) {
                return mapObj.name;
            }).lastIndexOf(obj.name) === index;
        });
    }

    var filterAttrs = filterByType.bind(null, 'attr');
    var filterProps = filterByType.bind(null, 'prop');
    var filterCallbacks = filterByType.bind(null, 'callback');

    function createMaps(maps) {
        return maps.map(function(map) {
            var res = '';
            if (map.values.length !== 0) {
                res += map.id + ' {'
                res += map.values.map(function(attr) {
                    return '{' + attr.name + ', ' + attr.value + '}';
                }).join(', ');
                res += '}';
            }
            return res;
        }).filter(function(map) {
            return map !== '';
        }).join(', ');
    }

    function isComment(text) {
        return text.indexOf('/*') === 0 && text.lastIndexOf('*/') === text.length - 2;
    }

    function aggregateStrings(vnodes) {
        if (vnodes.length === 1) return vnodes[0];
        return {
            type: 'string',
            aggregated: true,
            value: vnodes.map(function (vnode, index) {
                var value = vnode.value;

                if (vnode.type === 'CPXText') {
                    if (index === 0) {
                        value = value.replace(/^\s+/, '');
                    } else if (index === vnodes.length - 1) {
                        value = value.replace(/\s+$/, '');
                    }
                    return 'u8"' + value + '"';
                } else if (vnode.type === 'string') {
                    return 'std::string(' + value.trim() + ')';
                }
            }).join(' + '),
        };
    }

    function aggregateNodes(vnodes) {
        var computedVnodes = [];
        var strings = [];
        for (var i = 0; i < vnodes.length; i++) {
            var child = vnodes[i];
            if (child.type === 'CPXText' || child.type === 'string') {
                strings.push(child);
            } else {
                if (strings.length !== 0) {
                    computedVnodes.push(aggregateStrings(strings));
                    strings = [];
                }
                computedVnodes.push(child);
            }
        }
        if (strings.length !== 0) {
            computedVnodes.push(aggregateStrings(strings));
        }
        return computedVnodes;
    }

    function createVNode(data) {
        var vnode;
        if (data.type === 'VNode') return data.value;
        if (data.type === 'string') return 'asmdom::h(' + data.value.trim() + ', true)';
        if (data.type === 'CPXText') return 'asmdom::h(u8"' + data.value.trim() + '", true)';
        if (data.type === 'CPXComment') return 'asmdom::h(u8"!", std::string(u8"' + escapeQuotes(data.value) + '"))';
        if (data.type === 'CPXElement') {
            vnode = 'asmdom::h(' + data.sel;

            if (data.data !== undefined && data.data.length !== 0) {
                vnode += ', Data ('

                vnode += createMaps([
                    { id: 'Attrs', values: filterAttrs(data) },
                    { id: 'Props', values: filterProps(data) },
                    { id: 'Callbacks', values: filterCallbacks(data) },
                ]);

                vnode += ')'
            }

            if (data.children !== undefined) {
                var children = aggregateNodes(
                    data.children.filter(function(child) {
                        return child.type !== 'comment';
                    })
                );

                if (children.length === 1) {
                    vnode += ', ';
                    if (children[0].type === 'CPXText') {
                        vnode += 'std::string(u8"' + children[0].value.trim() + '")';
                    } else if (children[0].type === 'string') {
                        vnode += children[0].aggregated !== true
                                    ? 'std::string(' + children[0].value.trim() + ')'
                                    : children[0].value.trim();
                    } else {
                        vnode += createVNode(children[0]);
                    }
                } else if (children.length > 1) {
                    vnode += ', Children {' + children.map(createVNode).join(', ') + '}';
                }
            }

            vnode += ')';
        }
        return vnode;
    }
%}

%start file

%%

file
    : EOF
        { return ""; }
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
    | code "<" "<"
        { $$ = $1 + $2 + $3; }

    | code IDENTIFIER space "<" "<"
        { $$ = $1 + $2 + $3 + $4 + $5; }
    | code IDENTIFIER "<" "<"
        { $$ = $1 + $2 + $3 + $4; }

    | code IDENTIFIER space "<" code ">"
        { $$ = $1 + $2 + $3 + $4 + $5 + $6; }
    | code IDENTIFIER "<" code ">"
        { $$ = $1 + $2 + $3 + $4 + $5; }

    | code IDENTIFIER space
        { $$ = $1 + $2 + $3; }

    // CPX

    | code CPXElement
        { $$ = $1 + createVNode($2); }
    ;

CPXElement
    : CPXSelfClosingElement
    | CPXOpeningElement space CPXChildren space CPXClosingElement
        %{
            if ($1.sel !== $5) {
                yyerror(yylineno, 'open tag "' + getTagName($1.sel) + '" does not match close tag "' + getTagName($5) + '"');
            }

            $$ = {
                type: 'CPXElement',
                sel: $1.sel,
                data: $1.data,
                children: $3, 
            }
        }%
    ;

CPXSelfClosingElement
    : "<" space CPXElementName space CPXAttributes space "/" space ">"
        { $$ = { type: 'CPXElement', sel: $3, data: $5 }; }
    | CPXComment
    ;

CPXOpeningElement
    : "<" space CPXElementName space CPXAttributes space ">"
        { $$ = { sel: $3, data: $5 }; }
    ;

CPXClosingElement
    : "<" space "/" space CPXElementName space ">"
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
    : "<" "!" "-" "-" any "-" "->"
        { $$ = { type: 'CPXComment', value: normalizeNewLines($5) }; }
    | "<" "!" "-" "-" "-" "->"
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
                    value = 'emscripten::val(L"' + $3.value + '")';
                } else if ($1.type === 'callback') {
                    yyerror(yylineno, 'cannot set callback "' + $1.name + '" using string notation. Maybe you want to use an {attr}, a [prop] or a (callback)={func}?');
                }
            }
            
            $$ = {
                type: $1.type,
                name: 'u8"' + $1.name + '"',
                value: value,
            };
        }%
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
        }%
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
        { $$ = { type: 'string', value: normalizeNewLines($2) }; }
    | "'" singleQuoteString "'"
        { $$ = { type: 'string', value: normalizeNewLines($2.replace("\\'", "'")) }; }
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
        { $$ = { type: 'CPXText', value: normalizeNewLines(escapeQuotes($1)) }; }
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
    : "<"
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
