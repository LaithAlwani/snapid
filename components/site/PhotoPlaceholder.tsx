export function PhotoPlaceholder({
  label,
  tone = "light",
  className = "",
}: {
  label: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`absolute inset-0 grid place-items-center ${
        dark ? "bg-deep" : "bg-surface"
      } ${className}`}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dark ? "#3B82F6" : "#9FB4D0"}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <span
          className={`text-[13px] font-medium ${
            dark ? "text-on-deep" : "text-muted"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
