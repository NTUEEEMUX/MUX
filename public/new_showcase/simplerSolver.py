# Uses Shunting Yard Algorithm to parse and evaluate Boolean equations with specified operator precedence
# outputs reverse polish notation and the result of the equation

def parse_boolean_equation(equation, variable_values):
    """Parses and evaluates a Boolean equation with specified operator precedence."""
    precedence = {
        '(': 0,  # Lowest precedence for brackets
        '+': 1,  # OR
        '⊕': 2,  # XOR
        '⊖': 2,  # XNOR
        '•': 3,  # AND (implicitly represented as consecutive variables)
        "'": 4   # NOT
    }

    # Convert equation to tokens
    def tokenize(eq):
        tokens = []
        i = 0
        while i < len(eq):
            if eq[i].isspace():  # Skip spaces
                i += 1
            elif eq[i] in "()⊕+•⊖'":  # Operators
                tokens.append(eq[i])
                i += 1
            elif eq[i].isalnum():  # Variables
                start = i
                while i < len(eq) and eq[i].isalnum():
                    i += 1
                tokens.append(eq[start:i])
            else:
                raise ValueError(f"Unexpected character: {eq[i]}")
        return tokens

    # Convert infix expression to postfix using shunting-yard algorithm
    def infix_to_postfix(tokens):
        output = []
        stack = []
        for token in tokens:
            if token.isalnum():
                output.append(token)
            elif token == '(':
                stack.append(token)
            elif token == ')':
                top_token = stack.pop()
                while top_token != '(':
                    output.append(top_token)
                    top_token = stack.pop()
                if stack and stack[-1] == "'":
                    output.append(stack.pop())
            else:
                while stack and precedence[stack[-1]] >= precedence[token]:
                    output.append(stack.pop())
                stack.append(token)
        while stack:
            output.append(stack.pop())
        return output

    # Evaluate the postfix expression
    def evaluate_postfix(postfix, variable_values):
        stack = []
        for token in postfix:
            if token.isalnum():
                stack.append(variable_values[token])
            elif token == "'":
                a = stack.pop()
                stack.append(not a)
            elif token == '•':  # AND
                b, a = stack.pop(), stack.pop()
                stack.append(a and b)
            elif token == '+':  # OR
                b, a = stack.pop(), stack.pop()
                stack.append(a or b)
            elif token == '⊕':  # XOR
                b, a = stack.pop(), stack.pop()
                stack.append(a != b)
            elif token == '⊖':  # XNOR
                b, a = stack.pop(), stack.pop()
                stack.append(a == b)
        return int(stack[0])

    # Tokenize, convert to postfix, and evaluate
    tokens = tokenize(equation)
    postfix = infix_to_postfix(tokens)
    result = evaluate_postfix(postfix, variable_values)

    return postfix, result

# Example Usage
equation = "C ⊖ (A • (B + C))' ⊕ D"  # Input equation
variable_values = {'A': 1, 'B': 0, 'C': 1, 'D': 1}  # Example variable assignments

# Parse and evaluate the equation
postfix, result = parse_boolean_equation(equation, variable_values)
print(f"Input Equation: {equation}")
print(f"Postfix Notation: {' '.join(postfix)}")
print(f"Evaluation Result: {result}")