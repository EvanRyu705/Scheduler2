import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EVENTS, GROUPS, MESSAGES, USERS } from '../data';
import EventAttendance from '../components/event-attendance';
import EventResponses from '../components/event-responses';
import { updateEventAttendance } from '../utils/event-attendance';
import { updateEventResponses } from '../utils/event-responses';

const STORAGE_KEY = 'scheduler-groups-page';

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch {
        // Fall back to the sample data if localStorage is unavailable or invalid.
    }

    return {
        groups: GROUPS,
        messages: MESSAGES,
        events: EVENTS,
    };
}

export default function GroupsPage() {
    const [data, setData] = useState(loadData);
    const [activeGroupId, setActiveGroupId] = useState(
        () => loadData().groups[0]?.group_id ?? null
    );
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventTime, setEventTime] = useState('');
    const chatScrollRef = useRef(null);
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Unable to save group data.', error);
        }
    }, [data]);

    const activeGroup = data.groups.find(
        (group) => group.group_id === activeGroupId
    );
    const groupMessages =
        data.messages.find((entry) => entry.group_id === activeGroupId)?.messages ??
        [];
    const groupMessageCount = groupMessages.length;
    const groupEvents = data.events.filter(
        (event) => event.group_id === activeGroupId
    );

    useLayoutEffect(() => {
        const chatPanel = chatScrollRef.current;
        if (chatPanel) {
            chatPanel.scrollTop = chatPanel.scrollHeight;
        }
    }, [activeGroupId, groupMessageCount]);

    function updateEventResponse(event, option) {
        const eventIndex = data.events.indexOf(event);
        if (eventIndex < 0) return;

        setData((current) => ({
            ...current,
            events: current.events.map((item, index) =>
                index === eventIndex ? updateEventResponses(item, option) : item
            ),
        }));
    }

    function updateAttendance(event, attendanceKey) {
        const eventIndex = data.events.indexOf(event);
        if (eventIndex < 0) return;

        setData((current) => ({
            ...current,
            events: current.events.map((item, index) =>
                index === eventIndex
                    ? updateEventAttendance(item, attendanceKey)
                    : item
            ),
        }));
    }

    function createGroup(event) {
        event.preventDefault();

        const groupId =
            Math.max(0, ...data.groups.map((group) => group.group_id)) + 1;
        const newGroup = {
            group_id: groupId,
            name: groupName.trim() || 'New group',
            ids: [0, ...selectedFriends],
        };

        setData((current) => ({
            ...current,
            groups: [...current.groups, newGroup],
            messages: [...current.messages, { group_id: groupId, messages: [] }],
        }));
        setActiveGroupId(groupId);
        setGroupName('');
        setSelectedFriends([]);
        setShowGroupForm(false);
    }

    function restoreSampleData() {
        if (!window.confirm('Replace your saved groups, messages, and events with the sample data?')) {
            return;
        }

        setData({ groups: GROUPS, messages: MESSAGES, events: EVENTS });
        setActiveGroupId(GROUPS[0]?.group_id ?? null);
        setShowGroupForm(false);
        setShowEventForm(false);
    }

    function sendMessage(event) {
        event.preventDefault();
        const content = messageText.trim();
        if (!content || !activeGroup) return;

        setData((current) => {
            const existing = current.messages.find(
                (entry) => entry.group_id === activeGroupId
            );
            const updatedMessages = existing
                ? current.messages.map((entry) =>
                    entry.group_id === activeGroupId
                        ? {
                            ...entry,
                            messages: [...entry.messages, { sender: 0, content }],
                        }
                        : entry
                )
                : [
                    ...current.messages,
                    {
                        group_id: activeGroupId,
                        messages: [{ sender: 0, content }],
                    },
                ];

            return { ...current, messages: updatedMessages };
        });
        setMessageText('');
    }

    function createEvent(event) {
        event.preventDefault();
        if (!eventTitle.trim() || !eventTime || !activeGroup) return;

        setData((current) => ({
            ...current,
            events: [
                ...current.events,
                {
                    group_id: activeGroupId,
                    sender: 0,
                    title: eventTitle.trim(),
                    time: new Date(eventTime).toISOString(),
                    responses: { going: [], cantGo: [], maybe: [] },
                },
            ],
        }));
        setEventTitle('');
        setEventTime('');
        setShowEventForm(false);
    }

    function getUserName(userId) {
        return USERS.find((user) => user.user_id === userId)?.name ?? 'Unknown';
    }

    function getLatestMessage(groupId) {
        const messages = data.messages.find(
            (entry) => entry.group_id === groupId
        )?.messages ?? [];
        return messages.at(-1)?.content ?? 'Start a conversation';
    }

    return (
        <main className="mx-auto grid w-full min-w-0 max-w-7xl gap-6 p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="h-[calc(100dvh-11rem)] min-h-[32rem] min-w-0 overflow-y-auto rounded-box bg-base-200 p-4">
                <div className="mb-4 grid grid-cols-[1fr_auto] items-center gap-2">
                    <h1 className="text-xl font-bold">Groups</h1>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowGroupForm((visible) => !visible)}
                    >
                        New group
                    </button>
                </div>

                {showGroupForm && (
                    <form className="mb-4 grid gap-3 rounded-box bg-base-100 p-3" onSubmit={createGroup}>
                        <label className="form-control">
                            <span className="label-text mb-1">Group name</span>
                            <input
                                className="input input-bordered input-sm"
                                value={groupName}
                                onChange={(event) => setGroupName(event.target.value)}
                                placeholder="e.g. Movie night"
                            />
                        </label>

                        <fieldset className="grid gap-2">
                            <legend className="label-text mb-1">Invite friends</legend>
                            {USERS.filter((user) => user.user_id !== 0).map((user) => (
                                <label className="label cursor-pointer justify-start gap-2" key={user.user_id}>
                                    <input
                                        className="checkbox checkbox-sm"
                                        type="checkbox"
                                        checked={selectedFriends.includes(user.user_id)}
                                        onChange={(event) => {
                                            setSelectedFriends((current) =>
                                                event.target.checked
                                                    ? [...current, user.user_id]
                                                    : current.filter((id) => id !== user.user_id)
                                            );
                                        }}
                                    />
                                    <span>{user.name}</span>
                                </label>
                            ))}
                        </fieldset>

                        <div className="grid grid-cols-2 gap-2">
                            <button className="btn btn-primary btn-sm" type="submit">
                                Create
                            </button>
                            <button
                                className="btn btn-ghost btn-sm"
                                type="button"
                                onClick={() => setShowGroupForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid min-w-0 gap-2">
                    {data.groups.map((group) => (
                        <button
                            className={`btn h-auto min-h-14 w-full min-w-0 flex-col items-start justify-center gap-0 overflow-hidden py-2 text-left ${group.group_id === activeGroupId ? 'btn-primary' : 'btn-ghost'}`}
                            key={group.group_id}
                            onClick={() => setActiveGroupId(group.group_id)}
                        >
                            <span className="block w-full min-w-0 truncate font-semibold">
                                {group.name || group.ids.map(getUserName).join(', ')}
                            </span>
                            <span className={`block w-full min-w-0 truncate text-xs font-normal ${group.group_id === activeGroupId ? 'text-primary-content/75' : 'text-base-content/60'}`}>
                                {group.ids.length} members · {getLatestMessage(group.group_id)}
                            </span>
                        </button>
                    ))}
                    {data.groups.length === 0 && (
                        <p className="text-sm opacity-70">Create a group to get started.</p>
                    )}
                </div>

                <section className="mt-6 border-t border-base-300 pt-4" aria-labelledby="friends-heading">
                    <h2 className="mb-3 text-xl font-bold flex items-center justify-between" id="friends-heading">
                        Friends
                        <span className="badge badge-ghost">{USERS.length - 1}</span>
                    </h2>
                    <ul className="grid gap-2">
                        {USERS.filter((user) => user.user_id !== 0).map((user) => (
                            <li className="flex items-center gap-3 rounded-box bg-base-100 px-3 py-2" key={user.user_id}>
                                <span aria-hidden="true" className="avatar placeholder">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                                        {user.name.slice(0, 1)}
                                    </span>
                                </span>
                                <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.name}</span>
                                <span className="flex items-center gap-1.5 text-xs text-base-content/60">
                                    <span
                                        aria-hidden="true"
                                        className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-success' : user.status === 'away' ? 'bg-warning' : 'bg-base-300'}`}
                                    />
                                    {user.status === 'online' ? 'Online' : user.status === 'away' ? 'Away' : 'Offline'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="mt-4 border-t border-base-300 pt-4">
                    <button
                        className="btn btn-outline btn-sm w-full"
                        onClick={restoreSampleData}
                        type="button"
                    >
                        Reload sample data
                    </button>
                    <p className="mt-2 text-center text-xs text-base-content/60">
                        Replaces saved groups, chats, and events.
                    </p>
                </div>
            </aside>

            <section className="flex h-[calc(100dvh-11rem)] min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-box bg-base-200 p-4">
                {activeGroup ? (
                    <>
                        <header className="mb-4 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                            <div className="min-w-0">
                                <h2 className="text-xl font-bold">
                                    {activeGroup.name || activeGroup.ids.map(getUserName).join(', ')}
                                </h2>
                                <p className="truncate text-sm opacity-70">
                                    {activeGroup.ids.map(getUserName).join(', ')}
                                </p>
                            </div>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowEventForm((visible) => !visible)}
                            >
                                Create event
                            </button>
                        </header>

                        {showEventForm && (
                            <form className="mb-4 grid shrink-0 gap-3 rounded-box bg-base-100 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]" onSubmit={createEvent}>
                                <input
                                    className="input input-bordered"
                                    value={eventTitle}
                                    onChange={(event) => setEventTitle(event.target.value)}
                                    placeholder="Event title"
                                    required
                                />
                                <input
                                    className="input input-bordered"
                                    type="datetime-local"
                                    value={eventTime}
                                    onChange={(event) => setEventTime(event.target.value)}
                                    required
                                />
                                <button className="btn btn-primary" type="submit">
                                    Add event
                                </button>
                            </form>
                        )}

                        <section className="mb-4 max-h-36 shrink-0 overflow-y-auto" aria-label="Pinned events">
                            <h3 className="mb-2 font-semibold">Pinned events</h3>
                            {groupEvents.length ? (
                                <div className="grid gap-2">
                                    {groupEvents.map((event, index) => (
                                        <article className="grid gap-2 rounded-box border border-base-300 bg-base-100 p-3" key={`${event.title}-${index}`}>
                                            <div>
                                                <p className="font-medium">{event.title}</p>
                                                <p className="text-sm opacity-70">
                                                    {new Date(event.time).toLocaleString()}
                                                </p>
                                            </div>
                                            <EventResponses
                                                event={event}
                                                onSelect={updateEventResponse}
                                                people={USERS.filter((user) => activeGroup.ids.includes(user.user_id))}
                                            />
                                            <EventAttendance
                                                event={event}
                                                onSelect={updateAttendance}
                                            />
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-box bg-base-100 p-3 text-sm opacity-70">
                                    No events yet. Create one to pin it here.
                                </p>
                            )}
                        </section>

                        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3" aria-label="Group chat">
                            <h3 className="shrink-0 font-semibold">Chat</h3>
                            <div
                                className="min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-contain"
                                ref={chatScrollRef}
                            >
                                {groupMessages.map((message, index) => (
                                    <article
                                        className={`chat min-w-0 max-w-full ${message.sender === 0 ? 'chat-end' : 'chat-start'}`}
                                        key={`${message.sender}-${index}`}
                                    >
                                        <div className="chat-header max-w-full">{getUserName(message.sender)}</div>
                                        <div className="chat-bubble max-w-full break-words [overflow-wrap:anywhere]">{message.content}</div>
                                    </article>
                                ))}
                                {!groupMessages.length && (
                                    <p className="text-sm opacity-70">No messages yet. Say hello!</p>
                                )}
                            </div>
                        </section>

                        <form className="mt-4 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-2" onSubmit={sendMessage}>
                            <input
                                className="input input-bordered"
                                value={messageText}
                                onChange={(event) => setMessageText(event.target.value)}
                                placeholder="Write a message…"
                                aria-label="Message"
                            />
                            <button className="btn btn-primary" type="submit">
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="grid min-h-64 place-content-center text-center">
                        <p className="text-lg font-semibold">No groups yet</p>
                        <p className="mt-1 text-sm opacity-70">Create a group to start chatting and planning events.</p>
                    </div>
                )}
            </section>
        </main>
    );
}