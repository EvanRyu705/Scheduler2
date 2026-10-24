const OPTIONS = [
    { key: 'going', label: 'Can go', className: 'btn-success' },
    { key: 'cantGo', label: "Can't go", className: 'btn-error' },
    { key: 'maybe', label: 'Maybe / unsure', className: 'btn-warning' },
];

export default function EventResponses({
    event,
    people,
    currentUserId = 0,
    onSelect,
}) {
    const responses = event.responses ?? {};

    return (
        <div className="flex flex-wrap gap-2" aria-label={`RSVP for ${event.title}`}>
            {OPTIONS.map((option) => {
                const selectedIds = Array.isArray(responses[option.key])
                    ? responses[option.key]
                    : [];
                const names = selectedIds
                    .map((userId) => people.find((person) => person.user_id === userId)?.name)
                    .filter(Boolean);
                const selected = selectedIds.includes(currentUserId);
                const tooltip = names.length
                    ? `${option.label}: ${names.join(', ')}`
                    : `${option.label}: no one yet`;

                return (
                    <button
                        aria-pressed={selected}
                        aria-label={`${option.label}: ${selectedIds.length} people`}
                        className={`btn btn-xs tooltip ${option.key === 'going' ? 'tooltip-right' : 'tooltip-top'} ${selected ? option.className : 'btn-outline'}`}
                        data-tip={tooltip}
                        key={option.key}
                        onClick={() => onSelect(event, option.key)}
                        title={tooltip}
                        type="button"
                    >
                        {option.label}
                        <span className="badge badge-xs">{selectedIds.length}</span>
                    </button>
                );
            })}
        </div>
    );
}
