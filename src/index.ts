import { Parse } from './parse';
import { Lex } from './lex';

function packageBool(code: string): string {
    return `(%AND.%OR.%NOT.%TRUE.%FALSE.(
            %XOR.(
                ${code}
            )(%A.%B.(OR (AND B (NOT A)) (AND (NOT B) A)))
            )) (%x.%y.(x y x)) (%x.%y.(x x y)) (%f.%x.%y.(f y x)) (%x.%y.x) (%x.%y.y)`;
}

function packageNaturalNumber(code: string) {
    return`(%0.%1.%2.%3.%4.(
            %ADD.
            (%MUL.(
                ${code}
            )
            (%A.%B.%s.%z.(A (B s) z)))
            (%A.%B.%s.%z.(A s (B s z)))
        )(%s.%z.z)(%s.%z.(s (z)))(%s.%z.(s (s z)))(%s.%z.(s (s (s z))))(%s.%z.(s (s (s (s z)))))
    )
    `
}

const code = packageBool(packageNaturalNumber(`
%countup.(
%Y.(%self.%counter.(
    %scounter.(
        scounter (%Y.(self countup counter))
    )(%a.(counter a a a))
)) (%a.%b.%c.a)
)(%f.f (%a.%b.%c.b) (%a.%b.%c.c) (%a.%b.%c.end))
`));

const synTree = Parse(Lex(code)).runNameConflictResolver();
console.log(synTree.toString());
console.log(synTree.eval().toString());