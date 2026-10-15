import { useId, useRef, useState, type DragEvent } from "react";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export function FileDropzone({ file, onFileSelect }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  function accept(next: File | null | undefined) {
    if (!next) return;
    if (next.type !== "application/pdf" && !next.name.toLowerCase().endsWith(".pdf")) {
      setError(`"${next.name}" is not a PDF. Please choose a .pdf file.`);
      return;
    }
    if (next.size > MAX_FILE_SIZE_BYTES) {
      setError(`"${next.name}" is larger than 20 MB. Please choose a smaller PDF.`);
      return;
    }
    setError(null);
    onFileSelect(next);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    accept(e.dataTransfer.files?.[0]);
  }

  function clear() {
    // Reset the native input too, otherwise re-picking the exact same file
    // fires no change event and the selection appears stuck.
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
    onFileSelect(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          // Ignore bubbling from child nodes, otherwise the highlight
          // flickers as the pointer crosses the icon and filename.
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-describedby={error ? `${errorId} ${hintId}` : hintId}
        className={`soft-inset flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-transparent bg-card px-6 py-10 text-center transition-all ${
          isDragging
            ? "border-accent/50 bg-accent-soft text-accent dark:border-accent-dark/50 dark:bg-accent-soft-dark"
            : "hover:border-line/60"
        }`}
      >
        {/* Kept in the accessibility tree and the tab order (previously
            `hidden`, i.e. display:none, which made uploading impossible for
            keyboard and screen-reader users). */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
        />
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="text-ink-muted dark:text-ink-muted-dark"
        >
          <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        {file ? (
          <div>
            <p className="text-sm text-ink dark:text-ink-dark">{file.name}</p>
            <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
              {(file.size / 1024).toFixed(0)} KB · click to replace
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink dark:text-ink-dark">
              Drop your resume PDF here
            </p>
            <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
              or press Enter to browse
            </p>
          </div>
        )}
      </div>

      <p id={hintId} className="text-xs text-ink-muted dark:text-ink-muted-dark">
        PDF only · max 20 MB.
      </p>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-danger dark:text-danger-dark"
        >
          {error}
        </p>
      )}

      {file && (
        <button
          type="button"
          onClick={clear}
          className="self-start rounded-lg text-xs text-ink-muted underline transition-colors hover:text-danger dark:text-ink-muted-dark dark:hover:text-danger-dark"
        >
          Remove file
        </button>
      )}
    </div>
  );
}
