import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TopBar from "../components/TopBar";
import { AdminScreens, AuthScreens, UserScreens } from "../constants";
import {
  Dashboard,
  ManageCampaigns,
  ManageNominee,
  ManagePositionOffice,
  ManageUsers,
} from "../screens/admin";
import { Signin, Signup,ResetPassword } from "../screens/auth";
import { MyAccount, Result, Voting } from "../screens/user";
import ManageUsersDetails from "../screens/admin/ManageUsersDetails";

const Stack = createStackNavigator();

const userOptions = {
  header: () => <TopBar screens={UserScreens} />,
};
const adminOptions = {
  header: () => <TopBar screens={AdminScreens} />,
};

const authOptions = {
  header: () => <TopBar screens={AuthScreens} />,
};

const UserStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Voting"
        screenOptions={userOptions}
      >
        <Stack.Screen
          name="Voting"
          component={Voting}
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen name="Result" component={Result} />
        <Stack.Screen name="MyAccount" component={MyAccount} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AdminStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={adminOptions}
      >
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="Voting" component={Voting} />
        <Stack.Screen
          name="ManageUsersDetails"
          component={ManageUsersDetails}
        />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen
          name="ManageCampaigns"
          component={ManageCampaigns}
        />
        <Stack.Screen name="ManageNominee" component={ManageNominee} />
        <Stack.Screen
          name="ManagePositionOffice"
          component={ManagePositionOffice}
        />
        <Stack.Screen name="MyAccount" component={MyAccount} />
        <Stack.Screen name="Result" component={Result} />
        <Stack.Screen name="ManageUsers" component={ManageUsers} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AuthStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Signin"
        screenOptions={authOptions}
      >
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Signin" component={Signin} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export { AdminStack, AuthStack, UserStack };
