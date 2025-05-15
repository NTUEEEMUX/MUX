// Function to draw line above letter
function drawLineAboveLetter(letter) {
    return letter + '\u0304';
}

// Logic gate functions
function AND(x, y) {
    return String(Number(x) & Number(y));
}

function OR(x, y) {
    return String(Number(x) | Number(y));
}

function XOR(x, y) {
    return String(Number(x) ^ Number(y));
}

function XNOR(x, y) {
    return String(1 - (Number(x) ^ Number(y)));
}

function NAND(x, y) {
    return String(1 - (Number(x) & Number(y)));
}

function NOR(x, y) {
    return String(1 - (Number(x) | Number(y)));
}

function initializeMux(answerType) {
    // Hide the "Solution" button
    document.getElementById('solution').classList.add('hidden');
    // Hide the "Next Question" button
    document.getElementById('next-btn').classList.add('hidden');
    // Hide the "solutions" div
    document.getElementById('real-solution').classList.add('hidden');
    
    // Initiated multiplexer config
    const num_of_input = [4, 8][Math.floor(Math.random() * 2)];
    const num_of_select = Math.log2(num_of_input);

    let inputs = {};
    let select = [];

    for (let i = 0; i < num_of_input; i++) {
        inputs["I" + i] = 0;
    }

    for (let j = 0; j < num_of_select; j++) {
        select.push("S" + j);
    }

    let z = {
        "A": ['a', drawLineAboveLetter('a')],
        "B": ['b', drawLineAboveLetter('b')],
        "C": ['c', drawLineAboveLetter('c')],
        "binary": ['0', '1'],
    };

    if (num_of_input === 8) {
        z["D"] = ['d', drawLineAboveLetter('d')];
        table_abcd = "abcd";
    } else{
        table_abcd = "abc";
    }

    let z_track = JSON.parse(JSON.stringify(z));
    z_track["gate"] = ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'];
    // allows for up to 2 gates in the mux with 8 inputs
    if (num_of_input === 8) {
        if (Math.random() < 0.5) {
            z_track["gate2"] = ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'];
        } 
        if (Math.random() < 0.5){
            z_track["gate3"] = ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'];
        }
    }

    //generate question MUX
    for (let i in inputs) {
        if (Object.keys(z_track).length === 0) {
            inputs[i] = z[Object.keys(z)[Math.floor(Math.random() * Object.keys(z).length)]][Math.floor(Math.random() * 2)];
        } else {
            let temp = Object.keys(z_track)[Math.floor(Math.random() * Object.keys(z_track).length)];
            if (temp === "gate" || temp === "gate2" || temp === "gate3") {
                let first_choice = z[Object.keys(z)[Math.floor(Math.random() * Object.keys(z).length)]][Math.floor(Math.random() * 2)];
                let second_choice = first_choice;
                while (second_choice === first_choice) {
                    second_choice = z[Object.keys(z)[Math.floor(Math.random() * Object.keys(z).length)]][Math.floor(Math.random() * 2)];
                }
                inputs[i] = first_choice + " " + z_track[temp][Math.floor(Math.random() * z_track[temp].length)] + " " + second_choice;
                delete z_track[temp];
            } else {
                inputs[i] = z_track[temp][Math.floor(Math.random() * z_track[temp].length)];
                delete z_track[temp];
            }
        }
    }

    for (let j of select) {
        inputs[j] = z[Object.keys(z)[Math.floor(Math.random() * Object.keys(z).length)]][Math.floor(Math.random() * 2)];
    }

    console.log("randomly generated MUX: " + JSON.stringify(inputs));

    // Size of kmap determined by the number of variables in z eg.z(a,b,c,d) = 2**4 = 16
    let kmap = [];

    // Binary counter matching size of Inputs(I)
    function binary_counter(n) {
        let result = [];
        for (let i = 0; i < n; i++) {
            result.push(i.toString(2).padStart(Math.log2(n), '0'));
        }
        return result;
    }

    let truth_table = binary_counter(num_of_input);

    // Solving min/maxterm given MUX
    // Step1: loop kmap in binary (abcd)
    // Step2: deep copy input dictionary and assign values to the unknown variables in select and input
    // Step3: use truth table to find output based off current mux variables in select and input
    // Step4: append output to kmap array
    // Step5: discover the min and max term

    let kmap_bin = binary_counter(2 ** (Object.keys(z).length - 1));

    let gate_names = ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'];
    let gate_pattern = new RegExp('\\b(' + gate_names.join('|') + ')\\b');

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

    for (let kmap_index of kmap_bin) {
        rowHTML = `<td>${parseInt(kmap_index,2)}</td><td>${kmap_index}</td>`;
        let curr_input = JSON.parse(JSON.stringify(inputs));
        let abcd = {};

        for (let i = 0; i < kmap_index.length; i++) {
            abcd[String.fromCharCode(97 + i)] = kmap_index[i];
            if (kmap_index[i] === '0') {
                abcd[drawLineAboveLetter(String.fromCharCode(97 + i))] = '1';
            } else {
                abcd[drawLineAboveLetter(String.fromCharCode(97 + i))] = '0';
            }
        }

        for (let j in curr_input) {
            if (gate_pattern.test(curr_input[j])) {
                let parts = curr_input[j].split(" ");
                let value_1 = abcd[parts[0]] || parts[0];
                let gate = parts[1];
                let value_2 = abcd[parts[2]] || parts[2];

                // Retrieve the function object from the function name
                let gate_function = eval(gate);

                // Call the function with the arguments
                let result = gate_function(value_1, value_2);
                curr_input[j] = result;
                rowHTML += `<td>${result}</td>`;
            } else if (abcd[curr_input[j]]) {
                curr_input[j] = abcd[curr_input[j]];
                if (j.includes("S")){
                    continue;
                } else {
                    rowHTML += `<td>${curr_input[j]}</td>`;
                }
            } else {
                if (j.includes("S")){
                    continue;
                } else {
                    rowHTML += `<td>${curr_input[j]}</td>`;
                }
            }
        }
        // console.log("curr_input is: " + JSON.stringify(curr_input));
        let highlight = '';
        if (answerType === "minterm Σm(…)") {
            highlight += '1';
        } else {
            highlight += '0';
        }

        let selector_combi = Object.keys(curr_input).filter(key => key.startsWith('S')).sort().reverse().map(key => curr_input[key]).join('');
        for (let k = 0; k <selector_combi.length; k++) {
            rowHTML += `<td>${selector_combi[k]}</td>`;
        }

        for (let k = 0; k < truth_table.length; k++) {
            if (selector_combi === truth_table[k]) {
                kmap.push(curr_input['I' + k]);
                let rowstyle = '';
                if (curr_input['I' + k] !== highlight) {
                    rowstyle = '#f1f1f1';
                } else if (curr_input['I' + k] === highlight) {
                    rowstyle = '#fdeec3';
                }
                rowHTML += `<td>${'I' + k}</td><td>${curr_input['I' + k]}</td>`;
                tableHTML += `<tr bgcolor="${rowstyle}">${rowHTML}</tr>`;
            }
        }
    }
    //end solution table drawing
    tableHTML += '</table>';

    // Set the inner HTML of the realSolutionDiv
    let realSolutionDiv = document.getElementById('solution-container');
    realSolutionDiv.innerHTML = tableHTML;

    realSolutionDiv.innerHTML = tableHTML;

    console.log("kmap is: " + JSON.stringify(kmap));

    let minterm = [];
    let maxterm = [];

    for (let i = 0; i < kmap.length; i++) {
        if (kmap[i] === '1') {
            minterm.push(i);
        } else if (kmap[i] === '0') {
            maxterm.push(i);
        }
    }

    console.log("minterm is: " + JSON.stringify(minterm));
    console.log("maxterm is: " + JSON.stringify(maxterm));

    // Check if minterm or maxterm is empty and call initializeMux again if true
    if (minterm.length === 0 || maxterm.length === 0) {
        console.log("Empty minterm or maxterm detected. Regenerating MUX configuration.");
        return initializeMux();
    }

    let [altminterm, altmaxterm] = altalgo(inputs, num_of_input);
    if (!arraysEqual(altminterm, minterm) || !arraysEqual(altmaxterm, maxterm)) {
        console.log("Mismatched minterm or maxterm detected. Regenerating MUX configuration.");
        return initializeMux();
    }

    // Return the generated values
    return { inputs, minterm, maxterm, kmap };
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

// Function to generate the question and options
function qn_generator() {
    // Randomly decide between minterm and maxterm
    let answerType = Math.random() < 0.5 ? "minterm Σm(…)" : "maxterm ΠM(…)";

    // Initialize the MUX and get the generated values
    const { inputs, minterm, maxterm, kmap } = initializeMux(answerType);

    // Determine the correct answer based on the random choice
    let correctAnswer = answerType === "minterm Σm(…)" ? minterm : maxterm;

    // Check if the correct answer is empty
    if (correctAnswer.length === 0) {
        alert(`The ${answerType} is empty. Generating a new question.`);
        qn_generator(); // Generate a new question
        return;
    } else if (correctAnswer.length > 1){
        answerType = answerType.slice(0, 7) + "s" + answerType.slice(7);
    }

    // Determine the number of unknowns based on the length of the kmap
    let unknowns = '';
    if (kmap.length === 8) {
        unknowns = 'a,b,c';
    } else {
        unknowns = 'a,b,c,d';
    }

    // Set the question
    // document.getElementById('question').innerText = `Find the ${answerType} for the following MUX configuration: ${JSON.stringify(inputs)}`;
    document.getElementById('question').innerHTML = `Find the <u>${answerType}</u> of the function Y(${unknowns}) for the given MUX configuration.`;

    // Draw the multiplexer
    const circuitDiv = document.getElementById('circuit');
    drawMultiplexer(circuitDiv, inputs);

    // Generate 3 other wrong unique answers of the same length
    let wrongAnswers = new Set();
    while (wrongAnswers.size < 3) {
        let wrongAnswer = new Set();
        while (wrongAnswer.size < correctAnswer.length) {
            let randomValue = Math.floor(Math.random() * kmap.length);
            wrongAnswer.add(randomValue);
        }
        wrongAnswer = Array.from(wrongAnswer).sort((a, b) => a - b);
        let wrongAnswerString = wrongAnswer.toString();
        let correctAnswerString = correctAnswer.toString();
        if (wrongAnswerString !== correctAnswerString && !wrongAnswers.has(wrongAnswerString)) {
            wrongAnswers.add(wrongAnswerString);
        }
    }

    // Combine correct answer and wrong answers
    let options = [correctAnswer, ...Array.from(wrongAnswers).map(ans => ans.split(',').map(Number))];

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    // Set the options
    let optionButtons = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        // Create a display string with "[" replaced by "{" and "]" replaced by "}"
        let displayOption = JSON.stringify(option).replace(/\[/g, '(').replace(/\]/g, ')');
        
        // Set the display string as the button text
        optionButtons[index].innerText = displayOption;
        
        // Set the onclick handler with the original option value
        optionButtons[index].onclick = () => checkAnswer(optionButtons[index], option, correctAnswer);
    });
}

// Function to draw the multiplexer
function drawMultiplexer(circuitDiv, inputs) {  
    
    // Count the keys that start with "I" and "S"
    let countI = 0;
    let countS = 0;

    Object.keys(inputs).forEach(key => {
        if (key.startsWith("I")) {
            countI++;
        } else if (key.startsWith("S")) {
            countS++;
        }
    });

    console.log(`Number of keys starting with "I": ${countI}`);
    console.log(`Number of keys starting with "S": ${countS}`);
    
    // Clear any existing SVG
    circuitDiv.innerHTML = '';

    // Create the SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";

    // Draw the multiplexer (example)
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "40");
    rect.setAttribute("y", "5");
    rect.setAttribute("width", "40");
    rect.setAttribute("height", "80");
    rect.setAttribute("fill", "#B4E5A2");
    rect.setAttribute("stroke", "black");
    svg.appendChild(rect);

    // Draw lines based on countI
    for (let i = 0; i < countI; i++) {
        const yValue = (80 / countI) * i + 10;
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", "40");
        line.setAttribute("y1", yValue);
        line.setAttribute("x2", "35");
        line.setAttribute("y2", yValue);
        line.setAttribute("stroke", "black");
        svg.appendChild(line);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", "46");
        text.setAttribute("y", yValue+2);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "4");
        text.textContent = `I${i}`;
        svg.appendChild(text);

        if (!inputs[`I${i}`].includes(" ")) {
            const line2 = document.createElementNS(svgNS, "line");
            line2.setAttribute("x1", "35");
            line2.setAttribute("y1", yValue);
            line2.setAttribute("x2", "25");
            line2.setAttribute("y2", yValue);
            line2.setAttribute("stroke", "black");
            svg.appendChild(line2);

            const text2 = document.createElementNS(svgNS, "text");
            text2.setAttribute("x", "20");
            text2.setAttribute("y", yValue+2);
            text2.setAttribute("text-anchor", "end");
            text2.setAttribute("font-size", "5");
            text2.textContent = inputs[`I${i}`];
            svg.appendChild(text2);

        } else {
            // fill gate values
            const [val1, gate, val2] = inputs[`I${i}`].split(" ");

            const texttop = document.createElementNS(svgNS, "text");
            texttop.setAttribute("x", "20");
            texttop.setAttribute("y", yValue-1.5);
            texttop.setAttribute("text-anchor", "end");
            texttop.setAttribute("font-size", "5");
            texttop.textContent = val1;
            svg.appendChild(texttop);

            const textbot = document.createElementNS(svgNS, "text");
            textbot.setAttribute("x", "20");
            textbot.setAttribute("y", yValue+4);
            textbot.setAttribute("text-anchor", "end");
            textbot.setAttribute("font-size", "5");
            textbot.textContent = val2;
            svg.appendChild(textbot);

            // draw lines
            if (gate === "AND" || gate === "NAND") {
                const topline = document.createElementNS(svgNS, "line");
                topline.setAttribute("x1", 27.5);
                topline.setAttribute("y1", yValue-1.25);
                topline.setAttribute("x2", 22);
                topline.setAttribute("y2", yValue-1.25);
                topline.setAttribute("stroke", "black");
                topline.setAttribute("stroke-width", "0.5");
                svg.appendChild(topline);

                const botline = document.createElementNS(svgNS, "line");
                botline.setAttribute("x1", 27.5);
                botline.setAttribute("y1", yValue+1.25);
                botline.setAttribute("x2", 22);
                botline.setAttribute("y2", yValue+1.25);
                botline.setAttribute("stroke", "black");
                botline.setAttribute("stroke-width", "0.5");
                svg.appendChild(botline);
            }

            if (gate === "OR" || gate === "NOR" || gate === "XOR" || gate === "XNOR") {
                const topline = document.createElementNS(svgNS, "line");
                topline.setAttribute("x1", 28.3);
                topline.setAttribute("y1", yValue-1.25);
                topline.setAttribute("x2", 22);
                topline.setAttribute("y2", yValue-1.25);
                topline.setAttribute("stroke", "black");
                topline.setAttribute("stroke-width", "0.5");
                svg.appendChild(topline);
    
                const botline = document.createElementNS(svgNS, "line");
                botline.setAttribute("x1", 28.3);
                botline.setAttribute("y1", yValue+1.25);
                botline.setAttribute("x2", 22);
                botline.setAttribute("y2", yValue+1.25);
                botline.setAttribute("stroke", "black");
                botline.setAttribute("stroke-width", "0.5");
                svg.appendChild(botline);
            }

            // draw logic gates
            if (gate === "AND") {
                const circle = document.createElementNS(svgNS, "circle");
                circle.setAttribute("cx", 32.5);
                circle.setAttribute("cy", yValue);
                circle.setAttribute("r", "2.5");
                circle.setAttribute("fill", "white");
                circle.setAttribute("stroke", "black");
                circle.setAttribute("stroke-width", "0.5");
                svg.appendChild(circle);

                const rect2 = document.createElementNS(svgNS, "rect");
                rect2.setAttribute("x", 27.5);
                rect2.setAttribute("y", yValue-2.5);
                rect2.setAttribute("width", "5");
                rect2.setAttribute("height", "5");
                rect2.setAttribute("fill", "white");
                svg.appendChild(rect2);

                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", 27.5);
                line.setAttribute("y1", yValue-2.5);
                line.setAttribute("x2", 27.5);
                line.setAttribute("y2", yValue+2.5);
                line.setAttribute("stroke", "black");
                line.setAttribute("stroke-width", "0.5");
                svg.appendChild(line);

                const line2 = document.createElementNS(svgNS, "line");
                line2.setAttribute("x1", 27.5);
                line2.setAttribute("y1", yValue-2.5);
                line2.setAttribute("x2", 32.5);
                line2.setAttribute("y2", yValue-2.5);
                line2.setAttribute("stroke", "black");
                line2.setAttribute("stroke-width", "0.5");
                svg.appendChild(line2);

                const line3 = document.createElementNS(svgNS, "line");
                line3.setAttribute("x1", 27.5);
                line3.setAttribute("y1", yValue+2.5);
                line3.setAttribute("x2", 32.5);
                line3.setAttribute("y2", yValue+2.5);
                line3.setAttribute("stroke", "black");
                line3.setAttribute("stroke-width", "0.5");
                svg.appendChild(line3);
            } else if (gate === "NAND") {
                const circle = document.createElementNS(svgNS, "circle");
                circle.setAttribute("cx", 30.5);
                circle.setAttribute("cy", yValue);
                circle.setAttribute("r", "2.5");
                circle.setAttribute("fill", "white");
                circle.setAttribute("stroke", "black");
                circle.setAttribute("stroke-width", "0.5");
                svg.appendChild(circle);

                const circle2 = document.createElementNS(svgNS, "circle");
                circle2.setAttribute("cx", 34);
                circle2.setAttribute("cy", yValue);
                circle2.setAttribute("r", "1");
                circle2.setAttribute("fill", "white");
                circle2.setAttribute("stroke", "black");
                circle2.setAttribute("stroke-width", "0.5");
                svg.appendChild(circle2);

                const rect2 = document.createElementNS(svgNS, "rect");
                rect2.setAttribute("x", 27.5);
                rect2.setAttribute("y", yValue-2.5);
                rect2.setAttribute("width", "3");
                rect2.setAttribute("height", "5");
                rect2.setAttribute("fill", "white");
                svg.appendChild(rect2);

                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", 27.5);
                line.setAttribute("y1", yValue-2.5);
                line.setAttribute("x2", 27.5);
                line.setAttribute("y2", yValue+2.5);
                line.setAttribute("stroke", "black");
                line.setAttribute("stroke-width", "0.5");
                svg.appendChild(line);

                const line2 = document.createElementNS(svgNS, "line");
                line2.setAttribute("x1", 27.5);
                line2.setAttribute("y1", yValue-2.5);
                line2.setAttribute("x2", 30.5);
                line2.setAttribute("y2", yValue-2.5);
                line2.setAttribute("stroke", "black");
                line2.setAttribute("stroke-width", "0.5");
                svg.appendChild(line2);

                const line3 = document.createElementNS(svgNS, "line");
                line3.setAttribute("x1", 27.5);
                line3.setAttribute("y1", yValue+2.5);
                line3.setAttribute("x2", 30.5);
                line3.setAttribute("y2", yValue+2.5);
                line3.setAttribute("stroke", "black");
                line3.setAttribute("stroke-width", "0.5");
                svg.appendChild(line3);
            } else if (gate === "OR") {
                // Create the right arc
                const rightArc = document.createElementNS(svgNS, "path");
                const rightArcPath = `M 27.5 ${yValue+2.5} Q 32.5 ${yValue+2.5} 35 ${yValue} Q 32.5 ${yValue-2.5} 27.5 ${yValue-2.5}`;
                rightArc.setAttribute("d", rightArcPath);
                rightArc.setAttribute("stroke", "black");
                rightArc.setAttribute("fill", "none");
                rightArc.setAttribute("stroke-width", "0.5");
                svg.appendChild(rightArc);

                // Create the connecting path
                const connectingPath = document.createElementNS(svgNS, "path");
                const connectingPathPath = `M 27.5 ${yValue+2.5} Q 30 ${yValue} 27.5 ${yValue-2.5}`;
                connectingPath.setAttribute("d", connectingPathPath);
                connectingPath.setAttribute("stroke", "black");
                connectingPath.setAttribute("fill", "none");
                connectingPath.setAttribute("stroke-width", "0.5");
                svg.appendChild(connectingPath);       
            // ${yValue}
            } else if (gate === "XOR") {
                // Create the right arc
                const rightArc = document.createElementNS(svgNS, "path");
                const rightArcPath = `M 28.5 ${yValue+2.5} Q 32.8337 ${yValue+2.5} 35 ${yValue} Q 32.8337 ${yValue-2.5} 28.5 ${yValue-2.5}`;
                rightArc.setAttribute("d", rightArcPath);
                rightArc.setAttribute("stroke", "black");
                rightArc.setAttribute("fill", "none");
                rightArc.setAttribute("stroke-width", "0.5");
                svg.appendChild(rightArc);

                // Create the connecting path
                const connectingPath = document.createElementNS(svgNS, "path");
                const connectingPathPath = `M 27.5 ${yValue+2.5} Q 29.67 ${yValue} 27.5 ${yValue-2.5}`;
                connectingPath.setAttribute("d", connectingPathPath);
                connectingPath.setAttribute("stroke", "black");
                connectingPath.setAttribute("fill", "none");
                connectingPath.setAttribute("stroke-width", "0.5");
                svg.appendChild(connectingPath);    

                // Create the connecting path 2
                const connectingPath2 = document.createElementNS(svgNS, "path");
                const connectingPathPath2 = `M 28.5 ${yValue+2.5} Q 30.67 ${yValue} 28.5 ${yValue-2.5}`;
                connectingPath2.setAttribute("d", connectingPathPath2);
                connectingPath2.setAttribute("stroke", "black");
                connectingPath2.setAttribute("fill", "none");
                connectingPath2.setAttribute("stroke-width", "0.5");
                svg.appendChild(connectingPath2);    
            } else if (gate === "NOR") {
                // Create the right arc
                const rightArc = document.createElementNS(svgNS, "path");
                const rightArcPath = `M 27.5 ${yValue+2.5} Q 31.167 ${yValue+2.5} 33 ${yValue} Q 31.167 ${yValue-2.5} 27.5 ${yValue-2.5}`;
                rightArc.setAttribute("d", rightArcPath);
                rightArc.setAttribute("stroke", "black");
                rightArc.setAttribute("fill", "none");
                rightArc.setAttribute("stroke-width", "0.5");
                svg.appendChild(rightArc);

                //circleeee
                const circle2 = document.createElementNS(svgNS, "circle");
                circle2.setAttribute("cx", 34);
                circle2.setAttribute("cy", yValue);
                circle2.setAttribute("r", "1");
                circle2.setAttribute("fill", "white");
                circle2.setAttribute("stroke", "black");
                circle2.setAttribute("stroke-width", "0.5");
                svg.appendChild(circle2);

                // Create the connecting path
                const connectingPath = document.createElementNS(svgNS, "path");
                const connectingPathPath = `M 27.5 ${yValue+2.5} Q 29.3 ${yValue} 27.5 ${yValue-2.5}`;
                connectingPath.setAttribute("d", connectingPathPath);
                connectingPath.setAttribute("stroke", "black");
                connectingPath.setAttribute("fill", "none");
                connectingPath.setAttribute("stroke-width", "0.5");
                svg.appendChild(connectingPath);
            } else if (gate === "XNOR") {
                // Create the right arc
                const rightArc = document.createElementNS(svgNS, "path");
                const rightArcPath = `M 28.5 ${yValue+2.5} Q 31.5 ${yValue+2.5} 33 ${yValue} Q 31.5 ${yValue-2.5} 28.5 ${yValue-2.5}`;
                rightArc.setAttribute("d", rightArcPath);
                rightArc.setAttribute("stroke", "black");
                rightArc.setAttribute("fill", "none");
                rightArc.setAttribute("stroke-width", "0.5");
                svg.appendChild(rightArc);

                //circleeee
                const circle2 = document.createElementNS(svgNS, "circle");
                circle2.setAttribute("cx", 34);
                circle2.setAttribute("cy", yValue);
                circle2.setAttribute("r", "1");
                circle2.setAttribute("fill", "white");
                circle2.setAttribute("stroke", "black");
                circle2.setAttribute("stroke-width", "0.5");
                svg.appendChild(circle2);

                // Create the connecting path
                const connectingPath = document.createElementNS(svgNS, "path");
                const connectingPathPath = `M 27.5 ${yValue+2.5} Q 29.67 ${yValue} 27.5 ${yValue-2.5}`;
                connectingPath.setAttribute("d", connectingPathPath);
                connectingPath.setAttribute("stroke", "black");
                connectingPath.setAttribute("fill", "none");
                connectingPath.setAttribute("stroke-width", "0.5");
                svg.appendChild(connectingPath);    

                // Create the connecting path 2
                const connectingPath2 = document.createElementNS(svgNS, "path");
                const connectingPathPath2 = `M 28.5 ${yValue+2.5} Q 30.67 ${yValue} 28.5 ${yValue-2.5}`;
                connectingPath2.setAttribute("d", connectingPathPath2);
                connectingPath2.setAttribute("stroke", "black");
                connectingPath2.setAttribute("fill", "none");
                connectingPath2.setAttribute("stroke-width", "0.5");
                svg.appendChild(connectingPath2);    
            }
        }
    }

    const line2 = document.createElementNS(svgNS, "line");
    line2.setAttribute("x1", "80");
    line2.setAttribute("y1", "45");
    line2.setAttribute("x2", "85");
    line2.setAttribute("y2", "45");
    line2.setAttribute("stroke", "black");
    svg.appendChild(line2);

    for (let i = countS-1; i >= 0; i--) {
        const xValue = (33 / countS) * (countS-i) + 39;
        const line3 = document.createElementNS(svgNS, "line");
        line3.setAttribute("x1", xValue);
        line3.setAttribute("y1", "85");
        line3.setAttribute("x2", xValue);
        line3.setAttribute("y2", "90");
        line3.setAttribute("stroke", "black");
        svg.appendChild(line3);

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", xValue);
        text.setAttribute("y", "83");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "4");
        text.textContent = `S${i}`;
        svg.appendChild(text);

        const text2 = document.createElementNS(svgNS, "text");
        text2.setAttribute("x", xValue);
        text2.setAttribute("y", "95");
        text2.setAttribute("text-anchor", "middle");
        text2.setAttribute("font-size", "5");
        text2.textContent = inputs[`S${i}`];
        svg.appendChild(text2);
    }

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", "88");
    text.setAttribute("y", "46.5");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "4");
    text.textContent = "Y";
    svg.appendChild(text);

    // Append the SVG to the circuit div
    circuitDiv.appendChild(svg);
}

// Function to check if the selected answer is correct
function checkAnswer(selectedButton, selectedOption, correctAnswer) {
    let correctOption = JSON.stringify(correctAnswer).replace(/\[/g, '(').replace(/\]/g, ')');

    // Highlight the correct option in green
    const optionButtons = document.querySelectorAll('.option');
    optionButtons.forEach(button => {
        if (button.innerText === correctOption) {
            button.style.backgroundColor = "#5ca571";  // Highlight correct option
        }
        button.disabled = true;  // Disable all option buttons
    });

    // Highlight the selected option based on whether it's correct or not
    if (selectedButton.innerText === correctOption) {
        selectedButton.style.backgroundColor = "#5ca571";  // Correct answer
    } else {
        selectedButton.style.backgroundColor = "#bf3f5f";  // Incorrect answer
    }

    // Show the "Solution" button
    document.getElementById('solution').classList.remove('hidden');
    // Show the "Next Question" button
    document.getElementById('next-btn').classList.remove('hidden');

    // Disable the .option divs
    optionButtons.forEach(button => {
        button.style.pointerEvents = 'none';  // Disable interaction
    });
}

// Call the qn_generator function to generate the first question
qn_generator();

// Add event listener to the next button to generate a new question
document.getElementById('next-btn').addEventListener('click', () => {    
    // Reset the background color and enable the option buttons
    const optionButtons = document.querySelectorAll('.option');
    optionButtons.forEach(button => {
        button.style.backgroundColor = "";  // Reset background color
        button.disabled = false;  // Enable button
    });

    // hide the solutions
    document.getElementById('real-solution').classList.add('hidden');
    // Hide the "Solution" button
    document.getElementById('solution').classList.add('hidden');
    // Hide the "Next Question" button
    document.getElementById('next-btn').classList.add('hidden');

    // enable the .option divs
    optionButtons.forEach(button => {
        button.style.pointerEvents = 'auto';
    });

    qn_generator();
});

// second algo to draw table (now useless bcos doesn't tablue all inputs)
function altalgo(inputs, num_of_input) {
    let minterm = [];
    let maxterm = [];
    let table_abcd = ""
    let z = {
        "A": ['a', 'a\u0304'],
        "B": ['b', 'b\u0304'],
        "C": ['c', 'c\u0304'],
        "binary": ['0', '1']
    };

    if (num_of_input === 8) {
        z["D"] = ['d', 'd\u0304'];
        table_abcd = "abcd";
    } else{
        table_abcd = "abc";
    }

    let table = {};
    for (let x = 0; x < 2 ** (Object.keys(z).length - 1); x++) {
        table[x] = [x.toString(2).padStart(Object.keys(z).length - 1, '0')];
    }

    for (let index = 0; index < 2 ** (Object.keys(z).length - 1); index++) {
        let selector = "";
        for (let key in inputs) {
            if (key.startsWith("S")) {
                if (inputs[key].charCodeAt(0) < 97) {
                    selector = inputs[key][0] + selector;
                } else {
                    let k = parseInt(String.fromCharCode(inputs[key].charCodeAt(0) - 49));
                    if (inputs[key].length > 1) {
                        selector = String(Math.abs(parseInt(table[index][0][k]) - 1)) + selector;
                    } else {
                        selector = table[index][0][k] + selector;
                    }
                }
            }
        }
        table[index].push(selector);

        // Finding target (input) for the given selector
        let target = "I" + parseInt(selector, 2);
        table[index].push(target);
        let value = inputs[target];
        let y;

        if (value.includes(' ')) {
            let [first, gate, second] = value.split(' ');

            // First
            let w;
            if (first.charCodeAt(0) < 97) {
                w = first[0];
            } else {
                let k = parseInt(String.fromCharCode(first.charCodeAt(0) - 49));
                if (first.length > 1) {
                    w = String(Math.abs(parseInt(table[index][0][k]) - 1));
                } else {
                    w = table[index][0][k];
                }
            }

            // Second
            let x;
            if (second.charCodeAt(0) < 97) {
                x = second[0];
            } else {
                let k = parseInt(String.fromCharCode(second.charCodeAt(0) - 49));
                if (second.length > 1) {
                    x = String(Math.abs(parseInt(table[index][0][k]) - 1));
                } else {
                    x = table[index][0][k];
                }
            }

            // Calls for the global gate function
            let gateFunction = window[gate];
            y = gateFunction(w, x);

        } else {
            if (value.charCodeAt(0) < 97) {
                y = value[0];
            } else {
                let k = parseInt(String.fromCharCode(value.charCodeAt(0) - 49));
                if (value.length > 1) {
                    y = String(Math.abs(parseInt(table[index][0][k]) - 1));
                } else {
                    y = table[index][0][k];
                }
            }
        }

        table[index].push(y);
        if (y === '1') {
            minterm.push(index);
        } else if (y === '0') {
            maxterm.push(index);
        }
    }

    console.log(table);
    console.log("minterm is: " + JSON.stringify(minterm));
    console.log("maxterm is: " + JSON.stringify(maxterm));

    return [minterm, maxterm];
}

// other functions
// Add event listener to the #solution button
document.getElementById('solution').addEventListener('click', function() {
    const realSolutionDiv = document.getElementById('real-solution');
    if (realSolutionDiv.classList.contains('hidden')) {
        realSolutionDiv.classList.remove('hidden');
    } else {
        realSolutionDiv.classList.add('hidden');
    }
});

// DOMcontentloaded event listener for animated background 
document.addEventListener('DOMContentLoaded', function() {
    const animatedBackground = document.getElementById('animated-background');
  
    function playVideo() {
        animatedBackground.style.display = 'block';
        animatedBackground.play();
        animatedBackground.onended = function() {
            setTimeout(() => {
                animatedBackground.currentTime = 0; // Reset video to start
                playVideo();
            }, 30000); // Stay at the last frame for 30 seconds
        };
    }
  
    // Play the video once when the page loads
    playVideo();
  });
  
  // DOMcontentloaded event listener hamburger(mobile menu)
  document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const navE1 = document.querySelector('.nav');
    const hamburgerE1 = document.querySelector('.hamburger');
    const mediaQuery = window.matchMedia('(max-width: 650px)');
  
    const isHeaderSticky = () => {
        return header.getBoundingClientRect().top === 0;
    };
  
    const toggleHamburgerVisibility = () => {
        if (isHeaderSticky() && mediaQuery.matches) {
            hamburgerE1.classList.add('visible');
            hamburgerE1.style.pointerEvents = 'auto'; // Enable interaction
        } else {
            hamburgerE1.classList.remove('visible');
            hamburgerE1.style.pointerEvents = 'none'; // Disable interaction
            navE1.classList.remove("nav--open"); // Automatically close nav
            hamburgerE1.classList.remove("hamburger--open"); // Automatically close hamburger
        }
    };
  
    // Check visibility on scroll and media query change
    window.addEventListener('scroll', toggleHamburgerVisibility);
    mediaQuery.addEventListener('change', toggleHamburgerVisibility);
    // Initial check
    toggleHamburgerVisibility();
  
    hamburgerE1.addEventListener('click', () => {
        if (isHeaderSticky()) {
            console.log('Hamburger clicked while header is sticky');
            navE1.classList.toggle("nav--open");
            hamburgerE1.classList.toggle("hamburger--open");
        } else {
            console.log('Hamburger clicked while header is not sticky');
        }
    });
  
    navE1.addEventListener('click', () => {
        if (isHeaderSticky()) {
            console.log('Nav clicked while header is sticky');
            navE1.classList.remove("nav--open");
            hamburgerE1.classList.remove("hamburger--open");
        } else {
            console.log('Nav clicked while header is not sticky');
        }
    });
  });