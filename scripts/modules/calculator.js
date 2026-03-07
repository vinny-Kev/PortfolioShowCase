(() => {
  const calculatorApp = document.getElementById('calculator-app');
  const calculatorIcon = document.getElementById('calculator-icon');
  const closeButton = document.getElementById('calculator-close');
  const minimizeButton = document.getElementById('calculator-min');
  const previousDisplay = document.getElementById('calc-previous');
  const currentDisplay = document.getElementById('calc-current');
  const buttonContainer = document.getElementById('calc-buttons');

  if (!calculatorApp || !calculatorIcon || !closeButton || !minimizeButton || !previousDisplay || !currentDisplay || !buttonContainer) {
    return;
  }

  let current = '0';
  let previous = '';
  let operator = '';

  const updateDisplay = () => {
    currentDisplay.textContent = current;
    previousDisplay.textContent = previous && operator ? `${previous} ${operator}` : previous;
  };

  const clearAll = () => {
    current = '0';
    previous = '';
    operator = '';
    updateDisplay();
  };

  const appendNumber = (value) => {
    if (current === '0') {
      current = value;
      updateDisplay();
      return;
    }

    current += value;
    updateDisplay();
  };

  const appendDecimal = () => {
    if (current.includes('.')) {
      return;
    }

    current += '.';
    updateDisplay();
  };

  const setOperation = (nextOperator) => {
    if (operator && previous) {
      compute();
    }

    previous = current;
    operator = nextOperator;
    current = '0';
    updateDisplay();
  };

  const compute = () => {
    const left = Number(previous);
    const right = Number(current);

    if (Number.isNaN(left) || Number.isNaN(right) || !operator) {
      return;
    }

    let result = 0;

    if (operator === '+') result = left + right;
    if (operator === '-') result = left - right;
    if (operator === '*') result = left * right;
    if (operator === '/') result = right === 0 ? 0 : left / right;
    if (operator === '%') result = left % right;

    current = `${Number.isFinite(result) ? Number(result.toFixed(8)) : 0}`;
    previous = '';
    operator = '';
    updateDisplay();
  };

  const deleteLast = () => {
    if (current.length <= 1) {
      current = '0';
      updateDisplay();
      return;
    }

    current = current.slice(0, -1);
    updateDisplay();
  };

  const openApp = () => {
    calculatorApp.classList.remove('hidden');
    calculatorApp.style.zIndex = '40';
  };

  const closeApp = () => {
    calculatorApp.classList.add('hidden');
  };

  calculatorIcon.addEventListener('click', openApp);
  closeButton.addEventListener('click', closeApp);
  minimizeButton.addEventListener('click', closeApp);

  buttonContainer.addEventListener('click', (event) => {
    const target = event.target.closest('.calc-btn');
    if (!target) {
      return;
    }

    const action = target.dataset.action;
    const value = target.dataset.value;

    if (action === 'number' && value) appendNumber(value);
    if (action === 'decimal') appendDecimal();
    if (action === 'operation' && value) setOperation(value);
    if (action === 'equals') compute();
    if (action === 'clear') clearAll();
    if (action === 'delete') deleteLast();
  });

  updateDisplay();
})();
