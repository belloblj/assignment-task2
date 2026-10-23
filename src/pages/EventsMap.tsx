import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import customMapStyle from '../../map-style.json';
import { Colors } from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { getFromNetworkFirst } from '../services/caching';
import { VolunteerEvent } from '../types/Event';
import { getEventStatus, isUpcoming, markerImageByStatus } from '../utils/eventStatus';
import { EventDetailsParams } from './EventDetails';

export default function EventsMap(props: StackScreenProps<any>) {
    const { navigation } = props;
    const authenticationContext = useContext(AuthenticationContext);
    const currentUserId = authenticationContext?.value?.id;
    const mapViewRef = useRef<MapView>(null);
    const isFocused = useIsFocused();

    const [events, setEvents] = useState<VolunteerEvent[]>([]);
    const [userLocation, setUserLocation] = useState<LatLng>();

    // Runs when the app loads AND every time the user navigates back to this screen,
    // so changes made on the details page (e.g. volunteering) show up on the map.
    useEffect(() => {
        if (!isFocused) return;

        getFromNetworkFirst('events', api.getEvents().then((response) => response.data))
            .then((allEvents) => setEvents(allEvents.filter(isUpcoming)))
            .catch(() => setEvents([]));

        Location.requestForegroundPermissionsAsync()
            .then(({ granted }) => (granted ? Location.getCurrentPositionAsync({}) : undefined))
            .then((position) => position && setUserLocation(position.coords))
            .catch(() => setUserLocation(undefined));
    }, [isFocused]);

    // Reposition the map so the user and all available events fit on screen.
    const fitMapToContent = useCallback(() => {
        const coordinates: LatLng[] = events.map(({ position }) => ({
            latitude: position.latitude,
            longitude: position.longitude,
        }));
        if (userLocation) coordinates.push({ latitude: userLocation.latitude, longitude: userLocation.longitude });
        if (coordinates.length === 0) return;
        mapViewRef.current?.fitToCoordinates(coordinates, { edgePadding: MapSettings.EDGE_PADDING, animated: true });
    }, [events, userLocation]);

    useEffect(() => {
        if (isFocused) fitMapToContent();
    }, [isFocused, fitMapToContent]);

    const handleNavigateToCreateEvent = () => {};

    const handleNavigateToEventDetails = (event: VolunteerEvent) => {
        const params: EventDetailsParams = { event };
        navigation.navigate('EventDetails', params);
    };

    const handleLogout = async () => {
        AsyncStorage.multiRemove(['userInfo', 'accessToken']).then(() => {
            authenticationContext?.setValue(undefined);
            navigation.navigate('Login');
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapViewRef}
                provider={PROVIDER_GOOGLE}
                initialRegion={MapSettings.DEFAULT_REGION}
                style={styles.mapStyle}
                customMapStyle={customMapStyle}
                showsMyLocationButton={false}
                showsUserLocation={true}
                rotateEnabled={false}
                toolbarEnabled={false}
                moveOnMarkerPress={false}
                mapPadding={MapSettings.EDGE_PADDING}
                onLayout={fitMapToContent}
            >
                {events.map((event) => {
                    const status = getEventStatus(event, currentUserId);
                    return (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.position.latitude,
                                longitude: event.position.longitude,
                            }}
                            onPress={() => handleNavigateToEventDetails(event)}
                        >
                            <Image
                                resizeMode="contain"
                                style={{ width: 48, height: 54 }}
                                source={markerImageByStatus[status]}
                            />
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{events.length} event(s) found</Text>
                <RectButton
                    style={[styles.smallButton, { backgroundColor: Colors.blue }]}
                    onPress={handleNavigateToCreateEvent}
                >
                    <Feather name="plus" size={20} color="#FFF" />
                </RectButton>
            </View>
            <RectButton
                style={[styles.logoutButton, styles.smallButton, { backgroundColor: Colors.slate }]}
                onPress={handleLogout}
            >
                <Feather name="log-out" size={20} color="#FFF" />
            </RectButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    mapStyle: {
        ...StyleSheet.absoluteFillObject,
    },

    logoutButton: {
        position: 'absolute',
        top: 70,
        right: 24,

        elevation: 3,
    },

    footer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 40,

        backgroundColor: '#FFF',
        borderRadius: 16,
        height: 56,
        paddingLeft: 24,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        elevation: 3,
    },

    footerText: {
        fontFamily: 'Nunito_700Bold',
        color: '#8fa7b3',
    },

    smallButton: {
        width: 56,
        height: 56,
        borderRadius: 16,

        justifyContent: 'center',
        alignItems: 'center',
    },
});
