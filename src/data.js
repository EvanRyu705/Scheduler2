function atLocalTime(daysFromToday, hour, minute = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

export const USERS = [
    { user_id: 0, name: 'Evan', status: 'online' },
    { user_id: 1, name: 'Jason', status: 'online' },
    { user_id: 2, name: 'Miranda', status: 'away' },
    { user_id: 3, name: 'John', status: 'offline' },
    { user_id: 4, name: 'Maya', status: 'online' },
    { user_id: 5, name: 'Priya', status: 'away' },
    { user_id: 6, name: 'Alex', status: 'offline' },
    { user_id: 7, name: 'Sam', status: 'online' },
];

export const GROUPS = [
    { group_id: 1, name: 'Weekend crew', ids: [0, 1, 2, 5] },
    { group_id: 2, name: 'Movie club', ids: [0, 1, 3, 4] },
    { group_id: 3, name: 'Coffee & catch-ups', ids: [0, 2, 4, 6] },
    { group_id: 4, name: 'Trail mix', ids: [0, 3, 5, 6, 7] },
    { group_id: 5, name: 'Book club', ids: [0, 1, 2, 4, 7] },
];

export const MESSAGES = [
    {
        group_id: 1,
        messages: [
            { sender: 1, content: 'Anyone free to get dinner together this week?' },
            { sender: 2, content: 'I’m in! I found a cozy spot downtown that looks great.' },
            { sender: 5, content: 'The patio there is lovely. What time works for everyone?' },
            { sender: 0, content: 'I made a plan for tonight at 7. Hope that works!' },
            { sender: 1, content: 'Perfect — looking forward to it 🍜' },
        ],
    },
    {
        group_id: 2,
        messages: [
            { sender: 4, content: 'Movie night soon? I’ll bring the popcorn 🍿' },
            { sender: 3, content: 'Saturday afternoon is open for me.' },
            { sender: 1, content: 'Matinee sounds good. Anyone have a theater in mind?' },
            { sender: 0, content: 'I found one with a 2 pm showing — just added the event.' },
            { sender: 4, content: 'Count me in! I’ll meet you there.' },
        ],
    },
    {
        group_id: 3,
        messages: [
            { sender: 6, content: 'We are overdue for a coffee catch-up ☕' },
            { sender: 2, content: 'Yes! Harbor Roasters has a new seasonal menu.' },
            { sender: 4, content: 'I can do tomorrow morning if that works.' },
            { sender: 0, content: '10:30 works for me. See you there!' },
        ],
    },
    {
        group_id: 4,
        messages: [
            { sender: 7, content: 'The riverside trail should be beautiful this weekend.' },
            { sender: 3, content: 'I’m up for a morning hike. Is the loop still about an hour?' },
            { sender: 5, content: 'About an hour, plus a great overlook halfway through.' },
            { sender: 0, content: 'Let’s meet at the north entrance at 9.' },
            { sender: 6, content: 'I’ll bring extra water for the group.' },
        ],
    },
    {
        group_id: 5,
        messages: [
            { sender: 2, content: 'I just finished this month’s pick — ready to talk about it!' },
            { sender: 7, content: 'Same here. I have a few favorite passages.' },
            { sender: 1, content: 'Should we bring a book to swap, too?' },
            { sender: 4, content: 'Love that idea. I’ll bring a couple of extras.' },
            { sender: 0, content: 'Library meetup is on the calendar for next week 📚' },
        ],
    },
];

export const EVENTS = [
    {
        group_id: 1,
        sender: 0,
        title: 'Dinner at Juniper & Rye',
        time: atLocalTime(0, 19),
        responses: { going: [1, 2], cantGo: [5], maybe: [] },
    },
    {
        group_id: 3,
        sender: 0,
        title: 'Coffee at Harbor Roasters',
        time: atLocalTime(1, 10, 30),
        responses: { going: [2, 4], cantGo: [], maybe: [6] },
    },
    {
        group_id: 2,
        sender: 0,
        title: 'Saturday matinee + snacks',
        time: atLocalTime(2, 14),
        responses: { going: [1, 4], cantGo: [3], maybe: [] },
    },
    {
        group_id: 1,
        sender: 0,
        title: 'Farmers market stroll',
        time: atLocalTime(3, 10),
        responses: { going: [1], cantGo: [], maybe: [2, 5] },
    },
    {
        group_id: 4,
        sender: 0,
        title: 'Riverside trail loop',
        time: atLocalTime(4, 9),
        responses: { going: [3, 5, 7], cantGo: [6], maybe: [] },
    },
    {
        group_id: 5,
        sender: 0,
        title: 'Book swap at the library',
        time: atLocalTime(6, 16),
        responses: { going: [1, 2, 4, 7], cantGo: [], maybe: [] },
    },
    {
        group_id: 3,
        sender: 0,
        title: 'Midweek coffee catch-up',
        time: atLocalTime(7, 17, 30),
        responses: { going: [2], cantGo: [6], maybe: [4] },
    },
];
