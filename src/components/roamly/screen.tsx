import type { PropsWithChildren } from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  className?: string;
}>;

export function Screen({ children, className = "" }: ScreenProps) {
  const webTabClearance = Platform.OS === "web" ? "pt-16" : "";

  return (
    <SafeAreaView className={`flex-1 bg-canvas ${className}`} edges={["top", "left", "right"]}>
      <View className={`flex-1 ${webTabClearance}`}>{children}</View>
    </SafeAreaView>
  );
}
