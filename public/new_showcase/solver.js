//initialise the page
document.addEventListener('DOMContentLoaded', (event) => {
    // Call getMuxVariants when the page loads
    getMuxVariants();
});

function parseBooleanEquation(equation, variableValues) {
    // console.log("Equation:", equation);
    // console.log("Variable Values:", variableValues);

    const precedence = {
        '+': 1,  // OR
        '⊕': 2,  // XOR
        '⊖': 2,  // XNOR
        '•': 3,  // AND (implicitly represented as consecutive variables)
        "'": 4   // NOT
    };

    // Preprocess the equation to insert '•' where necessary
    equation = equation.replace(/([A-F01])(?=[A-F01])/g, '$1•') // Add '•' between consecutive variables
                        .replace(/([)])(?=[A-F01(])/g, '$1•')    // Add '•' between ')' and '(' or variables
                        .replace(/(['])(?=\()/g, '$1•')          // Add '•' between ' and '('
                        .replace(/(['])(?=[A-F01])/g, '$1•')     // Add '•' between ' and variables
                        .replace(/([A-F01])(?=\()/g, '$1•');     // Add '•' between variables and '('

    console.log("Preprocessed Equation:", equation);

    // Convert equation to tokens
    function tokenize(eq) {
        const tokens = [];
        let i = 0;
        while (i < eq.length) {
            if (/\s/.test(eq[i])) {  // Skip spaces
                i++;
            } else if ("()⊕+•⊖'".includes(eq[i])) {  // Operators
                tokens.push(eq[i]);
                i++;
            } else if (/[A-F01]/.test(eq[i])) {  // Variables or 0/1
                let start = i;
                while (i < eq.length && /[A-F01]/.test(eq[i])) {
                    i++;
                }
                tokens.push(eq.slice(start, i));
            } else {
                throw new Error(`Unexpected character: ${eq[i]}`);
            }
        }
        return tokens;
    }

    // Convert infix expression to postfix using shunting-yard algorithm
    function infixToPostfix(tokens) {
        const output = [];
        const stack = [];
        for (let j = 0; j < tokens.length; j++) {
            const token = tokens[j];
            if (/[A-F01]/.test(token)) {
                output.push(token);
                // Check for implicit AND
                if (j + 1 < tokens.length && /[A-F01]/.test(tokens[j + 1])) {
                    output.push('•');
                }
            } else if (token === '(') {
                stack.push(token);
            } else if (token === ')') {
                let topToken = stack.pop();
                while (topToken !== '(') {
                    output.push(topToken);
                    topToken = stack.pop();
                }
                if (stack.length && stack[stack.length - 1] === "'") {
                    output.push(stack.pop());
                }
            } else {
                while (stack.length && precedence[stack[stack.length - 1]] >= precedence[token]) {
                    output.push(stack.pop());
                }
                stack.push(token);
            }
        }
        while (stack.length) {
            output.push(stack.pop());
        }
        return output;
    }

    // Evaluate the postfix expression
    function evaluatePostfix(postfix, variableValues) {
        const stack = [];
        postfix.forEach(token => {
            if (/[A-F01]/.test(token)) {
                // Convert '0' and '1' to boolean values
                const value = token === '1' ? true : token === '0' ? false : variableValues[token] === '1' ? true : false;
                stack.push(value);
            } else if (token === "'") {
                const a = stack.pop();
                stack.push(!a);
            } else if (token === '•') {  // AND
                const b = stack.pop(), a = stack.pop();
                stack.push(a && b);
            } else if (token === '+') {  // OR
                const b = stack.pop(), a = stack.pop();
                stack.push(a || b);
            } else if (token === '⊕') {  // XOR
                const b = stack.pop(), a = stack.pop();
                stack.push(a !== b);
            } else if (token === '⊖') {  // XNOR
                const b = stack.pop(), a = stack.pop();
                stack.push(a === b);
            }
        });
        return stack[0] ? 1 : 0;
    }

    // Tokenize, convert to postfix, and evaluate
    const tokens = tokenize(equation);
    // console.log("Tokens:", tokens);
    const postfix = infixToPostfix(tokens);
    // console.log("Postfix:", postfix);
    const result = evaluatePostfix(postfix, variableValues);
    // console.log("Result:", result);

    return { result };
}

// Example Usage
let equation = "C ⊖ (A • (B + C))' ⊕ D";  // Input equation
// const variableValues = { 'A': 1, 'B': 0, 'C': 1, 'D': 1 };

// Parse and evaluate the equation
// const { postfix, result } = parseBooleanEquation(equation, variableValues);
console.log(`Input Equation: ${equation}`);
// console.log(`Postfix Notation: ${postfix.join(' ')}`);
// console.log(`Evaluation Result: ${result}`);

//get MUX variants and draw mux and create input fields
function getMuxVariants() {
    var selectors = document.getElementById('type').value;
    var selplus1 = Number(selectors)+1;
    var inputs = 2**selectors;
    var inputplus1 = Number(inputs)+1;
    // console.log(selectors);

    //Reset existing table 
    document.getElementById('solution-container').innerHTML = '';

    const circuitDiv = document.getElementById('circuit');

    //Draw MUX 
    // Clear any existing SVG
    circuitDiv.innerHTML = '';

    // Create the SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";

    var width = selectors*10.5+10.5
    var x = 50 - width/2
    var height = selectors*17+17
    var y = 50 - height/2 -5.5
    // Draw the multiplexer (example)
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    rect.setAttribute("fill", "#B4E5A2");
    rect.setAttribute("stroke", "black");
    svg.appendChild(rect);

    // Draw the Y output line 
    var xforY = 50 + width/2
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", xforY+10);
    line.setAttribute("y1", "42.5");
    line.setAttribute("x2", xforY);
    line.setAttribute("y2", "42.5");
    line.setAttribute("stroke", "black");
    svg.appendChild(line);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", xforY+14);
    text.setAttribute("y", "44");
    text.setAttribute("text-anchor", "end");
    text.setAttribute("font-size", "4");
    text.textContent = `Y`;
    svg.appendChild(text);

    // console.log("test selector: " + selectors)
    // console.log("test selector+1: " + selplus1)

    // Draw the S input lines
    for (let i = 0; i < selectors; i++) {
        var sel_pos = 50 + width/2 - ((width/selplus1)*(i+1))
        var base = 50 + height/2 -5.5
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", sel_pos);
        line.setAttribute("y1", base);
        line.setAttribute("x2", sel_pos);
        line.setAttribute("y2", base + 5);
        line.setAttribute("stroke", "black");
        svg.appendChild(line);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", sel_pos +2);
        text.setAttribute("y", base -2);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "4");
        text.textContent = `S${i}`;
        svg.appendChild(text);
    }

    //Draw the I input lines
    for (let i = 0; i < inputs; i++) {
        var input_pos = 50 - height/2 + ((height/inputplus1)*(i+1)) - 5.5
        var left = 50 - width/2
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", left);
        line.setAttribute("y1", input_pos);
        line.setAttribute("x2", left -5);
        line.setAttribute("y2", input_pos);
        line.setAttribute("stroke", "black");
        svg.appendChild(line);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", left + 5);
        text.setAttribute("y", input_pos + 2);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "4");
        text.textContent = `I${i}`;
        svg.appendChild(text);
    }
    // Append the SVG to the circuit div
    circuitDiv.appendChild(svg);

    //update input fields > call solving functions > create truth table 
    const inputContainer = document.getElementById('inputss');
    inputContainer.innerHTML = '';

    // Create header for inputs
    const inputsHeader = document.createElement("div");
    const inputsHeaderText = document.createElement("span");
    inputsHeaderText.textContent = "Inputs";
    inputsHeaderText.style.fontWeight = "bold";
    inputsHeaderText.style.textDecoration = "underline";
    inputsHeader.appendChild(inputsHeaderText);
    inputContainer.appendChild(inputsHeader);

    // Create text input fields for inputs
    for (let i = 0; i < inputs; i++) {
        const inputGroup = document.createElement("div");
        inputGroup.className = "input-group";

        const label = document.createElement("label");
        label.setAttribute("for", `input-${i}`);
        label.textContent = `I${i}: `;

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Input ${i}`;
        input.id = `input-${i}`;
        input.addEventListener("input", function() {
            validateInput(this, /^[01⊕⊖'()+•ABCDEFabcdef ]*$/);
        });

        inputGroup.appendChild(label); // Append label to input-group
        inputGroup.appendChild(input); // Append input to input-group
        inputContainer.appendChild(inputGroup); // Append input-group to input-container
    }

    // Create header for selectors
    const selectorsHeader = document.createElement("div");
    const selectorsHeaderText = document.createElement("span");
    selectorsHeaderText.textContent = "Select";
    selectorsHeaderText.style.fontWeight = "bold";
    selectorsHeaderText.style.textDecoration = "underline";
    selectorsHeader.appendChild(selectorsHeaderText);
    inputContainer.appendChild(selectorsHeader);

    // Create text input fields for selectors
    for (let i = selectors-1; i >=0; i--) {
        const inputGroup = document.createElement("div");
        inputGroup.className = "input-group";

        const label = document.createElement("label");
        label.setAttribute("for", `selector-input-${i}`);
        label.textContent = `S${i}: `;

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Selector ${i}`;
        input.id = `selector-input-${i}`;
        input.addEventListener("input", function() {
            validateInput(this, /^[01⊕⊖'()+•ABCDEFabcdef ]*$/); 
        });

        inputGroup.appendChild(label); // Append label to input-group
        inputGroup.appendChild(input); // Append input to input-group
        inputContainer.appendChild(inputGroup); // Append input-group to input-container
    }
}

// Function to validate input using regex
function validateInput(input, regex) {
    if (input.value === "") {
        input.style.border = ""; // No border if the input is empty
        input.setCustomValidity("");
    } else if (!regex.test(input.value)) {
        input.style.border = "2px solid red"; // Red border if the input is invalid
        input.setCustomValidity("Invalid input");
        input.reportValidity();
    } else if (!areBracketsBalanced(input.value)) {
        input.style.border = "2px solid red"; // Red border if the brackets are not balanced
        input.setCustomValidity("Unmatched brackets");
        input.reportValidity();
    } else {
        input.style.border = "2px solid green"; // Green border if the input is valid
        input.setCustomValidity("");
    }
}

// Function to check if brackets are balanced
function areBracketsBalanced(input) {
    let stack = [];
    for (let char of input) {
        if (char === '(') {
            stack.push(char);
        } else if (char === ')') {
            if (stack.length === 0) {
                return false; // Unmatched closing bracket
            }
            stack.pop();
        }
    }
    return stack.length === 0; // True if no unmatched opening brackets
}

let focusedInput = null;
let redLine = null;

// Event listener to track the focused input field
document.addEventListener('focusin', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
        focusedInput = event.target;

        // Check if the input ID starts with "selector"
        if (focusedInput.id.startsWith('selector')) {
            drawRedLineForSelector(focusedInput.id);
        } else if (focusedInput.id.startsWith('input')) {
            drawRedLineForInput(focusedInput.id);
        }
    }
});

// Event listener to remove the red line when the input field loses focus
document.addEventListener('focusout', (event) => {
    if (event.target.tagName === 'INPUT' && event.target.type === 'text') {
        if (redLine) {
            redLine.remove();
            redLine = null;
        }
    }
});

// Function to draw a red line for selector inputs based on the input ID
function drawRedLineForSelector(inputId) {
    const index = parseInt(inputId.split('-')[2], 10); // Extract the index from the input ID
    const selectors = document.getElementById('type').value;
    const selplus1 = Number(selectors) + 1;
    const width = selectors * 10.5 + 10.5;
    const height = selectors * 17 + 17;

    var sel_pos = 50 + width / 2 - ((width / selplus1) * (index + 1));
    var base = 50 + height / 2 - 5;
    const svgNS = "http://www.w3.org/2000/svg";
    redLine = document.createElementNS(svgNS, "line");
    redLine.setAttribute("x1", sel_pos);
    redLine.setAttribute("y1", base);
    redLine.setAttribute("x2", sel_pos);
    redLine.setAttribute("y2", base + 5);
    redLine.setAttribute("stroke", "red"); // Set the line color to red

    const svg = document.querySelector('#circuit svg');
    if (svg) {
        svg.appendChild(redLine); // Append the line to the SVG element
    }
}

// Function to draw a red line for input boxes based on the input ID
function drawRedLineForInput(inputId) {
    const index = parseInt(inputId.split('-')[1], 10); // Extract the index from the input ID
    const selectors = document.getElementById('type').value;
    const inputs = 2 ** selectors;
    const inputplus1 = Number(inputs) + 1;
    const width = selectors * 10.5 + 10.5;
    const height = selectors * 17 + 17;

    var input_pos = 50 - height / 2 + ((height / inputplus1) * (index + 1)) - 5.5;
    var left = 50 - width / 2 - 0.5;
    const svgNS = "http://www.w3.org/2000/svg";
    redLine = document.createElementNS(svgNS, "line");
    redLine.setAttribute("x1", left);
    redLine.setAttribute("y1", input_pos);
    redLine.setAttribute("x2", left - 5);
    redLine.setAttribute("y2", input_pos);
    redLine.setAttribute("stroke", "red"); // Set the line color to red

    const svg = document.querySelector('#circuit svg');
    if (svg) {
        svg.appendChild(redLine); // Append the line to the SVG element
    }
}

// Function to insert a symbol into the focused input field
function insertSymbol(symbol) {
    if (focusedInput) {
        const start = focusedInput.selectionStart;
        const end = focusedInput.selectionEnd;
        const value = focusedInput.value;
        focusedInput.value = value.slice(0, start) + symbol + value.slice(end);
        focusedInput.selectionStart = focusedInput.selectionEnd = start + symbol.length;
        focusedInput.focus();
    }
}

// Function to handle submit button click
function submit() {
    const inputs = document.querySelectorAll('input[type="text"]');
    let allValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity() || input.value.trim() === "") {
            allValid = false;
        }
    });

    if (!allValid) {
        alert("Invalid or empty input");
        return;
    }

    // Organise the user inputs b4 calculating
    console.log("Calculating...");

    const selectorValues = {};
    const allterms = new Set();
    
    inputs.forEach(input => {
        if (input.id.startsWith('selector')) {
            const label = input.previousSibling.textContent.trim().slice(0, -1); // Remove the colon
            const value = input.value.replace(/\s+/g, '').toUpperCase(); // Strip all spaces and capitalize
            selectorValues[label] = value;
    
            // Add all alphabets to the set
            for (const char of value) {
                if (/[A-Z]/.test(char)) {
                    allterms.add(char);
                }
            }
        }
    });
    
    console.log(selectorValues);
    
    const inputValues = {};
    inputs.forEach(input => {
        if (input.id.startsWith('input')) {
            const label = input.previousSibling.textContent.trim().slice(0, -1); // Remove the colon
            const value = input.value.replace(/\s+/g, '').toUpperCase(); // Strip all spaces and capitalize
            inputValues[label] = value;
    
            // Add all alphabets to the set
            for (const char of value) {
                if (/[A-Z]/.test(char)) {
                    allterms.add(char);
                }
            }
        }
    });
    
    console.log(inputValues);
    console.log(allterms);

    // Generate the truth table
    generateTruthTable(allterms, selectorValues, inputValues);
}

// Function to generate the truth table
function generateTruthTable(allterms, selectorValues, inputValues) {
    const table_abcd = Array.from(allterms).sort().join('');
    const table_abcd_split = table_abcd.split('').join(',');
    const num_of_input = Object.keys(inputValues).length;
    const num_of_select = Object.keys(selectorValues).length;
    const num_of_var = 2 ** (Object.keys(table_abcd).length);

    let minterm = `Y(${table_abcd_split}) = Σm(`;
    let maxterm = `Y(${table_abcd_split}) = ΠM(`;

    console.log("test: " + num_of_var);

    // Plot the table in the #real-solution div
    // Create table headerss
    let tableHTML = `<table id="solutions_table" border="1"><tr><th>Terms</th><th>${table_abcd}</th>`;
    for (let i = 0; i < num_of_input; i++) {
        tableHTML += `<th>I<sub style="font-size: 0.7em; vertical-align: sub;">${i}</sub></th>`;
    }
    for (let j = num_of_select-1; j >= 0; j--) {
        tableHTML += `<th>S<sub style="font-size: 0.7em; vertical-align: sub;">${j}</sub></th>`;
    }
    tableHTML += `<th>Select</th><th>Y</th></tr>`;

    for (let terms = 0; terms < num_of_var; terms++) {
        let terms_bin = terms.toString(2).padStart(allterms.size, '0');
        let variableValues = {};
        //crating the abcd dict for calculation function
        for (let i = 0; i < table_abcd.length; i++) {
            variableValues[table_abcd[i]] = terms_bin[i];
        }
        rowHTML = `<td>${terms}</td><td>${terms_bin}</td>`;

        //calculating the input values
        let curr_input = {};
        for (let key in inputValues) {
            const { result } = parseBooleanEquation(inputValues[key], variableValues);
            console.log("Result:", result);
            rowHTML += `<td>${result}</td>`;
            curr_input[key] = result;
        }
        
        // Calculate the selector values
        let curr_selector = '';
        for (let key in selectorValues) {
            const { result } = parseBooleanEquation(selectorValues[key], variableValues);
            console.log("Result:", result);
            rowHTML += `<td>${result}</td>`;
            curr_selector += result;
        }

        // Find the Input in question and the output value
        const selectorIndex = parseInt(curr_selector, 2);
        rowHTML += `<td>I${selectorIndex}</td>`;
        const result = curr_input[`I${selectorIndex}`];
        rowHTML += `<td>${result}</td>`;

        // Add the row to the table
        if (result === 1) {
            minterm += terms + ", ";
            tableHTML += `<tr bgcolor="#fdeec3">${rowHTML}</tr>`;
        }
        if (result === 0) {
            maxterm += terms + ", ";
            tableHTML += `<tr bgcolor="#f1f1f1">${rowHTML}</tr>`;
        }
    }

    //end solution table drawing
    tableHTML += '</table>';

    minterm = minterm.slice(0, -2) + ")";
    maxterm = maxterm.slice(0, -2) + ")";
    console.log(minterm);
    console.log(maxterm);

    // Set the inner HTML of the realSolutionDiv
    let realSolutionDiv = document.getElementById('solution-container');
    realSolutionDiv.innerHTML = `<hr><br><p>${minterm}</p><p>${maxterm}</p><br>${tableHTML}`;
}

//informtaion popup
document.addEventListener('DOMContentLoaded', (event) => {
    const svg = document.getElementById('information');
    const popup = document.getElementById('popup');

    svg.addEventListener('mouseover', (e) => {
        popup.style.display = 'block';
        popup.style.top = `${e.clientY}px`;
        popup.style.left = `${e.clientX - popup.offsetWidth}px`;
    });

    svg.addEventListener('mousemove', (e) => {
        popup.style.top = `${e.clientY}px`;
        popup.style.left = `${e.clientX - popup.offsetWidth}px`;
    });

    svg.addEventListener('mouseout', () => {
        popup.style.display = 'none';
    });
});