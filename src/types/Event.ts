import { LatLng } from 'react-native-maps';

export interface VolunteerEvent {
    id: string;
    name: string;
    description: string;
    dateTime: Date;
    imageUrl?: string;
    organizerId: string;
    position: LatLng;
    volunteersNeeded: number;
    volunteersIds: string[];
}

/**
 * The three states an event can be in, from the point of view of the logged-in user.
 * - volunteered: the current user has already applied to this event
 * - open:        the event still needs volunteers and the user hasn't applied
 * - full:        the event has all the volunteers it needs
 */
export type EventStatus = 'volunteered' | 'open' | 'full';
