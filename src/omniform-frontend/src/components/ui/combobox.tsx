import { useMemo, useState } from "react";
import { cn } from "../../utils/cn";

type Option = { value: string; label: string };

type ComboBoxProps = {
  options: Option[];
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
};

export const ComboBox = ({
  options,
  value,
  placeholder,
  onChange,
  className,
}: ComboBoxProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const lower = query.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lower)
    );
  }, [options, query]);

  return (
    <div className={cn("relative", className)}>
      {selected ? (
        <div className="flex items-center justify-between rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-base text-sand-950">
          <span>{selected.label}</span>
          <button
            type="button"
            className="text-sm font-semibold text-sand-700 hover:text-sand-950"
            onClick={() => {
              onChange("");
              setQuery("");
              setOpen(true);
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <input
            className="w-full rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-base text-sand-950 placeholder:text-sand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-900"
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
          />
          {open && query.trim().length ? (
            <div className="absolute left-0 right-0 z-10 mt-2 max-h-56 overflow-auto rounded-2xl border border-sand-300 bg-sand-50 shadow-lg">
              {filtered.length ? (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-sand-100",
                      option.value === value ? "bg-sand-100" : ""
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(option.value);
                      setQuery("");
                      setOpen(false);
                    }}
                    type="button"
                  >
                    <span>{option.label}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-sand-500">No matches</div>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
