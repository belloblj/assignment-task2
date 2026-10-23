import React from 'react';
import { EventStatus, VolunteerEvent } from '../types/Event';
import { colorByStatus } from '../utils/eventStatus';
import InfoBox from './InfoBox';

interface EventStatusBoxProps {
    event: VolunteerEvent;
    status: EventStatus;
}

// Shows dynamic info depending on the event status for the current user:
//  - volunteered → "Volunteered"
//  - open        → "X of Y volunteer(s) needed"
//  - full        → "Team is full"
export default function EventStatusBox({ event, status }: EventStatusBoxProps) {
    const color = colorByStatus[status];

    switch (status) {
        case 'volunteered':
            return <InfoBox featherIconName="check" color={color} lines={['Volunteered']} />;
        case 'full':
            return <InfoBox featherIconName="slash" color={color} lines={['Team is full']} />;
        default:
            return (
                <InfoBox
                    featherIconName="users"
                    color={color}
                    lines={[`${event.volunteersIds.length} of ${event.volunteersNeeded}`, 'Volunteer(s) needed']}
                />
            );
    }
}
