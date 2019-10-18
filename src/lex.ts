export function Lex(code: string): string[] {
    const result: string[] = [];
    let currentToken = '';
    for (let i = 0; i < code.length; i++) {
        switch (code.charAt(i)) {
            case '\n':
                break;
            case '%': //Lambda
                result.push(currentToken, '%');
                currentToken = '';
                break;
            case '.':
                result.push(currentToken, '.');
                currentToken = '';
                break;
            case '(':
                result.push(currentToken, '(');
                currentToken = '';
                break;
            case ')':
                result.push(currentToken, ')');
                currentToken = '';
                break;
            case ' ':
                result.push(currentToken);
                currentToken = '';
                break;
            default:
                currentToken += code.charAt(i);
                break;
        }
    }
    result.push(currentToken);
    return result.filter(Boolean);
}
