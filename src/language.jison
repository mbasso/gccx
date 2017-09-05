%left OPEN_TAG ANY

%start file

%%

file
    : EOF
        { return ""; }
    | e EOF
        { return $1; }
    ;

e
    : ANY e
        { $$ = $1 + $2; }
    | ANY
    ;