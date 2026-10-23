import axios, { AxiosResponse } from 'axios';
import { VolunteerEvent } from '../types/Event';
import { User } from '../types/User';
import { getFromCache } from './caching';

const api = axios.create({
    // Before running your 'json-server', get your computer's IP address and
    // update your baseURL to `http://your_ip_address_here:3333` and then run:
    // `npx json-server --watch db.json --port 3333 --host your_ip_address_here`
    //
    // To access your server online without running json-server locally,
    // you can set your baseURL to:
    // `https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>`
    //
    // To use `my-json-server`, make sure your `db.json` is located at the repo root.

    baseURL: 'http://0.0.0.0:3333',
});

// Attach the logged-in user's token to every request (json-server-auth expects it on protected routes).
api.interceptors.request.use(async (config) => {
    try {
        const token = await getFromCache<string>('accessToken');
        if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` } as any;
    } catch {
        // not logged in yet — send the request without a token
    }
    return config;
});

export const authenticateUser = (email: string, password: string): Promise<AxiosResponse> => {
    return api.post(`/login`, { email, password });
};

export const getEvents = (): Promise<AxiosResponse<VolunteerEvent[]>> => {
    return api.get('/events');
};

export const getUser = (userId: string): Promise<AxiosResponse<User>> => {
    return api.get(`/users/${userId}`);
};

export const updateEventVolunteers = (
    eventId: string,
    volunteersIds: string[]
): Promise<AxiosResponse<VolunteerEvent>> => {
    return api.patch(`/events/${eventId}`, { volunteersIds });
};
