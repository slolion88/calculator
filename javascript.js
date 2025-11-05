const DISPLAY_TEXT_DEFAULT = "_";

function Equation(firstNumber, operator, secondNumber) {
    this.firstNumber = firstNumber;
    this.operator = operator;
    this.secondNumber = secondNumber;
    this.result;
    this.status = "pending first";
}

// Triggered when Clear All ("AC") button is clicked or when Delete is keyed.
function clearAll(equation) {
    equation.firstNumber = undefined;
    equation.operator = undefined;
    equation.secondNumber = undefined;
    equation.result = undefined;
    equation.status = "pending first";
}

// Triggered when Clear Single ("C") button is clicked or when Backspace is keyed.
// Removes the most recent error, number, or operator.
function clearSingle(equation) {
    if (equation.result != undefined && (equation.result.toString()).startsWith("ERR")) {
        equation.result = undefined;
    } else {
        switch (equation.status) {
            case `equation solved`:
                // Backs out of equals to allow more to be added to/after secondNumber.
                equation.result = undefined;
                equation.status = "pending second";
                break;
            case `pending second`:
                // If secondNumber isn't entered, remove the operator. Otherwise reduce or remove the secondNumber.
                if (equation.secondNumber === undefined) {
                    equation.operator = undefined;
                    equation.status = "pending first";
                } else {
                    let temp = equation.secondNumber.toString();
                    temp = temp.substring(0, temp.length - 1);

                    if (temp === "") {
                        equation.secondNumber = undefined;
                    } else {
                        equation.secondNumber = +temp;
                    }
                }
                break;
            case `pending first`:
                // If the operator is entered, remove it, otherwise, reduce or remove the firstNumber;
                if (equation.firstNumber != undefined) {
                    if (equation.operator != undefined) {
                        equation.operator = undefined;
                        equation.status = "pending first";
                    } else {
                        let temp = equation.firstNumber.toString();
                        temp = temp.substring(0, temp.length - 1);
                        if (temp === "") {
                            equation.firstNumber = undefined;
                        } else {
                            equation.firstNumber = +temp;
                        }
                    }
                }
        }
    }
}

function updateEquation(input, equation) {
    switch (equation.status) {
        case "equation solved":
            // New number is being input after equation solved, start over. 
            if (typeof input === "number" || input === ".") {
                clearAll(equation);
                equation.firstNumber = input;
                equation.status = "pending first";
                // If operator is input, set current result to the first Number and update the operator
            } else if (input != "=") {
                let temp = equation.result;
                clearAll(equation);
                equation.firstNumber = temp;
                equation.operator = input;
                equation.status = "pending second";
            }
            break;
        case "pending second":
            // New number being input for second, operates if the equation is compelete, or chains operations if another operator added.
            if (typeof input === "number" || input === ".") {
                equation.secondNumber = equation.secondNumber === undefined ? input : equation.secondNumber + input.toString();
            } else if (input === "=") {
                operate(equation);
                equation.status = "equation solved";
            } else {
                if (equation.secondNumber != undefined) {
                    operate(equation);
                    let temp = equation.result;
                    clearAll(equation);
                    equation.firstNumber = temp;
                    equation.operator = input;
                    equation.status = "pending second";
                } else {
                    // Gives an error for duplicate operators added
                    equation.result = "ERR DUP OPTR";
                }
            }
            break;
        case "pending first":
            // New number being input for first, sets operator if prpvoded, but errors if equaled.
            if (typeof input === "number" || input === ".") {
                equation.firstNumber = equation.firstNumber === undefined ? input : equation.firstNumber + input.toString();
            } else {
                if (equation.firstNumber != undefined && input != "=") {
                    equation.operator = input;
                    equation.status = "pending second";
                } else {
                    equation.result = "ERR NO OPRND";
                }
            }
    }
}

function add(firstNumber, secondNumber) {
    // Numbers received as strings, conver to numbers first
    return (+firstNumber) + (+secondNumber);
}

function subtract(firstNumber, secondNumber) {
    return firstNumber - secondNumber;
}

function multiply(firstNumber, secondNumber) {
    return firstNumber * secondNumber;
}

function divide(firstNumber, secondNumber) {
    // Returns an error when dividing by 0
    return secondNumber != 0 ? firstNumber / secondNumber : "ERR DIV BY 0";
}

// Operates on the completed equation, and particularly the operator, received. Errors if the equation is incomplete.
function operate(equation) {
    if (equation.firstNumber === undefined || equation.operator === undefined || equation.secondNumber === undefined) {
        equation.result = "ERR NO EQTN";
    } else if (equation.result === undefined) {
        switch (equation.operator) {
            case "+":
                equation.result = add(equation.firstNumber, equation.secondNumber);
                break;
            case "-":
                equation.result = subtract(equation.firstNumber, equation.secondNumber);
                break;
            case "x":
                equation.result = multiply(equation.firstNumber, equation.secondNumber);
                break;
            case "/":
                equation.result = divide(equation.firstNumber, equation.secondNumber);
            default:
                break;
        }
    }
}

// Updates the display to show numbers entered, results, and errors. 
// The display can take 10-12 characters, including decimals, signs and errors.
// If the display is overflowed, an error will be thrown and the data will clear.
function updateDisplay(equation) {
    const display = document.getElementById("display");

    if (equation.result != undefined) {
        display.textContent = equation.result;
    } else if (equation.firstNumber === undefined && equation.operator === undefined && equation.secondNumber === undefined) {
        display.textContent = DISPLAY_TEXT_DEFAULT;
    } else {
        if (equation.firstNumber != undefined) {
            display.textContent = `${equation.firstNumber}`;
        }
        if (equation.operator != undefined) {
            display.textContent += ` ${equation.operator}`;
        }
        if (equation.secondNumber != undefined) {
            display.textContent += ` ${equation.secondNumber}`;
        }
    }

    if (display.textContent.length > 12) {
        let temp = display.textContent.split(".");
        if (temp.length == 2) {
            // There's a decimal, so reduce the decimal portion to fit in screen, keeping the length of the integer in mind.
            display.textContent = Number.parseFloat(display.textContent).toFixed(12 - (temp[0].length + 1));
        } else {
            display.textContent = "ERR TOO LONG";
        }
    }
}

// Initializes all of the buttons, the first equation, and sets up event listeners for clicks and keys.
// The decimal button/key is disabled if the number is already a decimal. 
function initialize() {
    let newCalculation = new Equation;
    updateDisplay(newCalculation);

    const zeroButton = document.getElementById("zero");
    const oneButton = document.getElementById("one");
    const twoButton = document.getElementById("two");
    const threeButton = document.getElementById("three");
    const fourButton = document.getElementById("four");
    const fiveButton = document.getElementById("five");
    const sixButton = document.getElementById("six");
    const sevenButton = document.getElementById("seven");
    const eightButton = document.getElementById("eight");
    const nineButton = document.getElementById("nine");

    const decimalButton = document.getElementById("decimal");

    const addButton = document.getElementById("add");
    const subtractButton = document.getElementById("subtract");
    const multiplyButton = document.getElementById("multiply");
    const divideButton = document.getElementById("divide");

    const equalsButton = document.getElementById("equals");

    const clearSingleButton = document.getElementById("clear-single");
    const clearAllButton = document.getElementById("clear-all");

    zeroButton.addEventListener("click", function () {
        updateEquation(0, newCalculation);
        updateDisplay(newCalculation);
    });

    oneButton.addEventListener("click", function () {
        updateEquation(1, newCalculation);
        updateDisplay(newCalculation);
    });

    twoButton.addEventListener("click", function () {
        updateEquation(2, newCalculation);
        updateDisplay(newCalculation);
    });

    threeButton.addEventListener("click", function () {
        updateEquation(3, newCalculation);
        updateDisplay(newCalculation);
    });

    fourButton.addEventListener("click", function () {
        updateEquation(4, newCalculation);
        updateDisplay(newCalculation);
    });

    fiveButton.addEventListener("click", function () {
        updateEquation(5, newCalculation);
        updateDisplay(newCalculation);
    });

    sixButton.addEventListener("click", function () {
        updateEquation(6, newCalculation);
        updateDisplay(newCalculation);
    });

    sevenButton.addEventListener("click", function () {
        updateEquation(7, newCalculation);
        updateDisplay(newCalculation);
    });

    eightButton.addEventListener("click", function () {
        updateEquation(8, newCalculation);
        updateDisplay(newCalculation);
    });

    nineButton.addEventListener("click", function () {
        updateEquation(9, newCalculation);
        updateDisplay(newCalculation);
    });

    decimalButton.addEventListener("click", function () {
        if ((newCalculation.status === "pending first" && (newCalculation.firstNumber === undefined || newCalculation.firstNumber % 1 === 0)) ||
            (newCalculation.status === "pending second" && (newCalculation.secondNumber === undefined || newCalculation.secondNumber % 1 === 0)) ||
            (newCalculation === "equation solved")) {
            updateEquation(".", newCalculation);
            updateDisplay(newCalculation);
        }
    });

    addButton.addEventListener("click", function () {
        updateEquation("+", newCalculation);
        updateDisplay(newCalculation);
    });

    subtractButton.addEventListener("click", function () {
        updateEquation("-", newCalculation);
        updateDisplay(newCalculation);
    });

    multiplyButton.addEventListener("click", function () {
        updateEquation("x", newCalculation);
        updateDisplay(newCalculation);
    });

    divideButton.addEventListener("click", function () {
        updateEquation("/", newCalculation);
        updateDisplay(newCalculation);
    });

    equalsButton.addEventListener("click", function () {
        updateEquation("=", newCalculation);
        operate(newCalculation);
        updateDisplay(newCalculation);
    });

    clearSingleButton.addEventListener("click", function () {
        clearSingle(newCalculation);
        updateDisplay(newCalculation);
    });

    clearAllButton.addEventListener("click", function () {
        clearAll(newCalculation);
        updateDisplay(newCalculation);
    });

    document.addEventListener("keydown", event => {
        switch (event.key) {
            case "Backspace":
                clearSingle(newCalculation);
                updateDisplay(newCalculation);
                break;
            case "Delete":
                clearAll(newCalculation);
                updateDisplay(newCalculation);
                break;
            case "Enter":
            case "=":
                updateEquation("=", newCalculation);
                operate(newCalculation);
                updateDisplay(newCalculation);
                break;
            case "+":
                updateEquation("+", newCalculation);
                updateDisplay(newCalculation);
                break;
            case "-":
                updateEquation("-", newCalculation);
                updateDisplay(newCalculation);
                break;
            case "x":
            case "*":
                updateEquation("x", newCalculation);
                updateDisplay(newCalculation);
                break;
            case "/":
                updateEquation("/", newCalculation);
                updateDisplay(newCalculation);
                break;
            case "1":
                updateEquation(1, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "2":
                updateEquation(2, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "3":
                updateEquation(3, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "4":
                updateEquation(4, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "5":
                updateEquation(5, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "6":
                updateEquation(6, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "7":
                updateEquation(7, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "8":
                updateEquation(8, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "9":
                updateEquation(9, newCalculation);
                updateDisplay(newCalculation);
                break;
            case "0":
                updateEquation(0, newCalculation);
                updateDisplay(newCalculation);
                break;
            case ".":
                updateEquation(".", newCalculation);
                updateDisplay(newCalculation);
                break;
        };
    });
}

initialize();