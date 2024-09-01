import NetInfo from "@react-native-community/netinfo";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHading from "../../components/ScreenHading";
import { colors } from "../../constants";
import firebase from "../../firebase/config";
import AsyncStorage from "@react-native-community/async-storage";
import { useToast } from "react-native-toast-notifications";

export default function MyAccount() {
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isOnline, setIsOnline] = useState(true);
  const [storedUserData, setStoredUserData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toast = useToast();
  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  useEffect(() => {
    getUserData();
    checkInternetConnection();
  }, []);

  const resetPassword = async () => {
    try {
      const email = userData.email || storedUserData.email;
      if (!email) {
        notify("Something went wrong.");
        return;
      }

      await firebase.auth().sendPasswordResetEmail(email);
      notify("Password reset email sent. Check your inbox.");
    } catch (error) {
      notify("Error sending password reset email.");
    }
  };

  const deleteUserAcc = async () => {
    try {
      const data = await AsyncStorage.getItem("userData");
      const userData = JSON.parse(data);
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(userData.email, userData.firstPassword);
      const usersRef = firebase.firestore().collection("users");
      const querySnapshot = await usersRef
        .where("email", "==", userData.email)
        .get();
      if (querySnapshot.size === 0) {
        notify("No matching user documents found.");
        return;
      }
      const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
        await docSnapshot.ref.delete();
      });
      await Promise.all(deletePromises);
      notify(`${querySnapshot.size} All details deleted successfully.`);
      await userCredential.user.delete();
      notify("Account deleted successfully");
      handleSignOut();
      toggleModal();
    } catch (error) {
      notify("Something went wrong");
    }
  };

  const checkInternetConnection = () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  };

  const getUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const data = JSON.parse(userDataString);
      setStoredUserData(data);
      const email = data.email;
      if (email) {
        const db = firebase.firestore();
        const userRef = db.collection("users").where("email", "==", email);
        const snapshot = await userRef.get();
        if (!snapshot.empty) {
          snapshot.forEach((doc) => {
            const data = doc.data();
            setUserData(data);
            setEditedData(data);
          });
        }
      }
    } catch (error) {
      notify("Error fetching user data");
    }
  };

  const handleInputChange = (name, value) => {
    setEditedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const db = firebase.firestore();
      const userRef = db
        .collection("users")
        .where("email", "==", userData.email);
      const snapshot = await userRef.get();

      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const docId = doc.id;
          const docRef = db.collection("users").doc(docId);
          docRef.update(editedData);
        });
      }

      await AsyncStorage.setItem("userData", JSON.stringify(editedData));
      setUserData(editedData);
      setEditMode(false);
    } catch (error) {
      notify("Error updating user data: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      Updates.reloadAsync();
    } catch (error) {
      notify("Error signing out: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#333", // Dark background color
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", marginBottom: 10 }}>
              Are you sure you want to permanently delete your account?
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#007bff", // Blue button color
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
                marginBottom: 10,
              }}
              onPress={deleteUserAcc}
            >
              <Text style={{ color: "white" }}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#666", // Dark gray button color
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
              }}
              onPress={() => toggleModal()}
            >
              <Text style={{ color: "white" }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScreenHading
        txt={`${userData.email || storedUserData.email}`}
        size={12}
      />
      <View style={styles.subContainer}>
        <Text style={styles.txt}>Class:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.class}
            onChangeText={(text) => handleInputChange("class", text)}
            editable={isOnline}
          />
        ) : (
          <Text style={styles.txt}>
            {userData.class || storedUserData.class}
          </Text>
        )}

        <Text style={styles.txt}>First Name:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.firstName}
            onChangeText={(text) => handleInputChange("firstName", text)}
            editable={isOnline}
          />
        ) : (
          <Text style={styles.txt}>
            {userData.firstName || storedUserData.firstName}
          </Text>
        )}

        <Text style={styles.txt}>Last Name:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.lastName}
            onChangeText={(text) => handleInputChange("lastName", text)}
            editable={isOnline}
          />
        ) : (
          <Text style={styles.txt}>
            {userData.lastName || storedUserData.lastName}
          </Text>
        )}

        <Text style={styles.txt}>House:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.houseColor}
            onChangeText={(text) => handleInputChange("houseColor", text)}
            editable={isOnline}
          />
        ) : (
          <Text style={styles.txt}>
            {userData.houseColor || storedUserData.houseColor}
          </Text>
        )}

        <Text style={styles.txt}>known Name:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedData.knownName}
            onChangeText={(text) => handleInputChange("knownName", text)}
            editable={isOnline}
          />
        ) : (
          <Text style={styles.txt}>
            {userData.knownName || storedUserData.knownName}
          </Text>
        )}

        {editMode ? (
          <Button title="Save" onPress={handleSave} disabled={!isOnline} />
        ) : (
          <Button title="Edit" onPress={handleEdit} disabled={!isOnline} />
        )}

        <Button title="Sign Out" onPress={handleSignOut} />
        <Button title="Reset Password" onPress={resetPassword} />
      </View>
      <Button title="Delete My Account Permanently" onPress={toggleModal} />
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
  subContainer: {
    width: "90%",
    maxWidth: 500,
    minWidth: 200,
    backgroundColor: colors.backgroundSecoundary,
    padding: 30,
    borderRadius: 15,
  },
  txt: {
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecoundary,
    borderRadius: 10,
  },
});
