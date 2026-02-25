type ComponentContextMenuProps = {
  x: number;
  y: number;
  onDelete: () => void;
  deleteLabel?: string;
};

export const ComponentContextMenu = ({
  x,
  y,
  onDelete,
  deleteLabel,
}: ComponentContextMenuProps) => (
  <div
    className="fixed z-50 min-w-[160px] rounded-xl border border-sand-200 bg-white p-1 shadow-lg"
    style={{ left: x, top: y }}
    onClick={(event) => event.stopPropagation()}
  >
    <button
      type="button"
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
      onClick={onDelete}
    >
      {deleteLabel || "Delete component"}
    </button>
  </div>
);
