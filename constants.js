export const colors = {
  primary: "#ef233c",
  primaryAccent: "#2a9d8f",
  secoundary: "#d80032",
  secoundaryAccent: "#FFC857",
  backgroundPrimary: "#000",
  backgroundSecoundary: "rgba(240, 248, 255, 0.099)",
  textPrimary: "#fefae0",
  textsecoundary: "#e5e5e5",
};

export const AdminScreens = [
  { name: "Dashboard", screen: "Dashboard", icon: "dashboard" },
  {
    name: "Position/Offices",
    screen: "ManagePositionOffice",
    icon: "briefcase",
  },
  { name: "Nominees", screen: "ManageNominee", icon: "users" },
  {
    name: "Campaigns",
    screen: "ManageCampaigns",
    icon: "list",
  },
  { name: "Voting", screen: "Voting", icon: "check-square-o" },
  { name: "Vote Result", screen: "Result", icon: "address-card" },
  { name: "Users", screen: "ManageUsers", icon: "check-square-o" },
  { name: "Account", screen: "MyAccount", icon: "address-card" },
];

export const UserScreens = [
  { name: "Voting", screen: "Voting", icon: "check-square-o" },
  { name: "Result", screen: "Result", icon: "address-card" },
  { name: "My Account", screen: "MyAccount", icon: "address-card" },
];

export const AuthScreens = [
  { name: "Sign In", screen: "Signup" },
  { name: "Sign Up", screen: "Signin" },
  { name: "Reset Password", screen: "ResetPassword" },
];
