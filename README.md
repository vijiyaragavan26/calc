# CALC.PRO - Modern Interactive Glassmorphic Calculator

A premium, fully responsive calculator built with clean HTML5, CSS3, and Vanilla JavaScript. Designed for the **CodSoft Web Development Internship – Level 1 Task 3**.

---

## 🚀 Features

- **Modern Glassmorphic UI**: Ultra-sleek backdrop blur with subtle neon border glows and floating ambient gradient spheres.
- **Electric Blue & Purple Accents**: Contemporary dark navy & obsidian aesthetic with glowing highlights.
- **Theme Toggle**: One-click smooth transition between Dark Mode and Light Mode with persistent `localStorage`.
- **Safe Math Engine**: Strictly **no `eval()`** used. Handles IEEE 754 floating-point precision errors (e.g., `0.1 + 0.2 = 0.3`).
- **Consecutive & Chained Calculations**: Seamlessly compute multi-step expressions (e.g., `10 + 5 × 2`).
- **Calculation History Panel**: Slide-in panel tracking past calculations with single-click recall to the active display.
- **Clipboard Integration**: One-click result copying with animated feedback tooltip.
- **Tactile Keypad Animations**: Smooth hover scaling, click ripples, and visual feedback on both click and physical keyboard input.
- **Full Physical Keyboard Support**: Complete hotkey bindings for fast, hands-on calculations.
- **Error Protection**: Safe division by zero detection (`Cannot divide by 0`) and automatic error state recovery.
- **Zero Heavy Dependencies**: Pure semantic HTML5, CSS Grid/Flexbox, and vanilla JavaScript.

---

## ⌨️ Keyboard Shortcuts

| Key | Calculator Action |
| :--- | :--- |
| `0` – `9` | Enter numbers |
| `.` | Enter decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` or `x` / `X` | Multiplication |
| `/` | Division |
| `%` | Percentage calculation |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last digit (DEL) |
| `Escape` or `c` / `C` | Clear all (AC) |

---

## 📂 Project Structure

```
calculator/
├── index.html       # Semantic HTML5 layout & SVG icons
├── style.css        # CSS variables, glassmorphism, responsive grid, animations
├── script.js        # Calculator class, keyboard events, theme & history logic
└── README.md        # Comprehensive documentation & test cases
```

---

## 🛠️ How to Run the Project

1. Clone or download this project folder to your local machine.
2. Double-click `index.html` to open it in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari).
3. Alternatively, right click `index.html` and choose **Open with Live Server** in VS Code.

---

## 🧪 Testing Guide

| Operation | Input Sequence | Expected Result |
| :--- | :--- | :--- |
| **Addition** | `25 + 17 =` | `42` |
| **Subtraction** | `100 - 37.5 =` | `62.5` |
| **Multiplication** | `12.5 × 8 =` | `100` |
| **Division** | `144 ÷ 12 =` | `12` |
| **Division by Zero** | `50 ÷ 0 =` | `Cannot divide by 0` |
| **Decimal Precision** | `0.1 + 0.2 =` | `0.3` (not `0.30000000000000004`) |
| **Chained Calculation** | `10 + 5 × 2 =` | Evaluates `10 + 5` to `15`, then `15 × 2 = 30` |
| **Percentage (Chain)** | `200 + 15% =` | `230` |
| **Percentage (Standalone)** | `45 %` | `0.45` |
| **Backspace / Delete** | Enter `1234`, press `DEL` | `123` |
| **Clear All** | Enter `999`, press `AC` | `0` |
| **Copy Result** | Click copy icon top-right | Copies value & displays `Copied!` tooltip |
| **History Panel** | Click clock icon top-right | Opens history drawer with past calculations |
| **Theme Switching** | Click Sun/Moon icon | Toggles between Dark and Light mode |
