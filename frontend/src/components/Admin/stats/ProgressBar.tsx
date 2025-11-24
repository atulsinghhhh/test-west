

function ProgressBar({ value }: { value: number }) {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    return (
        <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
            <div
                className="h-full transition-all duration-300"
                style={{
                width: `${safe}%`,
                background: "linear-gradient(90deg,var(--color-primary,#3b82f6),#16a34a)",
                }}
            />
        </div>
    );
}


export default ProgressBar