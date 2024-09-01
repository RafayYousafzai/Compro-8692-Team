import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card } from "react-native-paper";
import ScreenHading from "../../components/ScreenHading";
import { colors } from "../../constants";
import firebase from "../../firebase/config";

export default function Voting() {
  const [campaigns, setCampaigns] = useState([]);
  const [nomineeNames, setNomineeNames] = useState({});
  const [nomineePictures, setNomineePictures] = useState([]);
  const [positionNames, setPositionNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const db = firebase.firestore();
      const campaignsCollection = db.collection("campaigns");

      try {
        const campaignsSnapshot = await campaignsCollection.get();
        const campaignsData = campaignsSnapshot.docs.map((doc) => {
          const campaign = doc.data();
          campaign.id = doc.id;
          return campaign;
        });
        const crrDate = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "/");
        const filteredCampaigns = campaignsData.filter(
          (campaign) => campaign.endDate < crrDate
        );

        const nomineeIds = filteredCampaigns.flatMap((campaign) =>
          Object.values(campaign.nominees)
        );
        const positionIds = filteredCampaigns.map(
          (campaign) => campaign.position
        );

        const nomineeNamesPromises = nomineeIds.map(async (nomineeId) => {
          const nomineeDoc = await db
            .collection("nominees")
            .doc(nomineeId)
            .get();
          if (nomineeDoc.exists) {
            const nomineeData = nomineeDoc.data();
            return {
              [nomineeId]: nomineeData.firstName + " " + nomineeData.lastName,
            };
          }
        });

        const positionNamesPromises = positionIds.map(async (positionId) => {
          const positionDoc = await db
            .collection("positions")
            .doc(positionId)
            .get();
          if (positionDoc.exists) {
            const positionData = positionDoc.data();
            return {
              [positionId]:
                positionData.name + ` / ` + positionData.description,
            };
          }
        });

        const nomineeNamesResults = await Promise.all(nomineeNamesPromises);
        const positionNamesResults = await Promise.all(positionNamesPromises);

        const nomineeNames = Object.assign({}, ...nomineeNamesResults);
        const positionNames = Object.assign({}, ...positionNamesResults);

        setCampaigns(filteredCampaigns);
        setNomineeNames(nomineeNames);
        setPositionNames(positionNames);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNomineesWithMostVotes = async (campaign) => {
    const db = firebase.firestore();
    const votes = campaign.votes || {};
    const voteCounts = {};

    Object.values(votes).forEach((nomineeId) => {
      voteCounts[nomineeId] = (voteCounts[nomineeId] || 0) + 1;
    });

    if (Object.keys(voteCounts).length === 0) {
      return [];
    }

    const highestVoteCount = Math.max(...Object.values(voteCounts));
    const nomineesWithMostVotes = Object.keys(voteCounts).filter(
      (nomineeId) => voteCounts[nomineeId] === highestVoteCount
    );

    const nomineeDataPromises = nomineesWithMostVotes.map(async (nomineeId) => {
      const nomineeDoc = await db.collection("nominees").doc(nomineeId).get();
      if (nomineeDoc.exists) {
        const nomineeData = nomineeDoc.data();
        const name =
          nomineeData.firstName + " " + nomineeData.lastName ||
          "something went wrong";
        return { name, pictureUrl: nomineeData.picture };
      }
      return null;
    });

    const nomineeDataArray = await Promise.all(nomineeDataPromises);
    return nomineeDataArray.filter((nomineeData) => nomineeData !== null);
  };

  useEffect(() => {
    const fetchNomineePictures = async () => {
      const pictures = await Promise.all(
        campaigns.map((campaign) => getNomineesWithMostVotes(campaign))
      );
      setNomineePictures(pictures);
    };

    fetchNomineePictures();
  }, [campaigns]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <ScreenHading txt={"Campaigns Results"} />
        <View style={styles.gridContainer}>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            campaigns.map((campaign, index) => {
              const nomineeWithMostVotes = nomineePictures[index];
              return (
                <Card key={campaign.id} style={styles.card}>
                  <Text style={styles.positionText}>
                    Position: {positionNames[campaign.position] || "Position"}
                  </Text>
                  {nomineeWithMostVotes && nomineeWithMostVotes.length > 0 ? (
                    nomineeWithMostVotes.map((nomineeData, index) => (
                      <View key={index}>
                        <Card.Cover
                          source={
                            nomineeData.pictureUrl
                              ? { uri: nomineeData.pictureUrl }
                              : require("../../assets/businessman-character-avatar.jpg")
                          }
                          style={styles.cardMedia}
                        />
                        <View style={styles.winnerContainer}>
                          <Text style={styles.winnerText}>
                            WINNER ({index + 1}) {nomineeData.name}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text>Loading...</Text>
                  )}

                  <Card.Content>
                    {Object.values(campaign.nominees).map(
                      (nomineeId, index) => {
                        const voteCount = Object.values(
                          campaign.votes || {}
                        ).filter(
                          (voteNomineeId) => voteNomineeId === nomineeId
                        ).length;

                        return (
                          <View key={index}>
                            <View style={[styles.voteButton]}>
                              <Text style={styles.nomineeText}>
                                {`(${voteCount} vote) ${
                                  nomineeNames[nomineeId] || "Nominee"
                                } `}
                              </Text>
                            </View>
                          </View>
                        );
                      }
                    )}
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundPrimary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: colors.backgroundSecoundary,
    maxWidth: 400,
    margin: 4,
  },
  cardMedia: {
    height: 200,
  },
  positionText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textPrimary,
    marginHorizontal: "auto",
    marginVertical: 10,
    backgroundColor: colors.backgroundSecoundary,
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  nomineeText: {
    fontSize: 12,
    marginVertical: 4,
    color: colors.textsecoundary,
    fontWeight: "bold",
  },
  voteButton: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  winnerContainer: {
    backgroundColor: colors.secoundary,
    borderRadius: 15,
    paddingHorizontal: 15,
    margin: 15,
    alignSelf: "center",
    paddingVertical: 5,
  },
  winnerText: { fontWeight: "900", color: colors.textsecoundary, fontSize: 17 },
});
