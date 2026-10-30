import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      disableTransparentOnScrollEdge
      hidden={Platform.OS === "web"}
      shadowColor="#D7DFEE"
      tintColor="#3A86FF"
    >
      <NativeTabs.Trigger name="trips">
        <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
