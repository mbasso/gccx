%{
    function yyerror(line, msg) {
        throw new Error('Error while parsing cpx code at line ' + line + ': ' + msg);
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
        if (data.type === 'JSXText') return 'asmdom::h("' + escape(data.text, '"') + '", true)';
        if (data.type === 'JSXComment') return 'asmdom::h("!", std::string("' + data.text + '"))';
        if (data.type === 'JSXElement') {
            vnode = 'asmdom::h("' + data.sel + '"';

            if (data.children !== undefined) {
                var children = data.children.filter(function(child) {
                    return child.type !== 'code' || !isComment(child.code.trim());
                });

                if (children.length === 1) {
                    vnode += ', ';
                    vnode += children[0].type === 'JSXText'
                            ? 'std::string("' + children[0].text + '")'
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
    : space JSXElement space
        { $$ = createVNode($2); }
    ;

JSXElement
    : JSXSelfClosingElement
    | JSXOpeningElement space JSXChildren space JSXClosingElement
        %{
            if ($1 !== $5) {
                yyerror(yylineno, 'open tag "' + $1 + '" does not match close tag "' + $5 + '"');
            }

            $$ = {
                type: 'JSXElement',
                sel: $1,
                children: $3, 
            }
        }%
    ;

JSXSelfClosingElement
    : "<" space JSXElementName space "/" space ">"
        %{
            $$ = {
              type: 'JSXElement',
              sel: $3,
            };
        }%
    | JSXComment
    ;

JSXOpeningElement
    : "<" space JSXElementName space ">"
        { $$ = $3; }
    ;

JSXClosingElement
    : "<" space "/" space JSXElementName space ">"
        { $$ = $5; }
    ;

JSXElementName
    : JSXIdentifier
    | JSXNamespacedName
    ;

JSXIdentifier
    : LOWERCASE_CHAR
    | JSXIdentifier LOWERCASE_CHAR
        { $$ = $1 + $2; }
    | JSXIdentifier "-" JSXIdentifier
        { $$ = $1 + $2 + $3; }
    ;

JSXNamespacedName
    : JSXIdentifier ":" JSXIdentifier
        { $$ = $1 + $2 + $3; }
    ;

JSXComment
    : "<" "!" "-" "-" any "-" "-" ">"
        %{
            $$ = {
              type: 'JSXComment',
              text: $5,
            };
        }%
    | "<" "!" "-" "-" "-" "-" ">"
        %{
            $$ = {
              type: 'JSXComment',
              text: '',
            };
        }%
    ;

JSXChildren
    :
        { $$ = []; }
    | JSXChildren space JSXChild
        { $$ = $1.concat($3); }
    ;

JSXChild
    : JSXText
        %{
            $$ = {
              type: 'JSXText',
              text: $1.trim(),
            };
        }%
    | JSXElement
    | "{" any "}"
        %{
            $$ = {
              type: 'code',
              code: $2 !== undefined ? $2.trim() : '',
            };
        }%
    ;

JSXText
    :
        { $$ = '' }
    | JSXTextCharacter JSXText
        { $$ = $1 + $2; }
    ;

JSXTextCharacter
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
    : JSXTextCharacter
    | "<"
    | ">"
    | "{"
    | "}"
    ;
