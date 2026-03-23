import { CheckSquare, Square, Download } from 'lucide-react';

interface BatchActionsProps {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onConvert: () => void;
  isConverting: boolean;
}

export function BatchActions({
  totalCount,
  selectedCount,
  onSelectAll,
  onSelectNone,
  onConvert,
  isConverting,
}: BatchActionsProps) {
  const allSelected = selectedCount === totalCount;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={allSelected ? onSelectNone : onSelectAll}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          {allSelected ? (
            <Square className="h-4 w-4" />
          ) : (
            <CheckSquare className="h-4 w-4" />
          )}
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-sm text-white/40">
          {selectedCount} / {totalCount} selected
        </span>
      </div>

      <button
        onClick={onConvert}
        disabled={selectedCount === 0 || isConverting}
        className="btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        {isConverting ? 'Converting...' : `Convert ${selectedCount} video${selectedCount !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
