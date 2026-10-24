const RESPONSE_KEYS = ['going', 'cantGo', 'maybe'];

export function updateEventResponses(event, optionKey, userId = 0) {
    if (!RESPONSE_KEYS.includes(optionKey)) return event;

    const responses = Object.fromEntries(
        RESPONSE_KEYS.map((key) => [
            key,
            (Array.isArray(event.responses?.[key]) ? event.responses[key] : [])
                .filter((responseUserId) => responseUserId !== userId),
        ])
    );
    responses[optionKey] = [...responses[optionKey], userId];

    return { ...event, responses };
}
