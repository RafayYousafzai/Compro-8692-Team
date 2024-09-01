import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Searchbar } from "react-native-paper";
import firebase from "../../firebase/config";
import { colors } from "../../constants";
import ScreenHeading from "../../components/ScreenHading";

const ManageUsers = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const usersCollection = firebase.firestore().collection("users");
    const unsubscribe = usersCollection.onSnapshot((querySnapshot) => {
      const userData = [];
      querySnapshot.forEach((doc) => {
        userData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userData);
    });
    return () => {
      unsubscribe();
    };
  }, [firebase]);

  const handleUserPress = (user) => {
    navigation.navigate("ManageUsersDetails", { user });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)}>
      <View style={styles.userContainer}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.email}>Email: {item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeading txt="Users List" />
      {/* Add the Searchbar */}
      <Searchbar
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={(query) => setSearchQuery(query)}
        style={styles.searchBar}
        color={colors.textsecoundary}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.backgroundPrimary,
  },
  flatListContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  userContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.backgroundSecoundary,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.backgroundSecoundary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: colors.textsecoundary,
  },
  searchBar: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: colors.backgroundSecoundary,
  },
});

export default ManageUsers;
