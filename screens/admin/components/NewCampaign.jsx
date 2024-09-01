import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { colors } from "../../../constants";
import firebase from "../../../firebase/config";
import ScreenHeading from "../../../components/ScreenHading";
import { format } from "date-fns";
import { useToast } from "react-native-toast-notifications";

export default function NewCampaign() {
  const crrDate = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startDateWeb, setStartDateWeb] = useState(crrDate);
  const [endDateWeb, setEndDateWeb] = useState(crrDate);
  const [nominees, setNominees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    position: "",
    nominees: [],
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const toast = useToast();
  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  useEffect(() => {
    const fetchCollections = async () => {
      const db = firebase.firestore();
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
        notify("Error fetching nominees");
      }

      try {
        const positionsSnapshot = await positionsCollection.get();
        const positionsData = positionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPositions(positionsData);
      } catch (error) {
        notify("Error fetching positions");
      }
    };

    fetchCollections();
  }, []);

  const handleStartDateConfirm = (_event, date) => {
    if (date) {
      setStartDate(date);
    }
    setShowStartDatePicker(false);
  };

  const handleEndDateConfirm = (_event, date) => {
    if (date) {
      setEndDate(date);
    }
    setShowEndDatePicker(false);
  };

  const db = firebase.firestore();
  const campaignsCollection = db.collection("campaigns");
  const handleAddCampaignPhone = async () => {
    if (
      !newCampaign.position ||
      newCampaign.nominees.length === 0 ||
      !startDate ||
      !endDate
    ) {
      Alert.alert("Please fill in all required fields.");
      return;
    }

    // Convert dates to the "yyyy/mm/dd" format using date-fns
    const startDateFormatted = format(startDate, "yyyy/MM/dd");
    const endDateFormatted = format(endDate, "yyyy/MM/dd");

    try {
      const campaignData = {
        position: newCampaign.position,
        nominees: newCampaign.nominees,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
      };

      await campaignsCollection.add(campaignData);

      setNewCampaign({
        position: "",
        nominees: [],
      });
      setStartDate(null);
      setEndDate(null);
      Alert.alert("Campaign added successfully!");
    } catch (error) {
      notify("Error adding campaign");
      Alert.alert(
        "An error occurred while adding the campaign. Please try again."
      );
    }
  };

  // Function to check if the date is in the format yyyy/mm/dd
  const isValidDateFormat = (dateString) => {
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    return dateRegex.test(dateString);
  };

  const handleAddCampaignWeb = async () => {
    console.log(
      newCampaign.position,
      newCampaign.nominees,
      startDateWeb,
      endDateWeb
    );

    if (
      !newCampaign.position ||
      newCampaign.nominees.length === 0 ||
      !startDateWeb ||
      !endDateWeb
    ) {
      console.log("Please fill in all required fields.");
      Alert.alert("Please fill in all required fields.");
      return;
    }

    if (!isValidDateFormat(startDateWeb) || !isValidDateFormat(endDateWeb)) {
      console.log("Invalid date format. Please use yyyy/mm/dd format.");
      Alert.alert("Invalid date format. Please use yyyy/mm/dd format.");
      return;
    }

    try {
      const campaignData = {
        position: newCampaign.position,
        nominees: newCampaign.nominees,
        startDate: startDateWeb,
        endDate: endDateWeb,
      };

      console.log("Adding campaign data: ", campaignData);
      await campaignsCollection.add(campaignData);
      console.log("Campaign added successfully!");

      setNewCampaign({
        nominees: [],
        position: newCampaign.position,
      });

      setStartDateWeb(crrDate);
      setEndDateWeb(crrDate);

      console.log("Reset newCampaign, startDate, and endDate");

      Alert.alert("Campaign added successfully!");
    } catch (error) {
      notify("Error adding campaign");
      Alert.alert(
        "An error occurred while adding the campaign. Please try again."
      );
    }
  };

  const handleInputChange = (name, value) => {
    setNewCampaign({
      ...newCampaign,
      [name]: value,
    });
  };

  const handleNomineeSelection = (nomineeId) => {
    const selectedNominees = newCampaign.nominees.includes(nomineeId)
      ? newCampaign.nominees.filter((id) => id !== nomineeId)
      : [...newCampaign.nominees, nomineeId];

    handleInputChange("nominees", selectedNominees);
  };

  return (
    <View style={styles.container}>
      <ScreenHeading txt={"Manage Campaigns"} />
      <View style={styles.card}>
        <Picker
          name="position"
          selectedValue={newCampaign.position}
          onValueChange={(itemValue) =>
            handleInputChange("position", itemValue)
          }
          style={styles.input}
        >
          {positions.map((position) => (
            <Picker.Item
              key={position.id}
              label={`${position.name} / ${position.description}`}
              value={position.id}
            />
          ))}
        </Picker>

        <Text style={styles.label}>Select Nominees:</Text>
        {nominees.map((nominee) => (
          <>
            <View key={nominee.id} style={styles.nomineeOption}>
              <Switch
                value={newCampaign.nominees.includes(nominee.id)}
                onValueChange={() => handleNomineeSelection(nominee.id)}
                style={styles.switch}
              />
              <View style={{ display: "flex", flexDirection: "column" }}>
                <Text style={styles.nomineeText}>
                  {`${nominee.firstName} ${nominee.lastName}`}
                </Text>
                <Text
                  style={styles.nomineeText}
                  onPress={() =>
                    alert(nominee.biography || "User have no biography")
                  }
                >
                  {nominee.biography ? "View Biography" : "No Biography"}
                </Text>
              </View>
            </View>
            <View style={styles.line} />
          </>
        ))}

        {Platform.OS === "web" ? (
          <>
            <View style={styles.textInputContianer}>
              <View style={styles.textInput}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  value={startDateWeb}
                  style={styles.input}
                  placeholder="dd/mm/yyyy"
                  onChangeText={(date) => setStartDateWeb(date)}
                  placeholderTextColor={colors.backgroundSecoundary}
                />
              </View>
              <View style={styles.textInput}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  value={endDateWeb}
                  style={styles.input}
                  placeholder="dd/mm/yyyy"
                  onChangeText={(date) => setEndDateWeb(date)}
                  placeholderTextColor={colors.backgroundSecoundary}
                />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={handleAddCampaignWeb}
              >
                <Text style={styles.btntxt}>Add Campaign</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <TouchableWithoutFeedback
              onPress={() => setShowStartDatePicker(true)}
            >
              <View style={styles.dateInput}>
                <Text style={{ color: colors.textsecoundary }}>
                  {startDate
                    ? startDate.toLocaleDateString("en-GB")
                    : "Select start date"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={handleStartDateConfirm}
                style={styles.dateTimePicker}
              />
            )}

            <Text style={styles.label}>End Date:</Text>
            <TouchableWithoutFeedback
              onPress={() => setShowEndDatePicker(true)}
            >
              <View style={styles.dateInput}>
                <Text style={{ color: colors.textsecoundary }}>
                  {endDate
                    ? endDate.toLocaleDateString("en-GB")
                    : "Select end date"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                plh
                mode="date"
                display="default"
                onChange={handleEndDateConfirm}
                style={styles.dateTimePicker}
              />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={handleAddCampaignPhone}
              >
                <Text style={styles.btntxt}>Add Campaign</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  card: {
    backgroundColor: colors.backgroundSecoundary,
    borderRadius: 8,
    padding: 30,
    elevation: 5,
    width: "90%",
  },
  input: {
    backgroundColor: colors.backgroundSecoundary,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: colors.textPrimary,
  },
  nomineeOption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  dateInput: {
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    color: colors.textPrimary,
  },
  buttonContainer: {
    marginTop: 20,
  },
  dateTimePickerContainer: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecoundary,
  },
  dateTimePicker: {
    color: "#fff",
  },
  switch: {
    marginRight: 10,
  },
  nomineeText: {
    color: colors.textPrimary,
  },
  textInputContianer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  textInput: {
    width: "40%",
    marginHorizontal: 3,
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
  line: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 1,
    marginVertical: 10, // Adjust as needed
  },
});
