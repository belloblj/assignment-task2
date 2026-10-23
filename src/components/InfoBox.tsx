import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoBoxProps {
    featherIconName: keyof typeof Feather.glyphMap;
    color: string;
    lines: string[];
}

// Presentational box: an icon plus one or more lines of text, tinted with `color`.
// Reused for both the date/time box and the event status box.
export default function InfoBox({ featherIconName, color, lines }: InfoBoxProps) {
    return (
        <View style={[styles.box, { backgroundColor: color + '1A', borderColor: color + '66' }]}>
            <Feather name={featherIconName} size={32} color={color} />
            <View style={styles.textBlock}>
                {lines.map((line, index) => (
                    <Text key={index} style={[styles.text, { color }]}>
                        {line}
                    </Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        minHeight: 140,
    },
    textBlock: {
        marginTop: 16,
    },
    text: {
        fontFamily: 'Nunito_700Bold',
        fontSize: 15,
        lineHeight: 22,
    },
});
