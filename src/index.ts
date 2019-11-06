import { Parse } from './parse';
import { Lex } from './lex';
import { Expression } from './syntaxtree';

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

function packageYCombinator(code: string) {
    return `%Y.(${code})(%f.(%x.(f(x x)) %x.(f(x x))))`;
}

const code = packageYCombinator(packageBool(packageNaturalNumber(`
Y (%self.%bool.(
    self FALSE
)) FALSE
`)));

const synTree = Parse(Lex(code)).runNameConflictResolver();
let reducedExpression: Expression = synTree;
let lastResult: Expression | undefined = undefined;
for (let i = 0; reducedExpression !== lastResult; i++) {
    lastResult = reducedExpression;
    reducedExpression = reducedExpression.eval();
    if (i > 0xFFFF) throw new Error('Terminated after 0xFFFF rounds. Containing endless recursion?');
}

console.log(reducedExpression.toString());
