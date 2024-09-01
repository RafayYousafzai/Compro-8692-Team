import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-paper";
import { ScreenHading } from "../../components";
import { colors } from "../../constants";
import firebase from "../../firebase/config";
import { useToast } from "react-native-toast-notifications";

export default function ManageNominee() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nomineeData, setNomineeData] = useState({
    firstName: "",
    lastName: "",
    biography: "",
    picture: "",
  });
  const [nominees, setNominees] = useState([]);

  const toast = useToast();
  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  const db = firebase.firestore();

  useEffect(() => {
    const nomineesCollection = db.collection("nominees");
    const unsubscribe = nomineesCollection.onSnapshot((snapshot) => {
      const nomineesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNominees(nomineesData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNomineeData({ firstName: "", lastName: "", biography: "", picture: "" });
  };

  const handleInputChange = (name, value) => {
    if (name === "picture") {
      setSelectedFile(value);
    } else {
      setNomineeData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  async function handleSaveNominee() {
    try {
      let nomineeDataWithPicture = { ...nomineeData };
      if (selectedFile) {
        const uniqueName = Date.now().toString();
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`nomineePictures/${uniqueName}`);

        // Convert the local file URI to a Blob using XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open("GET", selectedFile, true);
        xhr.responseType = "blob";
        xhr.onload = async () => {
          const blob = xhr.response;

          await fileRef.put(blob);
          const downloadURL = await fileRef.getDownloadURL();

          nomineeDataWithPicture = {
            ...nomineeDataWithPicture,
            picture: downloadURL || "",
          };
        };
        xhr.send();
      }

      await db.collection("nominees").add(nomineeDataWithPicture);
      handleDialogClose();
    } catch (error) {
      notify("Error saving nominee");
    }
  }

  const handleUpdateNominee = async () => {
    try {
      let nomineeDataWithPicture = { ...nomineeData };
      if (selectedFile) {
        const uniqueName = Date.now().toString();
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`nomineePictures/${uniqueName}`);

        // Convert the local file URI to a Blob
        const xhr = new XMLHttpRequest();
        xhr.open("GET", selectedFile, true);
        xhr.responseType = "blob";
        xhr.onload = async () => {
          const blob = xhr.response;

          await fileRef.put(blob);
          const downloadURL = await fileRef.getDownloadURL();

          nomineeDataWithPicture = {
            ...nomineeDataWithPicture,
            picture: downloadURL || "",
          };

          await db
            .collection("nominees")
            .doc(nomineeData.id)
            .update(nomineeDataWithPicture);
          handleDialogClose();
        };
        xhr.send();
      } else {
        await db.collection("nominees").doc(nomineeData.id).update(nomineeData);
        handleDialogClose();
      }
    } catch (error) {
      notify("Error updating nominee");
    }
  };

  const handleEditNominee = (nominee) => {
    setNomineeData(nominee);
    handleDialogOpen();
  };

  const handleDeleteNominee = async (nominee) => {
    try {
      await db.collection("nominees").doc(nominee.id).delete();
    } catch (error) {
      notify("Error deleting nominee");
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        notify("Permission to access the camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0].uri);
        setNomineeData((prevData) => ({
          ...prevData,
          picture: result.assets[0].uri,
        }));
      }
    } catch (error) {
      notify("Error picking image");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <ScreenHading txt={"Manage Nominees"} />
        {dialogOpen && (
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogHeading}>
              {nomineeData.id ? "Edit" : "Add"} Nominee
            </Text>
            <View>
              <TextInput
                placeholder="First Name"
                placeholderTextColor={colors.textsecoundary}
                label="First Name"
                value={nomineeData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                style={styles.input}
              />
              <TextInput
                placeholder="Last Name"
                placeholderTextColor={colors.textsecoundary}
                label="Last Name"
                value={nomineeData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                style={styles.input}
              />
              <TextInput
                placeholder="Biography"
                placeholderTextColor={colors.textsecoundary}
                label="Biography"
                value={nomineeData.biography}
                onChangeText={(value) => handleInputChange("biography", value)}
                multiline={true}
                numberOfLines={4}
                style={styles.input}
              />
              <TouchableOpacity
                mode="contained"
                onPress={handlePickImage}
                style={{
                  padding: 10,
                  margin: 5,
                  borderRadius: 5,
                  backgroundColor: colors.primary,
                }}
                title="Add Picture"
              >
                <Text style={styles.btntxt}>Add Picture</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                mode="outlined"
                onPress={handleDialogClose}
                style={styles.errorButton}
              >
                <Text style={styles.btntxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                mode="contained"
                onPress={
                  nomineeData.id ? handleUpdateNominee : handleSaveNominee
                }
                style={styles.button}
              >
                <Text style={styles.btntxt}>
                  {nomineeData.id ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.header}>
          {!dialogOpen && (
            <TouchableOpacity
              mode="contained"
              onPress={handleDialogOpen}
              style={styles.button}
            >
              <Text style={styles.btntxt}>Add Nominee</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cards_conatiner}>
          {nominees.map((nominee) => (
            <Card key={nominee.id} style={styles.card}>
              <Card.Cover
                source={
                  nominee.picture
                    ? { uri: nominee.picture }
                    : require("../../assets/businessman-character-avatar.jpg")
                }
                style={styles.image}
              />
              <Card.Content>
                <Text style={styles.name}>
                  {nominee.firstName} {nominee.lastName}
                </Text>
                <Text
                  style={styles.biography}
                  onPress={() => alert(nominee.biography || "No bio available")}
                >
                  {((text, maxChars) =>
                    text.length > maxChars
                      ? text.substring(0, maxChars) + "..."
                      : text)(nominee.biography || "No bio available", 85)}
                </Text>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => handleEditNominee(nominee)}
                    style={styles.button}
                  >
                    <Text style={styles.btntxt}>Edit </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    mode="contained"
                    onPress={() => handleDeleteNominee(nominee)}
                    style={styles.errorButton}
                  >
                    <Text style={styles.btntxt}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  addButton: {
    backgroundColor: colors.primary,
  },
  cards_conatiner: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    // alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: colors.backgroundSecoundary,
    maxWidth: 400,
    margin: 4,
  },
  image: {
    height: 200,
  },
  name: {
    fontSize: 18,
    fontWeight: "900",
    margin: 4,
    color: colors.textPrimary,
  },
  biography: {
    color: colors.textsecoundary,
    margin: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: colors.primaryAccent,
    margin: 3,

    borderRadius: 7,
    padding: 12,
    color: colors.textPrimary,
  },
  btntxt: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  errorButton: {
    backgroundColor: colors.secoundary,
    margin: 3,
    fontSize: 15,
    fontWeight: "900",
    borderRadius: 7,
    padding: 12,
    color: colors.textPrimary,
  },
  dialogContainer: {
    padding: 16,
    backgroundColor: colors.backgroundSecoundary,
    borderRadius: 8,
    marginTop: 16,
  },
  dialogHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.backgroundSecoundary,
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    margin: 4,
  },
});
