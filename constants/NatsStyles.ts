import {Dimensions, StyleSheet} from "react-native";

const screenWidth = Dimensions.get("window").width;

export const NatsStyles = StyleSheet.create({
    div: {
        marginTop: 10,
        marginBottom: 10,
    },
    lead: {
        marginTop: 10,
        fontSize: 18,
        lineHeight: 22,
        fontStyle: "italic",
        marginBottom: 20,
    },
    p: {
        fontSize: 16,
        lineHeight: 20,
        marginBottom: 10,
    },
    codebox: {
        marginTop: 20,
        marginBottom: 20,
    },
    code: {
        fontSize: 12,
        lineHeight: 14,
        fontFamily: "Courier",
    },
    logo: {
        width: screenWidth * .95,
        alignSelf: "center",
        resizeMode: "contain",
        bottom: 100,
    },
});
