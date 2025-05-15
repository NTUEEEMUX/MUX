//initialise the page
document.addEventListener('DOMContentLoaded', (event) => {
    // Call getMuxVariants when the page loads
    getMuxVariants();
});

//get MUX variants and draw mux and create input fields
function getMuxVariants() {
    var selectors = Math.floor(Math.random() * 2) + 2;
    //call function to generate the question
    qn_generator(selectors);
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
        text.setAttribute("y", base + 9);
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
        text.setAttribute("x", left - 7);
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

function qn_generator(selectors) {
    var inputs = 2**selectors;
    const variables = ['0', '1', 'a', 'b', 'c'];
    if (selectors == 3) {
        variables.push('d');
    };

    const input_line = [];
    const selector_line = [];
    for (let i = 0; i < selectors; i++) {
        selector_line.push(input_gen(variables));
    };
    for (let i = 0; i < inputs; i++) {
        input_line.push(input_gen(variables));
    };

    
};

function input_gen(variables) {
    var input = '';
    const operators = ['+', '⊕', '⊖', '•'];

    // Randomly choose between 1 or 2 variables
    const numVariables = Math.floor(Math.random() * 2) + 1;

    if (numVariables === 1) {
        // Choose 1 variable
        const variable = variables[Math.floor(Math.random() * variables.length)];
        // Randomly decide to add a ' behind the variable or not
        const addNegation = Math.random() < 0.5;
        input = variable + (addNegation ? "'" : '');
    } else {
        // Choose 2 variables
        const variable1 = variables[Math.floor(Math.random() * variables.length)];
        const variable2 = variables[Math.floor(Math.random() * variables.length)];
        // Randomly choose one of the 4 operators
        const operator = operators[Math.floor(Math.random() * operators.length)];
        // Form the operation
        let operation = variable1 + operator + variable2;
        // Randomly choose to add parentheses to both sides of the operation
        const addParentheses = Math.random() < 0.5;
        if (addParentheses) {
            input = '(' + operation + ")'";
        }
    }
    return input;
}