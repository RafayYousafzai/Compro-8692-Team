import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { colors } from "../constants";

export default function TopBar({ screens }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
    toggleMenu();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleMenu = () => {
    if (showMenu) {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowMenu(false));
    } else {
      setShowMenu(true);
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderPopupMenu = () => {
    const screenWidth = Dimensions.get("window").width;
    const isSmallDevice = screenWidth <= 800; // Adjust the threshold to your preference

    const menuWidth = isSmallDevice ? screenWidth * 0.7 : screenWidth * 0.3;
    const menuTranslateX = menuAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-menuWidth, 0],
    });

    return (
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => toggleMenu()}
      >
        <TouchableOpacity
          style={styles.popupMenuOverlay}
          activeOpacity={1}
          onPressOut={() => toggleMenu()}
        >
          <Animated.View
            style={[
              styles.popupMenu,
              {
                width: menuWidth,
                transform: [{ translateX: menuTranslateX }],
              },
            ]}
          >
            <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <ScrollView>
              {screens.map((screen, ind) => (
                <TouchableOpacity
                  key={ind}
                  onPress={() => handleNavigate(screen.screen)}
                  style={styles.menuItem}
                >
                  <Icon
                    style={{
                      textAlign: "center",
                      alignSelf: "center",
                      marginRight: 10,
                    }}
                    name={screen.icon}
                    size={20}
                    color={colors.textsecoundary}
                  />
                  <Text style={styles.menuItemText}>{screen.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>VOTING</Text>
      </View>
      {navigation.canGoBack() && (
        <TouchableOpacity
          onPress={handleGoBack}
          style={{ alignSelf: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      )}
      {showMenu && renderPopupMenu()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 10,
    padding: 5,
  },
  menuButton: {
    marginRight: 8,
    alignSelf: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
  },
  popupMenuOverlay: {
    flex: 1,
    backgroundColor: colors.backgroundSecoundary,
    justifyContent: "flex-end",
  },
  popupMenu: {
    backgroundColor: colors.backgroundPrimary,
    elevation: 2,
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: "absolute",
    height: "100%",
    paddingTop: Platform.OS === "ios" ? 40 : 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginTop: 0,
    marginRight: -8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  menuItem: {
    borderRadius: 10,
    backgroundColor: colors.backgroundSecoundary,
    padding: 25,
    margin: 5,
    display: "flex",
    flexDirection: "row",
  },
  menuItemText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "bold",
    width: "90%",
  },
});
