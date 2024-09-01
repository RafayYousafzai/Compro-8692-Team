import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { colors } from "./constants";
import AuthNavigation from "./naivgation/AuthNavigation";
import { ToastProvider } from 'react-native-toast-notifications'


export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ToastProvider>
       <AuthNavigation />
      </ToastProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
});
