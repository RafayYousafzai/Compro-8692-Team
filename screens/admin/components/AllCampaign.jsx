import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenHading from "../../../components/ScreenHading";
import { colors } from "../../../constants";
import firebase from "../../../firebase/config";
import { useToast } from "react-native-toast-notifications";

export default function AllCampaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [nomineeNames, setNomineeNames] = useState({});
  const [positions, setPositions] = useState([]);
  const [positionNames, setPositionNames] = useState({});
  const [editCampaign, setEditCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const fetchCollections = async () => {
      const nomineesCollection = db.collection("nominees");
      const positionsCollection = db.collection("positions");

      try {
        const nomineesSnapshot = await nomineesCollection.get();
        const nomineesData = nomineesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNominees(nomineesData);
      } catch (error) {
        notify("Error while fetching nominees");
      }

      try {
        const positionsSnapshot = await positionsCollection.get();
        const positionsData = positionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPositions(positionsData);
      } catch (error) {
        notify("Error while fetching positions");
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const campaignsCollection = db.collection("campaigns");

    const unsubscribe = campaignsCollection.onSnapshot((snapshot) => {
      const campaignData = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setCampaigns(campaignData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchPositionName = async (positionId) => {
    const positionRef = db.collection("positions").doc(positionId);

    try {
      const positionSnap = await positionRef.get();
      if (positionSnap.exists) {
        return positionSnap.data().name;
      }
    } catch (error) {
      notify("something went wrong");
    }
    return "";
  };

  const fetchPositionNames = async (campaigns) => {
    const positionIds = campaigns.map((campaign) => campaign.position);
    const positionsData = {};

    for (const positionId of positionIds) {
      positionsData[positionId] = await fetchPositionName(positionId);
    }

    setPositionNames(positionsData);
  };

  useEffect(() => {
    if (campaigns.length > 0) {
      fetchPositionNames(campaigns);
    }
  }, [campaigns]);

  const fetchNomineeNames = async (nomineeIds) => {
    const namesData = {};

    try {
      for (const nomineeId of nomineeIds) {
        const nomineeDoc = await db.collection("nominees").doc(nomineeId).get();
        if (nomineeDoc.exists) {
          const fullName = `${nomineeDoc.data().firstName} ${
            nomineeDoc.data().lastName
          }`;
          namesData[nomineeId] = fullName;
        }
      }
    } catch (error) {
      notify("something went wrong");
    }

    setNomineeNames(namesData);
  };

  useEffect(() => {
    if (campaigns.length > 0) {
      const nomineeIds = campaigns.flatMap((campaign) =>
        campaign.nominees.map((data) => data)
      );
      fetchNomineeNames(nomineeIds);
    }
  }, [campaigns]);

  const handleEditInputChange = (name, value) => {
    setEditCampaign({
      ...editCampaign,
      [name]: value,
    });
  };

  const handleUpdateCampaign = async () => {
    const { startDate, endDate } = editCampaign;
    const dateFormatRegex = /^\d{4}\/\d{2}\/\d{2}$/;

    if (!startDate.match(dateFormatRegex) || !endDate.match(dateFormatRegex)) {
      notify("Invalid date format. Please use yyyy/mm/dd format.");
      return;
    }

    if (!startDate || !endDate) {
      notify("Start date and end date cannot be empty.");
      return;
    }

    const campaignRef = db.collection("campaigns").doc(editCampaign.id);

    try {
      await campaignRef.update(editCampaign);
      setIsModalOpen(false);
    } catch (error) {
      notify("Something Went Wrong");
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    const campaignRef = db.collection("campaigns").doc(campaignId);

    try {
      await campaignRef.delete();
    } catch (error) {
      notify("Error deleting campaign");
    }
  };

  const handleOpenEditModal = (campaign) => {
    setEditCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditCampaign(null);
    setIsModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subheading}>
              Office / Position: {positionNames[item.position] || "none"}
            </Text>
            {item.nominees.map((data, ind) => (
              <Text key={ind} style={styles.bodyText}>
                ({ind + 1}) Nominee: {nomineeNames[data]}
              </Text>
            ))}
            <Text style={styles.bodyText}>Start Date: {item.startDate}</Text>
            <Text style={styles.bodyText}>End Date: {item.endDate}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => handleOpenEditModal(item)}
                style={styles.button}
              >
                <Text style={styles.btntxt}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteCampaign(item.id)}
                style={styles.errorButton}
              >
                <Text style={styles.btntxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={isModalOpen} animationType="slide">
        <View style={styles.modalContainer}>
          <ScreenHading txt={"Edit Campaign"} />
          {editCampaign && (
            <View style={styles.modalCard}>
              <Picker
                selectedValue={editCampaign.position}
                onValueChange={(value) =>
                  handleEditInputChange("position", value)
                }
                style={styles.picker}
              >
                {positions.map((position) => (
                  <Picker.Item
                    key={position.id}
                    value={position.id}
                    label={`${position.name} / ${position.description}`}
                  />
                ))}
              </Picker>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Nominees:</Text>
                {nominees.map((nominee) => (
                  <View key={nominee.id} style={styles.switchItem}>
                    <Text style={styles.switchText}>
                      {nominee.firstName} {nominee.lastName}
                    </Text>
                    <Switch
                      value={editCampaign.nominees.includes(nominee.id)}
                      onValueChange={(value) => {
                        const nominees = editCampaign.nominees;
                        if (value) {
                          nominees.push(nominee.id);
                        } else {
                          const index = nominees.indexOf(nominee.id);
                          if (index > -1) {
                            nominees.splice(index, 1);
                          }
                        }
                        handleEditInputChange("nominees", [...nominees]);
                      }}
                    />
                  </View>
                ))}
              </View>

              <TextInput
                style={styles.input}
                name="startDate"
                value={editCampaign.startDate}
                onChangeText={(value) =>
                  handleEditInputChange("startDate", value)
                }
              />

              <TextInput
                style={styles.input}
                name="endDate"
                value={editCampaign.endDate}
                onChangeText={(value) =>
                  handleEditInputChange("endDate", value)
                }
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  onPress={handleUpdateCampaign}
                  style={styles.button}
                >
                  <Text style={styles.btntxt}>Update Campaign</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleCloseEditModal}
            style={styles.errorButton}
          >
            <Text style={styles.btntxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 8,
    padding: 35,
    marginBottom: 20,
    backgroundColor: colors.backgroundSecoundary,
    margin: 10,
    minWidth: "90%",
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.textPrimary,
  },
  bodyText: {
    marginBottom: 5,
    color: colors.textsecoundary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.backgroundPrimary,
  },
  modalHeading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.textPrimary,
  },
  modalCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: colors.backgroundSecoundary,
  },
  input: {
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: colors.textPrimary,
  },
  modalButtonContainer: {
    marginTop: 10,
  },
  switchContainer: {
    marginBottom: 10,
  },
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.textPrimary,
  },
  switchText: {
    flex: 1,
    marginRight: 10,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primaryAccent,
    margin: 3,
    borderRadius: 3,
    padding: 12,
    color: colors.textPrimary,
    minWidth: "45%",
  },
  btntxt: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  errorButton: {
    backgroundColor: colors.secoundary,
    margin: 3,
    borderRadius: 3,
    padding: 12,
    color: colors.textPrimary,
    minWidth: "45%",
    marginLeft: 8,
  },
});
