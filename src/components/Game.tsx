import { useState } from "react";
import { Board, calculateWinningLine } from "./Board";
import { Button } from "./ui/button";
import { ArrowUpDown, RotateCcw, Trophy } from "lucide-react";

interface MoveHistory {
  squares: (string | null)[];
  location: { row: number; col: number } | null;
}

export const Game = () => {
  const [history, setHistory] = useState<MoveHistory[]>([
    { squares: Array(9).fill(null), location: null },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  const handlePlay = (
    nextSquares: (string | null)[],
    row: number,
    col: number
  ) => {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, location: { row, col } },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  };

  const jumpTo = (nextMove: number) => {
    setCurrentMove(nextMove);
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  const restartGame = () => {
    setHistory([{ squares: Array(9).fill(null), location: null }]);
    setCurrentMove(0);
  };

  const moves = history.map((step, move) => {
    const isCurrentMove = move === currentMove;

    if (isCurrentMove) {
      return (
        <li key={move} className="animate-in fade-in-50 duration-200">
          <div className="px-4 py-2.5 bg-blue-400 text-white rounded-lg font-medium shadow-sm">
            You are at move #{move}
            {step.location && ` - (${step.location.row}, ${step.location.col})`}
          </div>
        </li>
      );
    }

    const description = move
      ? `Go to move #${move} - (${step.location?.row}, ${step.location?.col})`
      : "Go to game start";

    return (
      <li key={move} className="animate-in fade-in-50 duration-200">
        <Button
          variant="ghost"
          onClick={() => jumpTo(move)}
          className="w-full justify-start text-left hover:bg-gray-100 
             text-black !text-black hover:!text-black focus:!text-black active:!text-black
             transition-colors"
>
          {description}
        </Button>
      </li>
    );
  });

  const displayedMoves = isAscending ? moves : moves.slice().reverse();
  const winningLine = calculateWinningLine(currentSquares);
  const isLatest = currentMove === history.length - 1;
  const isDraw = !winningLine && currentSquares.every((s) => s !== null);
  const isGameOver = !!winningLine || isDraw;

  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-purple-50 p-6">
      <div className="min-h-[70vh] bg-background p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent px-6 py-3 rounded-2xl shadow-lg">
              <Trophy className="h-7 w-7 text-primary-foreground" />
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Tic-Tac-Toe
              </h1>
            </div>
          </header>

          {/* Main Content */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 md:gap-6 items-start">
            {/* Game Board */}
            <div className="flex justify-center items-start p-2">
              <Board
                xIsNext={xIsNext}
                squares={currentSquares}
                onPlay={handlePlay}
                winningLine={winningLine}
                allowPlay={isLatest && !isGameOver}
              />
            </div>

            {/* Move History Sidebar */}
            <aside className="w-full">
              <div className="bg-card rounded-2xl border border-border shadow-lg p-4 md:p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <h2 className="text-lg font-bold text-card-foreground">
                    Move History
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSortOrder}
                    className="gap-2 h-9"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {isAscending ? "Asc" : "Desc"}
                    </span>
                  </Button>
                </div>

                <ol className="space-y-1 max-h-[300px] overflow-y-auto pr-1 mb-3">
                  {displayedMoves}
                </ol>

                {/* Restart Button */}
                <Button
                  onClick={restartGame}
                  className="w-full gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="font-semibold">Restart Game</span>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};
