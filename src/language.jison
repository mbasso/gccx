%{
    function yyerror(line, msg) {
        throw new Error('Error while parsing CPX code at line ' + line + ': ' + msg);
    }

    function getTagName(sel) {
        if (sel.indexOf('u8"') === 0) {
            return sel.substring(0, sel.length - 1).replace('u8"', '');
        }
        return sel;
    }

    function filterByType(type, vnode) {
        return vnode.data.filter(function(attribute) {
            return attribute.type === type;
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
                        var previousSpaces = /\s+$/.exec(vnodes[index - 1].value);
                        if (previousSpaces !== null) {
                            value = previousSpaces[0] + value;
                        }
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
        if (data.type === 'CPXComment') return 'asmdom::h(u8"!", std::string(u8"' + data.value + '"))';
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
    | e EOF
        { return $1; }
    ;

e
    : space CPXElement space
        { $$ = createVNode($2); }
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
        { $$ = { type: 'CPXComment', value: $5 }; }
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
    : /* CPXAttributeIdentifier space "=" space CPXAttributeValue
        { $$ = { type: $1.type, name: $1.name, value: $5 }; }
    | */ CPXAttributeIdentifier
        %{
            var value;
            if ($1.type === 'attr') {
                value = 'u8"true"';
            } else if ($1.type === 'prop') {
                value = 'emscripten::val(true)';
            } else if ($1.type === 'callback') {
                yyerror(yylineno, 'cannot set callback "' + $1.name + '" to "true" using shorthand notation. Maybe you want to use an {attr} or a [prop]?');
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

// CPXAttributeValue

CPXChildren
    :
        { $$ = []; }
    | CPXChildren space CPXChild
        { $$ = $1.concat($3); }
    ;

CPXChild
    : CPXText
        { $$ = { type: 'CPXText', value: $1 }; }
    | CPXElement
    | CPXExpression
    ;

CPXExpression
    : "{" space "/" "*" any "*" "/" space "}"
        { $$ = { type: 'comment' }; }
    | "{" any "}"
        { $$ = { type: 'VNode', value: $2.trim() }; }
    | "{" ":" "string" any "}"
        { $$ = { type: 'string', value: $4 }; }
    | "{" ":" "VNode" any "}"
        { $$ = { type: 'VNode', value: $4.trim() }; }
    ;

CPXText
    :
        { $$ = '' }
    | CPXTextCharacter CPXText
        { $$ = $1 + $2; }
    ;

CPXTextCharacter
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
    | "VNode"
    | "string"
    | IDENTIFIER
    | ANY
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

char
    : CPXTextCharacter
    | "<"
    | ">"
    | "{"
    | "}"
    ;
