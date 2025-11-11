import { cn } from "@/lib/utils";

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  isWinningSquare: boolean;
  disabled?: boolean;
}

export const Square = ({
  value,
  onSquareClick,
  isWinningSquare,
  disabled = false,
}: SquareProps) => {
  return (
    <button
      className={cn(
        "w-20 h-20 md:w-24 md:h-24 border-2 rounded-xl font-bold text-3xl md:text-4xl transition-all duration-200",
        "bg-game-square focus:outline-none focus:ring-2 focus:ring-primary/50",
        !value &&
          !disabled &&
          "cursor-pointer hover:bg-game-square-hover hover:border-primary/30 hover:shadow-md active:scale-95",
        value && "cursor-default",
        disabled && "opacity-70 cursor-not-allowed",
        isWinningSquare &&
          "bg-yellow-100 shadow-lg scale-105"

      )}
      onClick={onSquareClick}
      // disabled will be passed in via props; if value exists it's also disabled
      disabled={disabled || !!value}
    >
      <span
        className={cn(
          "block transition-all duration-300",
          value === "X" &&
            "text-red-600 dark:text-red-400 animate-in zoom-in-50 font-black",
          value === "O" &&
            "text-blue-600 dark:text-blue-400 animate-in zoom-in-50 font-black"
        )}
      >
        {value}
      </span>
    </button>
  );
};
