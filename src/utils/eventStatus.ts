import mapMarkerBlueImg from '../images/map-marker-blue.png';
import mapMarkerGreyImg from '../images/map-marker-grey.png';
import mapMarkerImg from '../images/map-marker.png';
import { Colors } from '../constants/Colors';
import { EventStatus, VolunteerEvent } from '../types/Event';

// Single source of truth for "what state is this event in for this user?".
// Both the map (marker colour) and the details page (status box + buttons) use it.
export const getEventStatus = (event: VolunteerEvent, userId?: string): EventStatus => {
    if (userId && event.volunteersIds.includes(userId)) return 'volunteered';
    if (event.volunteersIds.length >= event.volunteersNeeded) return 'full';
    return 'open';
};

export const isUpcoming = (event: VolunteerEvent): boolean => new Date(event.dateTime).getTime() > Date.now();

export const markerImageByStatus = {
    volunteered: mapMarkerBlueImg,
    open: mapMarkerImg,
    full: mapMarkerGreyImg,
};

export const colorByStatus = {
    volunteered: Colors.blue,
    open: Colors.orange,
    full: Colors.grey,
};
