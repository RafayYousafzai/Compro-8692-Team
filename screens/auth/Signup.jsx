import { useForm } from "react-hook-form";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants";
import firebase from "../../firebase/config";
import { useToast } from "react-native-toast-notifications";

export default function Signup({ navigation }) {
  const toast = useToast();
  const notify = (message, type) => {
    toast.show(message, {
      type: type || "normal",
      placement: "bottom",
      duration: 4000,
    });
  };

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const onSubmit = async (data) => {
    if (data && data.password === data.confirmPassword) {
      try {
        const userCredential = await firebase
          .auth()
          .createUserWithEmailAndPassword(data.email, data.password);
        const user = userCredential.user;
        await user.sendEmailVerification();
        const db = firebase.firestore();
        const userRef = db.collection("users").doc();
        await userRef.set({
          role: "user",
          firstName: data.firstName,
          lastName: data.lastName,
          houseColor: data.houseColor,
          class: data.class,
          email: data.email,
          firstPassword: data.password,
          knownName: data.knownName,
        });
        notify(
          "Account Created successfully & Email verification sent to your email"
        );
        navigation.push("Signin");
      } catch (error) {
        notify(`Error creating Account: ${error.message}`);
      }
    } else {
      notify("Don't leave any field empty and make sure passwords match.");
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Sign up</Text>

        <View style={styles.inputContainer}>
          <View style={styles.textInput}>
            {/* <Text style={styles.textInputText}>First Name</Text> */}
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="First Name"
              style={styles.input}
              onChangeText={(text) => setValue("firstName", text)}
            />
            {errors.firstName && <Text>{errors.firstName.message}</Text>}
          </View>
          <View style={styles.textInput}>
            {/* <Text style={styles.textInputText}>Last Name</Text> */}
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="Last Name"
              style={styles.input}
              onChangeText={(text) => setValue("lastName", text)}
            />
            {errors.lastName && <Text>{errors.lastName.message}</Text>}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.textInput}>
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="House Color"
              style={styles.input}
              onChangeText={(text) => setValue("houseColor", text)}
            />
            {errors.houseColor && <Text>{errors.houseColor.message}</Text>}
          </View>

          <View style={styles.textInput}>
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="Class"
              style={styles.input}
              onChangeText={(text) => setValue("class", text)}
            />
            {errors.class && <Text>{errors.class.message}</Text>}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.textInput}>
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="Known Name"
              style={styles.input}
              onChangeText={(text) => setValue("knownName", text)}
            />
          </View>
          <View style={styles.textInput}>
            {errors.class && <Text>{errors.knownName.message}</Text>}
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="Email Address"
              style={styles.input}
              onChangeText={(text) => setValue("email", text)}
            />
            {errors.email && <Text>{errors.email.message}</Text>}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.textInput}>
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="Password"
              style={styles.input}
              onChangeText={(text) => setValue("password", text)}
              secureTextEntry
            />
            {errors.password && <Text>{errors.password.message}</Text>}
          </View>

          <View style={styles.textInput}>
            <TextInput
              placeholderTextColor={colors.textPrimary}
              placeholder="Confirm Password"
              style={styles.input}
              onChangeText={(text) => setValue("confirmPassword", text)}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text>{errors.confirmPassword.message}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.push("Signin")}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 700,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  textInput: {
    margin: 4,
    maxWidth: 300,
    width: 700,
    padding: 5,
  },
  textInputText: {
    color: colors.textsecoundary,
    marginBottom: 5,
    marginLeft: 5,
    fontWeight: "900",
  },
  input: {
    backgroundColor: colors.backgroundSecoundary,
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
  },
  signUpButton: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    maxWidth: 300,
    width: 700,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 20,
    marginBottom: 100,
  },
});
