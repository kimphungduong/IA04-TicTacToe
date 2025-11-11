# Tic Tac Toe Game

A modern implementation of the classic Tic Tac Toe game built with React, TypeScript, and Tailwind CSS.  
The game supports move history, sorting, winner highlighting, and draw detection — all in a clean and responsive UI.

---

## Features

- Interactive gameplay between two players (X & O)  
- Move history to review and jump back to any state  
- Sort toggle between ascending and descending move order  
- Highlight the three winning squares when someone wins  
- Display message when the game ends in a draw  
- Show coordinates (row, col) for each move in history  
- Responsive design for both desktop and mobile  
- Built with modern tools: React + TypeScript + Tailwind + Vite

---

## Getting Started

### Prerequisites

- Node.js version 18 or higher  
- npm or yarn

### Installation

1. Clone this repository
```bash
git clone https://github.com/<your-username>/tictac.git
cd tictac 
```

2. Install dependencies

```bash
npm install
```
3. Start the development server
```bash
npm run dev 
```

4. Open your browser and visit
http://localhost:8080

---

## How to play
1. Click any empty square to make your move.
2. Players alternate between X and O.
3. When a player wins, the three winning squares turn light yellow.
4. Use the Move History panel to:
  - Jump to a previous move
  - Sort moves (ascending ↔ descending)
  - Restart the game
5. If all squares are filled and no one wins, the game displays "Draw".

