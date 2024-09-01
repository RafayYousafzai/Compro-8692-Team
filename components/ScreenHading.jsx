import { StyleSheet, Text } from "react-native";
import { colors } from "../constants";

export default function ScreenHeading({ txt, size }) {
  return <Text style={[styles.heading, { fontSize: size || 20 }]}>{txt}</Text>;
}

const styles = StyleSheet.create({
  heading: {
    fontWeight: "900",
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecoundary,
    borderRadius: 10,
    padding: 15,
    margin: 10,
    alignSelf: "center",
  },
});
