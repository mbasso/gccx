%{
    function yyerror(line, msg) {
        throw new Error('Error while parsing CPX code at line ' + line + ': ' + msg);
    }

    function escape(str, char) {
        return str.replace(new RegExp(char, 'g'), '\\' + char)
    }

    function isComment(text) {
        return text.indexOf('/*') === 0 && text.lastIndexOf('*/') === text.length - 2;
    }

    function createVNode(data) {
        var vnode;
        if (data.type === 'code') return isComment(vnode = data.code) ? '' : vnode;
        if (data.type === 'CPXText') return 'asmdom::h(u8"' + escape(data.text, '"') + '", true)';
        if (data.type === 'CPXComment') return 'asmdom::h(u8"!", std::string(u8"' + data.text + '"))';
        if (data.type === 'CPXElement') {
            vnode = 'asmdom::h(u8"' + data.sel + '"';

            if (data.children !== undefined) {
                var children = data.children.filter(function(child) {
                    return child.type !== 'code' || !isComment(child.code.trim());
                });

                if (children.length === 1) {
                    vnode += ', ';
                    vnode += children[0].type === 'CPXText'
                            ? 'std::string(u8"' + children[0].text + '")'
                            : createVNode(children[0]);
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
            if ($1 !== $5) {
                yyerror(yylineno, 'open tag "' + $1 + '" does not match close tag "' + $5 + '"');
            }

            $$ = {
                type: 'CPXElement',
                sel: $1,
                children: $3, 
            }
        }%
    ;

CPXSelfClosingElement
    : "<" space CPXElementName space "/" space ">"
        %{
            $$ = {
              type: 'CPXElement',
              sel: $3,
            };
        }%
    | CPXComment
    ;

CPXOpeningElement
    : "<" space CPXElementName space ">"
        { $$ = $3; }
    ;

CPXClosingElement
    : "<" space "/" space CPXElementName space ">"
        { $$ = $5; }
    ;

CPXElementName
    : CPXIdentifier
    | CPXNamespacedName
    ;

CPXIdentifier
    : LOWERCASE_CHAR
    | CPXIdentifier LOWERCASE_CHAR
        { $$ = $1 + $2; }
    | CPXIdentifier "-" CPXIdentifier
        { $$ = $1 + $2 + $3; }
    ;

CPXNamespacedName
    : CPXIdentifier ":" CPXIdentifier
        { $$ = $1 + $2 + $3; }
    ;

CPXComment
    : "<" "!" "-" "-" any "-" "-" ">"
        %{
            $$ = {
              type: 'CPXComment',
              text: $5,
            };
        }%
    | "<" "!" "-" "-" "-" "-" ">"
        %{
            $$ = {
              type: 'CPXComment',
              text: '',
            };
        }%
    ;

CPXChildren
    :
        { $$ = []; }
    | CPXChildren space CPXChild
        { $$ = $1.concat($3); }
    ;

CPXChild
    : CPXText
        %{
            $$ = {
              type: 'CPXText',
              text: $1.trim(),
            };
        }%
    | CPXElement
    | "{" any "}"
        %{
            $$ = {
              type: 'code',
              code: $2 !== undefined ? $2.trim() : '',
            };
        }%
    ;

CPXText
    :
        { $$ = '' }
    | CPXTextCharacter CPXText
        { $$ = $1 + $2; }
    ;

CPXTextCharacter
    : space
    | "/"
    | "-"
    | ":"
    | "!"
    | LOWERCASE_CHAR
    | ANY
    ;

space
    :
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
