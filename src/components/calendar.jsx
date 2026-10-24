import { useState } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(left, right) {
    return left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate();
}

export default function Calendar({ events = [], selectedDate, onSelectDate }) {
    const [visibleMonth, setVisibleMonth] = useState(
        () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    function changeMonth(offset) {
        setVisibleMonth((current) => new Date(
            current.getFullYear(),
            current.getMonth() + offset,
            1
        ));
    }

    function hasEvent(day) {
        return events.some((event) => isSameDay(new Date(event.time), day));
    }

    return (
        <section className="card bg-base-200 shadow-sm" aria-label="Calendar">
            <div className="card-body gap-5">
                <header className="flex items-center justify-between gap-3">
                    <button
                        aria-label="Previous month"
                        className="btn btn-ghost btn-sm"
                        onClick={() => changeMonth(-1)}
                        type="button"
                    >
                        <span aria-hidden="true">←</span>
                    </button>
                    <h2 className="text-lg font-bold">
                        {visibleMonth.toLocaleDateString(undefined, {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </h2>
                    <button
                        aria-label="Next month"
                        className="btn btn-ghost btn-sm"
                        onClick={() => changeMonth(1)}
                        type="button"
                    >
                        <span aria-hidden="true">→</span>
                    </button>
                </header>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {WEEKDAYS.map((weekday) => (
                        <span
                            className="py-2 text-xs font-semibold uppercase text-base-content/60"
                            key={weekday}
                        >
                            {weekday}
                        </span>
                    ))}
                    {Array.from({ length: firstWeekday }, (_, index) => (
                        <span aria-hidden="true" key={`empty-${index}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, index) => {
                        const day = new Date(year, month, index + 1);
                        const selected = isSameDay(day, selectedDate);
                        const todaySelected = isSameDay(day, today);
                        const dayHasEvent = hasEvent(day);

                        return (
                            <button
                                aria-label={`${day.toLocaleDateString(undefined, {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}${dayHasEvent ? ', has events' : ''}`}
                                aria-pressed={selected}
                                className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'bg-accent font-bold text-primary-content hover:bg-accent' : 'hover:bg-base-300'} ${todaySelected ? 'outline outline-3 outline-primary' : ''}`}
                                key={day.toISOString()}
                                onClick={() => onSelectDate(day)}
                                type="button"
                            >
                                {index + 1}
                                {dayHasEvent && (
                                    <span
                                        aria-hidden="true"
                                        className={`absolute bottom-1 h-1 w-1 rounded-full ${selected ? 'bg-primary-content' : 'bg-primary'}`}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-base-content/60">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                    Days with plans
                </p>
            </div>
        </section>
    );
}