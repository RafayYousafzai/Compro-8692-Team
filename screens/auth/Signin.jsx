import * as Updates from "expo-updates";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { colors } from "../../constants";
import firebase from "../../firebase/config";
import AsyncStorage from "@react-native-community/async-storage";
import { useToast } from "react-native-toast-notifications";

export default function Signin({ navigation }) {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifybtn, setVerifybtn] = useState(false);

  const toast = useToast();
  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  const sendVerificationEmail = async () => {
    try {
      user.sendEmailVerification();
      notify("Verification email sent successfully");
      setVerifybtn(false);
      return true;
    } catch (error) {
      notify(`Error sending verification email: ${error.message}`);
      return false;
    }
  };

  const handleSignIn = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail && password) {
      try {
        setLoading(true);
        const signInResult = await firebase
          .auth()
          .signInWithEmailAndPassword(trimmedEmail, password);

        if (signInResult) {
          const userData = await getUserDataByEmail(trimmedEmail);
          setUser(signInResult.user);
          if (userData) {
            if (signInResult.user.emailVerified) {
              // Check if email is verified
              await saveUserPass(trimmedEmail, password);
              await AsyncStorage.setItem("userData", JSON.stringify(userData));
              setLoading(false);
              Updates.reloadAsync();
            } else {
              setLoading(false);
              notify(
                "Email isn't verified, Please verify your email before logging in!"
              );
              setVerifybtn(true);
            }
          } else {
            notify("User not found", "User not found. Please sign up.");
          }
        }
      } catch (error) {
        setLoading(false);
        notify(error.message);
      }
    } else {
      notify("Incomplete fields", "Please fill in all the fields.");
    }
  };

  const saveUserPass = async (email, pass) => {
    try {
      const userRef = firebase
        .firestore()
        .collection("users")
        .where("email", "==", email);
      const snapshot = await userRef.get();

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const docId = doc.id;
          const docRef = firebase.firestore().collection("users").doc(docId);
          docRef.update({
            firstPassword: password,
          });
        });
      }
    } catch (error) {
      console.error("Error marking user as working:", error);
    }
  };

  const getUserDataByEmail = async (email) => {
    const usersCollection = firebase.firestore().collection("users");
    const userQuery = usersCollection.where("email", "==", email);
    const userSnapshot = await userQuery.get();

    if (!userSnapshot.empty) {
      return userSnapshot.docs[0].data();
    }

    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <ScrollView>
        <View style={styles.container}>
          {loading && <ActivityIndicator size="large" color={colors.primary} />}

          <View style={styles.inputContainer}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>Sign in</Text>
            <View style={styles.textInput}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCompleteType="email"
                autoFocus
                onChangeText={(text) => setEmail(text)}
                placeholderTextColor={colors.textsecoundary}
              />
            </View>

            <View style={styles.textInput}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                autoCompleteType="password"
                onChangeText={(text) => setPassword(text)}
                placeholderTextColor={colors.textsecoundary}
              />
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => navigation.push("Signup")}>
                <Text style={styles.linkText}>
                  Don't have an account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.push("ResetPassword")}>
              <Text style={styles.linkText}>Forget Password?</Text>
            </TouchableOpacity>
          </View>
          {/* )} */}
          {verifybtn ? (
            <>
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={sendVerificationEmail}
              >
                <Text style={styles.buttonText}>Verify Email</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 700,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    margin: 4,
    maxWidth: 300,
    width: 700,
    padding: 5,
  },
  input: {
    backgroundColor: colors.backgroundSecoundary,
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
  },
  signInButton: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  linkContainer: {
    flexDirection: "row",
  },
  linkText: {
    color: colors.primaryAccent,
    fontSize: 14,
    marginRight: 8,
  },
  verifyBtn: {
    width: "80%",
    maxWidth: 600,
    backgroundColor: colors.secoundaryAccent,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 8,
    position: "absolute",
    top: 30,
    zIndex: 99,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 20,
    marginTop: 100,
  },
});
