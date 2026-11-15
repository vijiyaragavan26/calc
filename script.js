/**
 * Modern Interactive Calculator Logic
 * Author: Frontend Specialist
 * Features:
 *  - Safe arithmetic engine (No eval())
 *  - Precision-corrected floating point calculations
 *  - Full keyboard mapping with tactile feedback
 *  - Persistent History panel with recall & clear
 *  - Dark / Light theme switcher with localStorage persistence
 *  - One-click copy result to clipboard
 *  - Dynamic display font scaling
 */

class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.history = this.loadHistory();
    this.isErrorState = false;
    this.shouldResetScreen = false;
    this.clear();
  }

  /**
   * Resets calculator to its initial state.
   */
  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.isErrorState = false;
    this.shouldResetScreen = false;
    this.updateDisplay();
    this.removeActiveOperatorHighlight();
  }

  /**
   * Deletes the last entered character from the current operand.
   */
  delete() {
    if (this.isErrorState) {
      this.clear();
      return;
    }
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
      this.updateDisplay();
      return;
    }

    if (this.currentOperand.length === 1 || this.currentOperand === '0') {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  /**
   * Appends a digit or decimal point to the current operand.
   * @param {string} number - Digit or '.'
   */
  appendNumber(number) {
    if (this.isErrorState) {
      this.clear();
    }

    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    // Decimal point handling
    if (number === '.') {
      if (this.currentOperand === '' || this.currentOperand === undefined) {
        this.currentOperand = '0.';
        this.updateDisplay();
        return;
      }
      if (this.currentOperand.includes('.')) return; // Prevent multiple decimals
    }

    // Prevent multiple leading zeros (e.g., '0000')
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      // Limit input length to 16 characters for visual stability
      if (this.currentOperand.replace(/,/g, '').length >= 16) return;
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    this.updateDisplay();
  }

  /**
   * Sets the operation (+, -, ×, ÷) and chains pending calculations.
   * @param {string} operation
   */
  chooseOperation(operation) {
    if (this.isErrorState) return;

    // If operator is selected when current is empty but previous exists, swap operator
    if (this.currentOperand === '' || this.shouldResetScreen) {
      if (this.previousOperand !== '') {
        this.operation = operation;
        this.shouldResetScreen = false;
        this.updateDisplay();
        this.highlightActiveOperator();
        return;
      }
    }

    // Chain operations if there is already a previous operand
    if (this.previousOperand !== '') {
      this.compute(false);
      if (this.isErrorState) return;
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
    this.updateDisplay();
    this.highlightActiveOperator();
  }

  /**
   * Computes percentage based on standard financial calculator logic:
   * 1. In a chain (e.g. 200 + 10%): calculates 10% of 200 = 20
   * 2. Standalone (e.g. 50%): converts 50 into 0.50
   */
  computePercentage() {
    if (this.isErrorState || !this.currentOperand) return;

    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    let result;
    if (this.previousOperand !== '' && this.operation) {
      const prev = parseFloat(this.previousOperand);
      if (!isNaN(prev)) {
        if (this.operation === '+' || this.operation === '-') {
          result = (prev * current) / 100;
        } else if (this.operation === '×' || this.operation === '÷') {
          result = current / 100;
        }
      }
    } else {
      result = current / 100;
    }

    this.currentOperand = this.cleanPrecision(result).toString();
    this.updateDisplay();
  }

  /**
   * Performs the calculation safely without eval().
   * @param {boolean} isFinal - Whether triggered by '=' (stores to history) or chained operator
   */
  compute(isFinal = true) {
    if (this.isErrorState) return;

    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    // If either operand is missing or invalid, return
    if (isNaN(prev) || isNaN(current) || !this.operation) return;

    let computation;
    const expressionString = `${this.formatDisplayNumber(prev)} ${this.operation} ${this.formatDisplayNumber(current)}`;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.setError('Cannot divide by 0');
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Clean IEEE 754 precision artifacts (e.g., 0.1 + 0.2 = 0.3)
    const cleanedResult = this.cleanPrecision(computation);

    if (isFinal) {
      this.addHistory(expressionString, this.cleanPrecision(cleanedResult).toString());
      this.previousOperand = '';
      this.operation = undefined;
      this.shouldResetScreen = true;
      this.removeActiveOperatorHighlight();
    } else {
      this.previousOperand = cleanedResult.toString();
    }

    this.currentOperand = cleanedResult.toString();
    this.updateDisplay();
  }

  /**
   * Cleans floating point precision issues.
   * e.g., 0.1 + 0.2 => 0.3 instead of 0.30000000000000004
   */
  cleanPrecision(num) {
    if (typeof num !== 'number' || isNaN(num)) return num;
    // Round to 12 decimal places to eliminate tiny binary float drift
    const factor = 1e12;
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  /**
   * Sets the calculator into an error state.
   */
  setError(message) {
    this.isErrorState = true;
    this.currentOperand = message;
    this.previousOperand = '';
    this.operation = undefined;
    this.removeActiveOperatorHighlight();
    this.updateDisplay();
  }

  /**
   * Formats numbers with internationalized thousands separators
   * while preserving trailing decimals during input.
   */
  formatDisplayNumber(number) {
    if (this.isErrorState) return number.toString();

    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '';
    } else {
      integerDisplay = integerDigits.toLocaleString('en-US', {
        maximumFractionDigits: 0
      });
    }

    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }

  /**
   * Updates the UI displays and handles font scaling for long numbers.
   */
  updateDisplay() {
    if (this.isErrorState) {
      this.currentOperandElement.innerText = this.currentOperand;
      this.currentOperandElement.className = 'current-operand error-state';
      this.previousOperandElement.innerText = '';
      return;
    }

    const formattedCurrent = this.formatDisplayNumber(this.currentOperand);
    this.currentOperandElement.innerText = formattedCurrent || '0';

    // Scale font size dynamically based on length
    const charCount = formattedCurrent.length;
    if (charCount > 13) {
      this.currentOperandElement.className = 'current-operand very-long';
    } else if (charCount > 9) {
      this.currentOperandElement.className = 'current-operand long';
    } else {
      this.currentOperandElement.className = 'current-operand';
    }

    if (this.operation != null && this.previousOperand !== '') {
      this.previousOperandElement.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = '';
    }
  }

  /**
   * Highlights the operator button currently waiting for second operand.
   */
  highlightActiveOperator() {
    this.removeActiveOperatorHighlight();
    if (!this.operation) return;

    const opButtons = document.querySelectorAll('[data-operator]');
    opButtons.forEach(btn => {
      if (btn.dataset.operator === this.operation) {
        btn.classList.add('active-op');
      }
    });
  }

  /**
   * Removes highlight from operator buttons.
   */
  removeActiveOperatorHighlight() {
    document.querySelectorAll('.active-op').forEach(btn => btn.classList.remove('active-op'));
  }

  // --------------------------------------------------------------------------
  // History Management
  // --------------------------------------------------------------------------

  loadHistory() {
    try {
      const stored = localStorage.getItem('calc_pro_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('calc_pro_history', JSON.stringify(this.history));
    } catch {
      // Storage quota or sandboxing fallback
    }
    this.renderHistory();
  }

  addHistory(expression, result) {
    this.history.unshift({
      expression,
      result,
      id: Date.now()
    });
    // Keep max 25 records
    if (this.history.length > 25) {
      this.history.pop();
    }
    this.saveHistory();
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
  }

  renderHistory() {
    const listElement = document.getElementById('history-list');
    const badgeElement = document.getElementById('history-badge');
    if (!listElement) return;

    if (this.history.length === 0) {
      listElement.innerHTML = '<div class="history-empty">No calculations yet</div>';
      if (badgeElement) badgeElement.style.display = 'none';
      return;
    }

    if (badgeElement) {
      badgeElement.style.display = 'flex';
      badgeElement.innerText = this.history.length > 9 ? '9+' : this.history.length.toString();
    }

    listElement.innerHTML = '';
    this.history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.title = 'Click to recall this result';
      div.innerHTML = `
        <div class="history-item-expr">${item.expression} =</div>
        <div class="history-item-res">${this.formatDisplayNumber(item.result)}</div>
      `;
      div.addEventListener('click', () => {
        this.currentOperand = item.result.toString();
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = true;
        this.updateDisplay();
        toggleHistory(false);
      });
      listElement.appendChild(div);
    });
  }
}

// ----------------------------------------------------------------------------
// Application Initialization & Event Binding
// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const previousOperandElement = document.getElementById('previous-operand');
  const currentOperandElement = document.getElementById('current-operand');
  const calculator = new Calculator(previousOperandElement, currentOperandElement);

  // Initialize history list
  calculator.renderHistory();

  // 1. Button Click Handlers
  const keypad = document.getElementById('keypad');

  keypad.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const { number } = button.dataset;
    const { operator } = button.dataset;
    const { action } = button.dataset;

    if (number != null) {
      calculator.appendNumber(number);
    } else if (operator != null) {
      calculator.chooseOperation(operator);
    } else if (action === 'equals') {
      calculator.compute();
    } else if (action === 'all-clear') {
      calculator.clear();
    } else if (action === 'delete') {
      calculator.delete();
    } else if (action === 'percent') {
      calculator.computePercentage();
    }
  });

  // 2. Keyboard Support
  window.addEventListener('keydown', (e) => {
    let key = e.key;

    // Prevent default scrolling on space or slash
    if (key === '/' || key === ' ') {
      e.preventDefault();
    }

    // Number keys (0 - 9)
    if ((key >= '0' && key <= '9') || key === '.') {
      calculator.appendNumber(key);
      animateKeypress(key);
      return;
    }

    // Operator keys
    if (key === '+') {
      calculator.chooseOperation('+');
      animateKeypress('+');
    } else if (key === '-') {
      calculator.chooseOperation('-');
      animateKeypress('-');
    } else if (key === '*' || key.toLowerCase() === 'x') {
      calculator.chooseOperation('×');
      animateKeypress('*');
    } else if (key === '/') {
      calculator.chooseOperation('÷');
      animateKeypress('/');
    } else if (key === '%') {
      calculator.computePercentage();
      animateKeypress('%');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculator.compute();
      animateKeypress('Enter');
    } else if (key === 'Backspace') {
      calculator.delete();
      animateKeypress('Backspace');
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      calculator.clear();
      animateKeypress('Escape');
    }
  });

  /**
   * Adds temporary visual feedback to matching keyboard key.
   */
  function animateKeypress(dataKey) {
    const btn = document.querySelector(`[data-key="${dataKey}"]`);
    if (btn) {
      btn.classList.add('keyboard-active');
      setTimeout(() => btn.classList.remove('keyboard-active'), 140);
    }
  }

  // 3. Copy to Clipboard
  const copyBtn = document.getElementById('copy-btn');
  const copyTooltip = document.getElementById('copy-tooltip');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = calculator.currentOperand;
      if (!textToCopy || calculator.isErrorState) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback for non-https or restricted environments
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        // Show feedback tooltip
        if (copyTooltip) {
          copyTooltip.classList.add('show');
          setTimeout(() => copyTooltip.classList.remove('show'), 1500);
        }
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  }

  // 4. History Panel Drawer Toggle
  const historyToggleBtn = document.getElementById('history-toggle-btn');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyPanel = document.getElementById('history-panel');

  window.toggleHistory = function(forceState) {
    const isOpen = historyPanel.classList.contains('open');
    const newState = forceState !== undefined ? forceState : !isOpen;

    if (newState) {
      historyPanel.classList.add('open');
      historyPanel.setAttribute('aria-hidden', 'false');
    } else {
      historyPanel.classList.remove('open');
      historyPanel.setAttribute('aria-hidden', 'true');
    }
  };

  if (historyToggleBtn) {
    historyToggleBtn.addEventListener('click', () => toggleHistory());
  }

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', () => toggleHistory(false));
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      calculator.clearHistory();
    });
  }

  // 5. Theme Switcher (Dark / Light)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('calc_pro_theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', nextTheme);
      try {
        localStorage.setItem('calc_pro_theme', nextTheme);
      } catch {}
    });
  }
});
