import { FlatList, StyleSheet, View } from "react-native";
import { colors } from "../../constants";
import AllCampaign from "./components/AllCampaign";
import NewCampaign from "./components/NewCampaign";

export default function ManageCampaigns() {
  const data = [
    { key: "new", component: <NewCampaign /> },
    { key: "all", component: <AllCampaign /> },
  ];

  const renderItem = ({ item }) => item.component;

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundPrimary,
  },
});
