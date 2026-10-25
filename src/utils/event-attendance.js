const ATTENDANCE_POINTS = {
    onTime: 5,
    late: -2,
    didntGo: 0,
};

export function updateEventAttendance(event, attendanceKey, userId = 0) {
    if (!Object.hasOwn(ATTENDANCE_POINTS, attendanceKey)) return event;
    if (event.attendance?.[userId]) return event;

    return {
        ...event,
        attendance: {
            ...event.attendance,
            [userId]: attendanceKey,
        },
    };
}

export function getAttendancePoints(events, userId = 0) {
    return events.reduce((total, event) => {
        const attendanceKey = event.attendance?.[userId];
        return total + (ATTENDANCE_POINTS[attendanceKey] ?? 0);
    }, 0);
}
