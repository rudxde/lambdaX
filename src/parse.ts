import { Expression, LambdaFunction, LambdaApplication, LambdaName } from './syntaxtree';

type Tokens = string[];
type ParseResult<T> = { result: T, increasedIndex: number };


export function Parse(tokens: Tokens): Expression {
    return ParseExpression(0, tokens).result;
}

function ParseExpression(index: number, tokens: Tokens): ParseResult<Expression> {
    let rootExpression: Expression | undefined = undefined;
    while (index < tokens.length) {
        if (tokens[index] === ')') break;
        const simpleExpressionResult = parseSimpleExpression(index, tokens);
        index = simpleExpressionResult.increasedIndex;
        if(!rootExpression) {
            rootExpression = simpleExpressionResult.result;
        } else {
            rootExpression = new LambdaApplication(rootExpression, simpleExpressionResult.result);
        }
    }
    return {
        increasedIndex: index,
        result: rootExpression!,
    };
}

function parseSimpleExpression(index: number, tokens: Tokens): ParseResult<Expression> {
    if (index > tokens.length) throw new Error('program ended');
    if (tokens[index] === '%') {
        return parseFunction(index, tokens);
    }
    if (tokens[index] === '(') {
        const result = ParseExpression(++index, tokens);
        result.increasedIndex++;
        return result;
    }
    return {
        increasedIndex: index + 1,
        result: new LambdaName(tokens[index]),
    }
}

function parseFunction(index: number, tokens: Tokens): ParseResult<LambdaFunction> {
    index++;
    const parameter = tokens[index++];
    if (tokens[index++] === '.') {
        const valueExpressionResult = parseSimpleExpression(index, tokens);
        index = valueExpressionResult.increasedIndex;
        return {
            increasedIndex: index,
            result: new LambdaFunction(parameter, valueExpressionResult.result),
        };
    } else {
        throw new Error('. expected');
    }
}

