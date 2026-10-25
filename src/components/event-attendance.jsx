const OPTIONS = [
    { key: 'onTime', label: 'On time', points: 5 },
    { key: 'late', label: 'Late', points: -2 },
    { key: 'didntGo', label: "Didn't go", points: 0 },
];

export default function EventAttendance({ event, onSelect, currentUserId = 0 }) {
    if (new Date(event.time) > new Date()) return null;

    const attendance = event.attendance?.[currentUserId];
    const selectedOption = OPTIONS.find((option) => option.key === attendance);

    if (selectedOption) {
        const points = selectedOption.points;
        const pointsLabel = points > 0 ? `+${points}` : points;

        return (
            <p className="mt-2 text-sm text-base-content/70" aria-live="polite">
                Attendance recorded: {selectedOption.label} ({pointsLabel} points)
            </p>
        );
    }

    return (
        <div className="mt-3 grid gap-2">
            <p className="text-sm font-medium">How did it go?</p>
            <div className="flex flex-wrap gap-2" aria-label={`Record attendance for ${event.title}`}>
                {OPTIONS.map((option) => (
                    <button
                        className="btn btn-xs btn-outline"
                        key={option.key}
                        onClick={() => onSelect(event, option.key)}
                        type="button"
                    >
                        {option.label} ({option.points > 0 ? '+' : ''}{option.points} pts)
                    </button>
                ))}
            </div>
        </div>
    );
}
