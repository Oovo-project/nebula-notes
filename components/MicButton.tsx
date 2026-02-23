export default function MicButton({
  active,
  busy,
  onClick,
}: {
  active: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="録音ボタン"
      className={`relative grid h-[168px] w-[168px] place-items-center rounded-full border transition ${
        active
          ? "border-[#8ab4f84d] bg-[#1b2538] shadow-[0_0_34px_rgba(138,180,248,0.25)]"
          : "border-[#8ab4f833] bg-[#1b2232] shadow-[0_0_20px_rgba(138,180,248,0.16)]"
      } ${busy ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <span className="absolute inset-[8px] rounded-full border border-[rgba(138,180,248,0.36)]" />
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" fill="#8ab4f8" />
        <path d="M7 10.5a5 5 0 1 0 10 0M12 16v4M10 20h4" stroke="#8ab4f8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
