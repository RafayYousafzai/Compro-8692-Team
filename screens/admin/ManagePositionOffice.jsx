import { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHading from "../../components/ScreenHading";
import { colors } from "../../constants";
import firebase from "../../firebase/config";
import { useToast } from "react-native-toast-notifications";

export default function ManagePositionOffice() {
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState({
    name: "",
    description: "",
  });
  const [editPosition, setEditPosition] = useState(null);

  const toast = useToast();
  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  useEffect(() => {
    const db = firebase.firestore();
    const positionsCollection = db.collection("positions");
    const unsubscribe = positionsCollection.onSnapshot((snapshot) => {
      const positionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPositions(positionData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleInputChange = (name, value) => {
    setNewPosition((prevPosition) => ({
      ...prevPosition,
      [name]: value,
    }));
  };

  const addPosition = async () => {
    if (!newPosition.name || !newPosition.description) {
      notify("Both name and description must be filled.");
      return;
    }

    const db = firebase.firestore();
    const positionsCollection = db.collection("positions");

    try {
      const newPositionDoc = await positionsCollection.add(newPosition);
      const newPositionData = { id: newPositionDoc.id, ...newPosition };
      setPositions((prevPositions) => [...prevPositions, newPositionData]);
      setNewPosition({ name: "", description: "" });
    } catch (error) {
      notify("Error adding position");
    }
  };

  const editPositionData = (position) => {
    setEditPosition(position);
    setNewPosition({
      name: position.name,
      description: position.description,
    });
  };

  const updatePosition = async () => {
    const db = firebase.firestore();
    const positionRef = db.collection("positions").doc(editPosition.id);
    try {
      await positionRef.update(newPosition);
      setEditPosition(null);
      setNewPosition({ name: "", description: "" });
    } catch (error) {
      notify("Error updating position");
    }
  };

  const deletePosition = async (position) => {
    const db = firebase.firestore();
    const positionRef = db.collection("positions").doc(position.id);
    try {
      await positionRef.delete();
    } catch (error) {
      notify("Error deleting position");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <ScreenHading txt={"Positions & Offices"} />
        <View style={styles.formContainer}>
          <TextInput
            name="name"
            placeholder="Office"
            placeholderTextColor={colors.textPrimary}
            value={newPosition.name}
            onChangeText={(text) => handleInputChange("name", text)}
            style={styles.input}
          />
          <TextInput
            name="description"
            placeholder="Position"
            placeholderTextColor={colors.textPrimary}
            value={newPosition.description}
            onChangeText={(text) => handleInputChange("description", text)}
            style={styles.input}
          />
          {editPosition ? (
            <Button
              onPress={updatePosition}
              title="Update"
              color={colors.primary}
            />
          ) : (
            <TouchableOpacity onPress={addPosition} style={styles.button}>
              <Text style={styles.btntxt}>Add Positions / Offices</Text>
            </TouchableOpacity>
          )}
        </View>

        {positions.map((position, index) => (
          <View style={styles.positionContainer} key={index}>
            <View>
              <Text style={styles.positionName}>{position.name}</Text>
              <Text style={styles.bio}>{position.description}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => editPositionData(position)}
              >
                <Text style={styles.btntxt}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.errorbutton}
                onPress={() => deletePosition(position)}
              >
                <Text style={styles.btntxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.backgroundPrimary,
  },
  btntxt: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  button: {
    backgroundColor: colors.primaryAccent,
    margin: 3,
    borderRadius: 7,
    padding: 9,
  },
  errorbutton: {
    backgroundColor: colors.secoundary,
    margin: 3,
    borderRadius: 7,
    padding: 9,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 16,
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
  positionContainer: {
    margin: 5,
    backgroundColor: colors.backgroundSecoundary,
    borderRadius: 7,
    padding: 20,
  },
  positionName: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  bio: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textsecoundary,
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
});
