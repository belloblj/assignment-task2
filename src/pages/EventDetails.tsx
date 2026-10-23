import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Spinner from 'react-native-loading-spinner-overlay';
import customMapStyle from '../../map-style.json';
import BigButton from '../components/BigButton';
import EventStatusBox from '../components/EventStatusBox';
import InfoBox from '../components/InfoBox';
import ScreenHeader from '../components/ScreenHeader';
import Spacer from '../components/Spacer';
import { Colors } from '../constants/Colors';
import * as MapSettings from '../constants/MapSettings';
import { AuthenticationContext } from '../context/AuthenticationContext';
import * as api from '../services/api';
import { VolunteerEvent } from '../types/Event';
import { User } from '../types/User';
import { formatAMPM, formatShortDate, getMapsUrl } from '../utils';
import { getEventStatus, markerImageByStatus } from '../utils/eventStatus';

export type EventDetailsParams = { event: VolunteerEvent };

export default function EventDetails({ navigation, route }: StackScreenProps<any>) {
    const authenticationContext = useContext(AuthenticationContext);
    const currentUser = authenticationContext?.value;

    // The event comes from the map screen through route params.
    const [event, setEvent] = useState<VolunteerEvent>((route.params as EventDetailsParams).event);
    const [organizer, setOrganizer] = useState<User>();
    const [isSaving, setIsSaving] = useState(false);

    const status = getEventStatus(event, currentUser?.id);
    const eventDate = new Date(event.dateTime);

    useEffect(() => {
        api.getUser(event.organizerId)
            .then((response) => setOrganizer(response.data))
            .catch(() => setOrganizer(undefined));
    }, [event.organizerId]);

    const handleVolunteer = () => {
        if (!currentUser) return;
        Alert.alert('Volunteer', `Do you want to volunteer for "${event.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Yes',
                onPress: () => {
                    setIsSaving(true);
                    api.updateEventVolunteers(event.id, [...event.volunteersIds, currentUser.id])
                        .then((response) => setEvent(response.data))
                        .catch(() => Alert.alert('Error', 'Could not apply to this event. Please try again.'))
                        .finally(() => setIsSaving(false));
                },
            },
        ]);
    };

    const handleShare = () => {
        Share.share({
            title: event.name,
            message: `${event.name} — ${formatShortDate(eventDate)} at ${formatAMPM(eventDate)}.\n\n${
                event.description
            }\n\nFind it on Volunteam!`,
        }).catch(() => Alert.alert('Error', 'Could not open the share dialog.'));
    };

    const openUrl = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert('Error', 'This action is not supported on this device.'));
    };

    const handleCall = () => organizer && openUrl(`tel:${organizer.mobile}`);
    const handleText = () => organizer && openUrl(`sms:${organizer.mobile}`);
    const handleShowRoutes = () => openUrl(getMapsUrl(event.position));

    const showShareButton = status !== 'full';
    const showVolunteerButton = status === 'open';
    const showContactButtons = status === 'volunteered';

    return (
        <View style={styles.container}>
            <Spinner visible={isSaving} textContent="Saving..." overlayColor="#031A62BF" textStyle={styles.spinnerText} />
            <ScreenHeader title="Event" onBackPress={() => navigation.goBack()} />

            <ScrollView>
                {event.imageUrl ? (
                    <Image style={styles.image} source={{ uri: event.imageUrl }} resizeMode="cover" />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Feather name="image" size={48} color={Colors.grey} />
                    </View>
                )}

                <View style={styles.content}>
                    <Text style={styles.title}>{event.name}</Text>
                    {organizer && (
                        <Text style={styles.organizer}>
                            Organized by {organizer.name.first} {organizer.name.last}
                        </Text>
                    )}
                    <Text style={styles.description}>{event.description}</Text>

                    <Spacer size={24} />
                    <View style={styles.row}>
                        <InfoBox
                            featherIconName="calendar"
                            color={Colors.blue}
                            lines={[formatShortDate(eventDate), formatAMPM(eventDate)]}
                        />
                        <View style={styles.gap} />
                        <EventStatusBox event={event} status={status} />
                    </View>

                    {(showShareButton || showVolunteerButton || showContactButtons) && <Spacer size={16} />}
                    <View style={styles.row}>
                        {showShareButton && (
                            <BigButton label="Share" color={Colors.blue} featherIconName="share-2" onPress={handleShare} />
                        )}
                        {showShareButton && (showVolunteerButton || showContactButtons) && <View style={styles.gap} />}
                        {showVolunteerButton && (
                            <BigButton
                                label="Volunteer"
                                color={Colors.orange}
                                featherIconName="plus"
                                onPress={handleVolunteer}
                            />
                        )}
                        {showContactButtons && (
                            <>
                                <BigButton
                                    label="Call"
                                    color={Colors.green}
                                    featherIconName="phone"
                                    disabled={!organizer}
                                    onPress={handleCall}
                                />
                                <View style={styles.gap} />
                                <BigButton
                                    label="Text"
                                    color={Colors.green}
                                    featherIconName="message-circle"
                                    disabled={!organizer}
                                    onPress={handleText}
                                />
                            </>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.mapContainer}>
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            customMapStyle={customMapStyle}
                            initialRegion={{ ...event.position, ...MapSettings.DEFAULT_DELTA }}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            scrollEnabled={false}
                            rotateEnabled={false}
                            toolbarEnabled={false}
                        >
                            <Marker coordinate={event.position}>
                                <Image
                                    resizeMode="contain"
                                    style={styles.marker}
                                    source={markerImageByStatus[status]}
                                />
                            </Marker>
                        </MapView>
                        <RectButton style={styles.routesButton} onPress={handleShowRoutes}>
                            <Text style={styles.routesText}>Show routes on Google Maps</Text>
                        </RectButton>
                    </View>
                    <Spacer size={32} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    image: {
        width: '100%',
        height: 240,
    },
    imagePlaceholder: {
        backgroundColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
    },
    title: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 30,
        color: Colors.title,
    },
    organizer: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        color: Colors.grey,
        marginTop: 4,
    },
    description: {
        fontFamily: 'Nunito_600SemiBold',
        fontSize: 15,
        lineHeight: 24,
        color: Colors.text,
        marginTop: 16,
    },
    row: {
        flexDirection: 'row',
    },
    gap: {
        width: 16,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 32,
    },
    mapContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1.2,
        borderColor: '#B3DAE2',
        backgroundColor: '#E6F7FB',
    },
    map: {
        width: '100%',
        height: 150,
    },
    marker: {
        width: 48,
        height: 54,
    },
    routesButton: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    routesText: {
        fontFamily: 'Nunito_700Bold',
        color: '#0089A5',
    },
    spinnerText: {
        fontFamily: 'Nunito_700Bold',
        color: Colors.white,
    },
});
