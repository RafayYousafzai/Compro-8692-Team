import React, { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "../firebase/config";

export default function UserDataUpdate() {
  const checkNetworkAndFetchUserData = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        const userDataString = await AsyncStorage.getItem("userData");
        const data = JSON.parse(userDataString);
        if (data?.email) {
          const userSnapshot = await firebase
            .firestore()
            .collection("users")
            .where("email", "==", data.email)
            .get();
          console.log(userSnapshot);
          if (!userSnapshot.empty) {
            const userDataFromFirestore = userSnapshot.docs[0].data();
            await AsyncStorage.setItem(
              "userData",
              JSON.stringify(userDataFromFirestore)
            );
            console.log("User data updated from Firestore");
          } else {
            await AsyncStorage.removeItem("userData");
            console.log("User data removed from AsyncStorage");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching and updating user data: ", error);
    }
  };

  // Call the function here
  checkNetworkAndFetchUserData();

  return <></>;
}
