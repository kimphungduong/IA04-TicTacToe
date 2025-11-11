import { Square } from "./Square";

interface BoardProps {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (squares: (string | null)[], row: number, col: number) => void;
  winningLine: number[] | null;
  // if false, user interactions that would play a move should be ignored
  allowPlay?: boolean;
}

export const Board = ({
  xIsNext,
  squares,
  onPlay,
  winningLine,
  allowPlay = true,
}: BoardProps) => {
  const handleClick = (i: number) => {
    if (!allowPlay) {
      return;
    }
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    const row = Math.floor(i / 3);
    const col = i % 3;
    onPlay(nextSquares, row, col);
  };

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every((square) => square !== null);

  let status;
  let statusClass = "bg-card border-border";

  if (winner) {
    status = `Winner: ${winner}`;
    statusClass =
      "bg-gradient-to-r from-game-win/20 to-accent/10 border-game-win animate-in zoom-in-95 duration-300";
  } else if (isDraw) {
    status = "Draw - No one wins";
    statusClass = "bg-muted border-muted-foreground/20";
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`;
  }

  const renderSquare = (i: number) => {
    const isWinningSquare = winningLine?.includes(i) || false;
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        isWinningSquare={isWinningSquare}
        disabled={!allowPlay}
      />
    );
  };

  // Rewrite Board to use two loops to make the squares
  const renderBoard = () => {
    const rows = [];
    for (let row = 0; row < 3; row++) {
      const rowSquares = [];
      for (let col = 0; col < 3; col++) {
        rowSquares.push(renderSquare(row * 3 + col));
      }
      rows.push(
        <div key={row} className="flex gap-2 md:gap-3">
          {rowSquares}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="flex flex-col items-center gap-5 md:gap-6 w-full max-w-md">
      {/* Status Display */}
      <div
        className={`text-lg md:text-xl font-bold px-6 py-3 rounded-xl border-2 shadow-sm transition-all duration-300 ${statusClass}`}
      >
        {status}
      </div>

      {/* Game Board */}
      <div className="p-6 rounded-3xl bg-yellow-30 shadow-md border border-yellow-100">
        <div className="flex flex-col gap-2 md:gap-3">{renderBoard()}</div>
      </div>
    </div>
  );
};

function calculateWinner(squares: (string | null)[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export function calculateWinningLine(
  squares: (string | null)[]
): number[] | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}
