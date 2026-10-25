
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import Calendar from '../components/calendar';
import EventAttendance from '../components/event-attendance';
import EventResponses from '../components/event-responses';
import { EVENTS, GROUPS, MESSAGES, USERS } from '../data';
import { getAttendancePoints, updateEventAttendance } from '../utils/event-attendance';
import { updateEventResponses } from '../utils/event-responses';

const STORAGE_KEY = 'scheduler-groups-page';
const AVATAR_STORAGE_KEY = 'scheduler-avatar';
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const LEADERBOARD_POINTS = {
    0: 70,
    1: 60,
    2: 65,
    3: 54,
    4: 82,
    5: 73,
    6: 48,
    7: 91,
};
const RANKINGS = USERS.map((user) => ({
    name: user.name,
    points: LEADERBOARD_POINTS[user.user_id] ?? 0,
    isCurrentUser: user.user_id === 0,
}));

function loadAvatar() {
    try {
        return localStorage.getItem(AVATAR_STORAGE_KEY) ?? '';
    } catch (error) {
        console.error('Unable to load the saved avatar image.', error);
        return '';
    }
}

function loadHomeData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return { events: EVENTS, groups: GROUPS, messages: MESSAGES };

        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed.events)) {
            throw new Error('Saved group data does not contain an events list.');
        }

        return {
            ...parsed,
            events: parsed.events.filter(
                (event) =>
                    event &&
                    typeof event.title === 'string' &&
                    !Number.isNaN(new Date(event.time).getTime())
            ),
            groups: Array.isArray(parsed.groups) ? parsed.groups : GROUPS,
            messages: Array.isArray(parsed.messages) ? parsed.messages : MESSAGES,
        };
    } catch (error) {
        console.error('Unable to load saved events for the home page.', error);
        return { events: EVENTS, groups: GROUPS, messages: MESSAGES };
    }
}

function getGroupName(groupId, groups) {
    const group = groups.find((item) => item.group_id === groupId);
    if (!group) return 'Group plan';

    return group.name || group.ids
        .map((id) => USERS.find((user) => user.user_id === id)?.name)
        .filter(Boolean)
        .join(', ');
}

function getGroupMembers(groupId, groups) {
    const group = groups.find((item) => item.group_id === groupId);
    return USERS.filter((user) => group?.ids.includes(user.user_id));
}

function formatDay(date) {
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function toDateTimeLocalValue(date) {
    const localDate = new Date(date);
    localDate.setHours(18, 0, 0, 0);
    return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16);
}

function LeaderboardRow({ person, rank, avatarUrl, onAvatarError, rowRef }) {
    return (
        <li
            className={`flex items-center gap-4 rounded-box bg-base-100 p-4 ${person.isCurrentUser ? 'border border-3 border-primary/40' : ''}`}
            ref={rowRef}
        >
            <span className="w-7 text-2xl font-bold tabular-nums text-primary">
                {rank}
            </span>
            <span className={`avatar ${!person.isCurrentUser || !avatarUrl ? 'placeholder' : ''}`}>
                {person.isCurrentUser && avatarUrl ? (
                    <span className="w-11 overflow-hidden rounded-full">
                        <img
                            alt={`${person.name}'s avatar`}
                            onError={onAvatarError}
                            src={avatarUrl}
                        />
                    </span>
                ) : (
                    <span
                        aria-label={`${person.name}'s avatar`}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-content"
                    >
                        {person.name.slice(0, 1)}
                    </span>
                )}
            </span>
            <span className="min-w-0 flex-1 font-semibold">{person.name}</span>
            <span className="text-sm text-base-content/70">{person.points} pts</span>
        </li>
    );
}

export default function HomePage() {
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [homeData, setHomeData] = useState(() => loadHomeData());
    const [avatarUrl, setAvatarUrl] = useState(() => loadAvatar());
    const [avatarLink, setAvatarLink] = useState('');
    const [avatarError, setAvatarError] = useState('');
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventGroupId, setEventGroupId] = useState('');
    const [eventTime, setEventTime] = useState(() => toDateTimeLocalValue(new Date()));
    const [eventError, setEventError] = useState('');
    const [responseError, setResponseError] = useState('');
    const [attendanceError, setAttendanceError] = useState('');
    const [currentRankPosition, setCurrentRankPosition] = useState(null);
    const leaderboardRef = useRef(null);
    const currentRankRowRef = useRef(null);
    const { events, groups } = homeData;
    const attendancePoints = getAttendancePoints(events);
    const rankings = RANKINGS.map((person) =>
        person.isCurrentUser
            ? { ...person, points: person.points + attendancePoints }
            : person
    ).sort((a, b) => b.points - a.points);
    const currentRank = rankings.findIndex((person) => person.isCurrentUser) + 1;
    const selectedEvents = events.filter(
        (event) => new Date(event.time).toDateString() === selectedDate.toDateString()
    );

    function openEventForm() {
        setEventGroupId(String(groups[0]?.group_id ?? ''));
        setEventTime(toDateTimeLocalValue(selectedDate));
        setEventError('');
        setShowEventForm(true);
    }

    function createEvent(event) {
        event.preventDefault();
        const title = eventTitle.trim();
        const groupId = Number(eventGroupId);
        const eventDate = new Date(eventTime);
        if (
            !title ||
            Number.isNaN(eventDate.getTime()) ||
            !groups.some((group) => group.group_id === groupId)
        ) {
            setEventError('Enter an event title and choose a group.');
            return;
        }

        const newEvent = {
            group_id: groupId,
            sender: 0,
            title,
            time: eventDate.toISOString(),
            responses: { going: [], cantGo: [], maybe: [] },
        };
        const updatedData = {
            ...homeData,
            events: [...events, newEvent],
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
            setHomeData(updatedData);
            setEventTitle('');
            setShowEventForm(false);
            setEventError('');
        } catch (error) {
            console.error('Unable to save the new event.', error);
            setEventError('The event could not be saved. Please try again.');
        }
    }

    function updateEventResponse(event, option) {
        const eventIndex = events.indexOf(event);
        if (eventIndex < 0) return;

        const updatedData = {
            ...homeData,
            events: events.map((item, index) =>
                index === eventIndex ? updateEventResponses(item, option) : item
            ),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
            setHomeData(updatedData);
            setResponseError('');
        } catch (error) {
            console.error('Unable to save your event response.', error);
            setResponseError('Your response could not be saved. Please try again.');
        }
    }

    function updateAttendance(event, attendanceKey) {
        const eventIndex = events.indexOf(event);
        if (eventIndex < 0) return;

        const updatedData = {
            ...homeData,
            events: events.map((item, index) =>
                index === eventIndex
                    ? updateEventAttendance(item, attendanceKey)
                    : item
            ),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
            setHomeData(updatedData);
            setAttendanceError('');
        } catch (error) {
            console.error('Unable to save your event attendance.', error);
            setAttendanceError('Your attendance could not be saved. Please try again.');
        }
    }

    useEffect(() => {
        const leaderboard = leaderboardRef.current;
        if (!leaderboard || !currentRankRowRef.current) return undefined;

        function updateCurrentRankPosition() {
            const row = currentRankRowRef.current;
            if (!row) return;

            const leaderboardBounds = leaderboard.getBoundingClientRect();
            const rowBounds = row.getBoundingClientRect();

            if (rowBounds.bottom <= leaderboardBounds.top) {
                setCurrentRankPosition('top');
            } else if (rowBounds.top >= leaderboardBounds.bottom) {
                setCurrentRankPosition('bottom');
            } else {
                setCurrentRankPosition(null);
            }
        }

        updateCurrentRankPosition();
        leaderboard.addEventListener('scroll', updateCurrentRankPosition);
        window.addEventListener('resize', updateCurrentRankPosition);

        return () => {
            leaderboard.removeEventListener('scroll', updateCurrentRankPosition);
            window.removeEventListener('resize', updateCurrentRankPosition);
        };
    }, [currentRank]);

    function saveAvatar(url) {
        try {
            localStorage.setItem(AVATAR_STORAGE_KEY, url);
            setAvatarUrl(url);
            setAvatarError('');
        } catch (error) {
            console.error('Unable to save the avatar image.', error);
            setAvatarError('The image could not be saved. Try a smaller image.');
        }
    }

    function updateAvatarFromLink(event) {
        event.preventDefault();
        let parsedUrl;

        try {
            parsedUrl = new URL(avatarLink.trim());
        } catch {
            setAvatarError('Enter a valid image link starting with http:// or https://.');
            return;
        }

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            setAvatarError('Enter a valid image link starting with http:// or https://.');
            return;
        }

        saveAvatar(parsedUrl.href);
    }

    function updateAvatar(event) {
        const input = event.currentTarget;
        const file = input.files?.[0];
        input.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setAvatarError('Choose an image file to use as your avatar.');
            return;
        }

        if (file.size > MAX_AVATAR_SIZE) {
            setAvatarError('Choose an image smaller than 2 MB.');
            return;
        }

        setAvatarError('');
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                setAvatarError('The selected image could not be read.');
                return;
            }

            saveAvatar(reader.result);
        };
        reader.onerror = () => {
            console.error('Unable to read the selected avatar image.', reader.error);
            setAvatarError('The selected image could not be read.');
        };
        reader.readAsDataURL(file);
    }

    function removeAvatar() {
        try {
            localStorage.removeItem(AVATAR_STORAGE_KEY);
            setAvatarUrl('');
            setAvatarError('');
        } catch (error) {
            console.error('Unable to remove the saved avatar image.', error);
            setAvatarError('The saved image could not be removed.');
        }
    }

    return (
        <div className="mx-auto grid w-full max-w-7xl gap-8 p-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)] lg:p-10">
            <section className="grid content-start gap-6">
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold sm:text-4xl">Prepare for events</h1>
                    <p className="max-w-2xl text-base-content/70">
                        See what’s coming up and find a day that works for everyone.
                    </p>
                </header>

                <Calendar
                    events={events}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />

                <section className="card bg-base-200 shadow-sm" aria-live="polite">
                    <div className="card-body">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="card-title">Plans for {formatDay(selectedDate)}</h2>
                            {groups.length > 0 && (
                                <button className="btn btn-primary btn-sm" onClick={openEventForm} type="button">
                                    Create event
                                </button>
                            )}
                        </div>
                        {showEventForm && (
                            <form className="grid gap-3 rounded-box bg-base-100 p-4 sm:grid-cols-2" onSubmit={createEvent}>
                                <label className="form-control sm:col-span-2">
                                    <input
                                        autoFocus
                                        className="input input-bordered"
                                        onChange={(event) => setEventTitle(event.target.value)}
                                        placeholder="Event title"
                                        required
                                        value={eventTitle}
                                    />
                                </label>
                                <label className="form-control">
                                    <span className="label-text mb-1">Group</span>
                                    <select
                                        className="select select-bordered"
                                        onChange={(event) => setEventGroupId(event.target.value)}
                                        required
                                        value={eventGroupId}
                                    >
                                        {groups.map((group) => (
                                            <option key={group.group_id} value={group.group_id}>
                                                {getGroupName(group.group_id, groups)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="form-control">
                                    <span className="label-text mb-1">Date and time</span>
                                    <input
                                        className="input input-bordered"
                                        onChange={(event) => setEventTime(event.target.value)}
                                        required
                                        type="datetime-local"
                                        value={eventTime}
                                    />
                                </label>
                                {eventError && (
                                    <p className="text-sm text-error sm:col-span-2" role="alert">{eventError}</p>
                                )}
                                <div className="flex justify-end gap-2 sm:col-span-2">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setShowEventForm(false);
                                            setEventError('');
                                        }}
                                        type="button"
                                    >
                                        Cancel
                                    </button>
                                    <button className="btn btn-primary btn-sm" type="submit">
                                        Save event
                                    </button>
                                </div>
                            </form>
                        )}
                        {responseError && (
                            <p className="text-sm text-error" role="alert">{responseError}</p>
                        )}
                        {attendanceError && (
                            <p className="text-sm text-error" role="alert">{attendanceError}</p>
                        )}
                        {selectedEvents.length ? (
                            <ul className="grid gap-3">
                                {selectedEvents.map((event) => (
                                    <li
                                        className="grid gap-3 rounded-box bg-base-100 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                                        key={events.indexOf(event)}
                                    >
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-base-content/65">
                                                {getGroupName(event.group_id, groups)}
                                            </p>
                                            <time className="text-sm text-base-content/70">
                                                {new Date(event.time).toLocaleTimeString([], {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </time>
                                            <EventResponses
                                                event={event}
                                                onSelect={updateEventResponse}
                                                people={getGroupMembers(event.group_id, groups)}
                                            />
                                            <EventAttendance
                                                event={event}
                                                onSelect={updateAttendance}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-base-content/70">
                                No plans on this day yet. Pick another date or make a plan with your group.
                            </p>
                        )}
                    </div>
                </section>
            </section>

            <aside className="grid content-start gap-6">
                <section className="card bg-base-200 shadow-sm mt-24">
                    <div className="card-body">
                        <div>
                            <h2 className="card-title mt-1">Leaderboard</h2>
                        </div>
                        <div className="grid gap-3">
                            <label className="form-control w-full max-w-xs">
                                <span className="label-text mb-1 text-xs">Upload an image for your avatar</span>
                                <input
                                    accept="image/*"
                                    aria-label="Upload your avatar image"
                                    className="file-input file-input-bordered file-input-sm"
                                    onChange={updateAvatar}
                                    type="file"
                                />
                            </label>
                            <form className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={updateAvatarFromLink}>
                                <label className="form-control">
                                    <span className="label-text mb-1 text-xs">Or paste an image link</span>
                                    <input
                                        aria-label="Avatar image link"
                                        className="input input-bordered input-sm"
                                        onChange={(event) => setAvatarLink(event.target.value)}
                                        placeholder="https://example.com/avatar.jpg"
                                        type="url"
                                        value={avatarLink}
                                    />
                                </label>
                                <button className="btn btn-outline btn-sm self-end" type="submit">
                                    Use link
                                </button>
                            </form>
                            {avatarUrl && (
                                <button
                                    className="btn btn-ghost btn-sm justify-self-start"
                                    onClick={removeAvatar}
                                    type="button"
                                >
                                    Remove avatar
                                </button>
                            )}
                        </div>
                        {avatarError && (
                            <p className="text-sm text-error" role="alert">{avatarError}</p>
                        )}
                        <div className="relative mt-2">
                            <ol
                                aria-label="Leaderboard rankings"
                                className="grid h-99 gap-3 overflow-y-auto pr-1"
                                ref={leaderboardRef}
                            >
                                {rankings.map((person, index) => (
                                    <LeaderboardRow
                                        avatarUrl={avatarUrl}
                                        key={person.name}
                                        onAvatarError={() => setAvatarError('The image link could not be loaded. Check that it points directly to an image.')}
                                        person={person}
                                        rank={index + 1}
                                        rowRef={person.isCurrentUser ? currentRankRowRef : undefined}
                                    />
                                ))}
                            </ol>
                            {currentRankPosition && (
                                <ol
                                    aria-label="Your current leaderboard position"
                                    aria-live="polite"
                                    className={`pointer-events-none absolute left-0 right-1 z-10 ${currentRankPosition === 'top' ? 'top-0' : 'bottom-0'}`}
                                >
                                    <LeaderboardRow
                                        avatarUrl={avatarUrl}
                                        onAvatarError={() => setAvatarError('The image link could not be loaded. Check that it points directly to an image.')}
                                        person={rankings[currentRank - 1]}
                                        rank={currentRank}
                                    />
                                </ol>
                            )}
                        </div>
                    </div>
                </section>
            </aside>
        </div>
    );
}