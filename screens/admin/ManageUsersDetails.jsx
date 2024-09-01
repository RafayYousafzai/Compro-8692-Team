import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import firebase from "../../firebase/config";
import { colors } from "../../constants";
import ScreenHeading from "../../components/ScreenHading";
import { useToast } from "react-native-toast-notifications";

const UserDetails = ({ route, navigation }) => {
  const { user } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const toast = useToast();
  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  const deleteUserAcc = async (email, pass) => {
    try {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(email, pass);
      console.log(userCredential);
      const usersRef = firebase.firestore().collection("users");
      const querySnapshot = await usersRef.where("email", "==", email).get();
      if (querySnapshot.size === 0) {
        console.log("No matching user documents found.");
        return;
      }
      const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
        await docSnapshot.ref.delete();
      });
      await Promise.all(deletePromises);
      console.log(`${querySnapshot.size} user documents deleted successfully.`);
      await userCredential.user.delete();
      console.log("User account deleted successfully.");
      toggleModal();
      navigation.push("ManageUsers");
    } catch (error) {
      console.log("Error deleting user", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const usersCollection = firebase.firestore().collection("users");
      await usersCollection.doc(user.id).update(editedUser);
      setIsEditing(false);
      navigation.push("ManageUsers");
    } catch (error) {
      notify("Error updating user data");
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
              onPress={() => deleteUserAcc(user.email, user.firstPassword)}
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
              onPress={toggleModal}
            >
              <Text style={{ color: "white" }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScreenHeading txt="User Details" />
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Role:</Text>
          <Text style={styles.detailValue}>{user.role}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>First Name:</Text>
          <Text style={styles.detailValue}>{user.firstName}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Last Name:</Text>
          <Text style={styles.detailValue}>{user.lastName}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>House Color:</Text>
          <Text style={styles.detailValue}>{user.houseColor}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Class:</Text>
          <Text style={styles.detailValue}>{user.class}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{user.email}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>First Password:</Text>
          <Text style={styles.detailValue}>{user.firstPassword}</Text>
        </View>
      </View>
      <Button title="delete Account" onPress={toggleModal} />

      <TouchableOpacity
        onPress={() =>
          navigation.push("ResetPassword", { passEmail: user.email })
        }
        style={styles.cancelButton}
      >
        <Text style={styles.buttonText}>Send Reset Password Link</Text>
      </TouchableOpacity>

      {!isEditing ? (
        <TouchableOpacity onPress={handleEditPress}>
          <View style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Details</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <Modal visible={isEditing} animationType="slide">
          <View style={styles.modalContainer}>
            <ScreenHeading txt="Edit User Details" />
            <TextInput
              style={styles.input}
              value={editedUser.role}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, role: text })
              }
              placeholder="Role"
              color={colors.textsecoundary}
            />
            <TextInput
              style={styles.input}
              value={editedUser.firstName}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, firstName: text })
              }
              placeholder="First Name"
              color={colors.textsecoundary}
            />
            <TextInput
              style={styles.input}
              value={editedUser.lastName}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, lastName: text })
              }
              placeholder="Last Name"
              color={colors.textsecoundary}
            />
            <TextInput
              style={styles.input}
              value={editedUser.houseColor}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, houseColor: text })
              }
              placeholder="House Color"
              color={colors.textsecoundary}
            />
            <TextInput
              style={styles.input}
              value={editedUser.class}
              onChangeText={(text) =>
                setEditedUser({ ...editedUser, class: text })
              }
              placeholder="Class"
              color={colors.textsecoundary}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleUpdate}>
                <View style={styles.updateButton}>
                  <Text style={styles.buttonText}>Update</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.backgroundPrimary,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.textPrimary,
  },
  detailsContainer: {
    backgroundColor: colors.backgroundSecoundary,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textsecoundary,
  },
  editButton: {
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  editButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.backgroundPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.backgroundSecoundary,
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  updateButton: {
    alignItems: "center",
    backgroundColor: colors.primaryAccent,
    padding: 12,
    borderRadius: 8,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.secoundary,
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserDetails;
