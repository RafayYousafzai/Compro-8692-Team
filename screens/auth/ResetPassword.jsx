import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import firebase from "../../firebase/config";
import { colors } from "../../constants";

export default function ResetPassword({ route }) {
  const { passEmail } = route.params || {}; // Use destructuring with default empty object
  const [email, setEmail] = useState(passEmail || "");
  const toast = useToast();

  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  const resetPassword = async () => {
    try {
      if (!email) {
        notify("Please provide your email.");
        return;
      }

      await firebase.auth().sendPasswordResetEmail(email);
      notify(`Password reset email sent on ${email}. Check your inbox.`);
    } catch (error) {
      notify("Error sending password reset email.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!passEmail} // Allow editing if passEmail is not provided
      />
      <Button title="Send Password Reset Email" onPress={resetPassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    padding: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.textPrimary,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: colors.inputBorder,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 8,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecoundary,
    borderRadius: 10,
    maxWidth: 300,
  },
});
