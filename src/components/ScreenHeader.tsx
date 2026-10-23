import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';

interface ScreenHeaderProps {
    title: string;
    onBackPress: () => void;
}

export default function ScreenHeader({ title, onBackPress }: ScreenHeaderProps) {
    return (
        <View style={styles.container}>
            <BorderlessButton onPress={onBackPress} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color={Colors.blue} />
            </BorderlessButton>
            <Text style={styles.title}>{title}</Text>
            {/* empty view keeps the title centred */}
            <View style={styles.backButton} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 24,
        height: 24,
    },
    title: {
        fontFamily: 'Nunito_600SemiBold',
        color: Colors.text,
        fontSize: 16,
    },
});
