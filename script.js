let display = document.getElementById('result');
let historyDisplay = document.getElementById('history');
let angleModeIndicator = document.getElementById('angleModeIndicator');
let invModeIndicator = document.getElementById('invModeIndicator');
let currentInput = '0';
let shouldResetDisplay = false;
let angleMode = 'deg';
let isInverse = false;
let calculationHistory = [];

function updateDisplay() {
    display.value = currentInput;
    angleModeIndicator.textContent = angleMode.toUpperCase();
    invModeIndicator.textContent = isInverse ? 'INV' : 'REG';
    
    const degBtn = document.getElementById('degBtn');
    const radBtn = document.getElementById('radBtn');
    const invBtn = document.getElementById('invBtn');
    
    degBtn.classList.toggle('active-mode', angleMode === 'deg');
    radBtn.classList.toggle('active-mode', angleMode === 'rad');
    invBtn.classList.toggle('active-mode', isInverse);
}

function appendToDisplay(value) {
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = value;
        shouldResetDisplay = false;
    } else {
        if (value === '.' && currentInput.includes('.')) {
            return;
        }
        currentInput += value;
    }
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    calculationHistory = [];
    historyDisplay.innerHTML = '';
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function setAngleMode(mode) {
    angleMode = mode;
    updateDisplay();
}

function toggleInverse() {
    isInverse = !isInverse;
    updateDisplay();
}

function addFunction(func) {
    let functionName = func;
    
    if (isInverse) {
        switch(func) {
            case 'sin': functionName = 'asin'; break;
            case 'cos': functionName = 'acos'; break;
            case 'tan': functionName = 'atan'; break;
            case 'log': functionName = '10^'; break;
            case 'ln': functionName = 'e^'; break;
            case 'sqrt': functionName = 'x²'; break;
        }
    }
    
    // Just add the function name and opening bracket
    // User will manually input the value and closing bracket
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = functionName + '(';
        shouldResetDisplay = false;
    } else {
        currentInput += functionName + '(';
    }
    updateDisplay();
}

function addConstant(constant) {
    let constantValue;
    if (constant === 'pi') {
        constantValue = 'π';
    } else if (constant === 'e') {
        constantValue = 'e';
    }
    
    if (currentInput === '0' || shouldResetDisplay) {
        currentInput = constantValue;
        shouldResetDisplay = false;
    } else {
        currentInput += constantValue;
    }
    updateDisplay();
}

function addPower() {
    appendToDisplay('^');
}

function addPercentage() {
    appendToDisplay('%');
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

function evaluateExpression(expression) {
    // Replace display symbols with math symbols
    let mathExpression = expression
        .replace(/×/g, '*')
        .replace(/–/g, '-')
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString())
        .replace(/%/g, '/100')
        .replace(/\^/g, '**');
    
    // Handle functions
    mathExpression = mathExpression.replace(/asin\(/g, 'Math.asin(');
    mathExpression = mathExpression.replace(/acos\(/g, 'Math.acos(');
    mathExpression = mathExpression.replace(/atan\(/g, 'Math.atan(');
    mathExpression = mathExpression.replace(/sin\(/g, angleMode === 'deg' ? 'Math.sin(Math.PI/180*' : 'Math.sin(');
    mathExpression = mathExpression.replace(/cos\(/g, angleMode === 'deg' ? 'Math.cos(Math.PI/180*' : 'Math.cos(');
    mathExpression = mathExpression.replace(/tan\(/g, angleMode === 'deg' ? 'Math.tan(Math.PI/180*' : 'Math.tan(');
    mathExpression = mathExpression.replace(/log\(/g, 'Math.log10(');
    mathExpression = mathExpression.replace(/ln\(/g, 'Math.log(');
    mathExpression = mathExpression.replace(/sqrt\(/g, 'Math.sqrt(');
    mathExpression = mathExpression.replace(/10\^\(/g, 'Math.pow(10,');
    mathExpression = mathExpression.replace(/e\^\(/g, 'Math.exp(');
    mathExpression = mathExpression.replace(/x²\(/g, 'Math.pow(');
    mathExpression = mathExpression.replace(/!\(/g, 'factorial(');
    
    return mathExpression;
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function addToHistory(entry) {
    calculationHistory.unshift(entry);
    if (calculationHistory.length > 3) {
        calculationHistory.pop();
    }
    historyDisplay.innerHTML = calculationHistory.join('<br>');
}

function calculate() {
    try {
        let originalExpression = currentInput;
        let mathExpression = evaluateExpression(originalExpression);
        
        // Evaluate the expression
        let result = eval(mathExpression);
        
        if (!isFinite(result)) {
            throw new Error('Math error');
        }
        
        // Round to avoid floating point precision issues
        result = Math.round(result * 1e12) / 1e12;
        
        addToHistory(`${originalExpression} = ${result}`);
        currentInput = result.toString();
        shouldResetDisplay = true;
        updateDisplay();
    } catch (error) {
        currentInput = 'Error';
        shouldResetDisplay = true;
        updateDisplay();
        
        setTimeout(() => {
            currentInput = '0';
            updateDisplay();
        }, 2000);
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendToDisplay(key === '*' ? '×' : key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === '(') {
        appendToDisplay('(');
    } else if (key === ')') {
        appendToDisplay(')');
    } else if (key === '^') {
        addPower();
    } else if (key === 'p' && event.ctrlKey) {
        event.preventDefault();
        addConstant('pi');
    } else if (key === 'i' && event.ctrlKey) {
        event.preventDefault();
        toggleInverse();
    } else if (key === 's' && event.ctrlKey) {
        event.preventDefault();
        addFunction('sin');
    } else if (key === 'o' && event.ctrlKey) {
        event.preventDefault();
        addFunction('cos');
    } else if (key === 't' && event.ctrlKey) {
        event.preventDefault();
        addFunction('tan');
    }
});

// Initialize
updateDisplay();
