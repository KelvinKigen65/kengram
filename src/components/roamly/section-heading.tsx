import { Text, View } from "react-native";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  action?: string;
};

export function SectionHeading({ eyebrow, title, action }: SectionHeadingProps) {
  return (
    <View className="mb-4 flex-row items-end justify-between px-5">
      <View className="flex-1">
        {eyebrow ? <Text className="mb-1 text-[11px] font-bold uppercase tracking-[1.8px] text-ocean">{eyebrow}</Text> : null}
        <Text className="text-[25px] font-bold tracking-[-0.7px] text-ink">{title}</Text>
      </View>
      {action ? <Text className="pb-1 text-[14px] font-semibold text-ocean">{action}</Text> : null}
    </View>
  );
}
