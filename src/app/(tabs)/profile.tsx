import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/roamly/screen";

const rows = ["Travel preferences", "Currency · USD", "Privacy & sharing", "Help center"];

export default function ProfileScreen() {
  return (
    <Screen>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="mt-2 flex-row items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-ocean">
            <Text className="text-[24px] font-bold text-white">AM</Text>
          </View>
          <View>
            <Text className="text-[28px] font-bold tracking-[-1px] text-ink">Amina M.</Text>
            <Text className="mt-1 text-[14px] text-muted">Collecting slow days everywhere.</Text>
          </View>
        </View>

        <View className="mt-8 flex-row rounded-3xl bg-ink p-5">
          <Stat value="12" label="Countries" />
          <View className="mx-4 w-px bg-white/15" />
          <Stat value="8" label="Trips made" />
          <View className="mx-4 w-px bg-white/15" />
          <Stat value="31" label="Saved places" />
        </View>

        <Text className="mb-3 mt-8 text-[12px] font-bold uppercase tracking-[1.6px] text-ocean">Account</Text>
        <View className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
          {rows.map((row, index) => (
            <Pressable key={row} className={index === rows.length - 1 ? "flex-row items-center justify-between px-5 py-5" : "flex-row items-center justify-between border-b border-slate-100 px-5 py-5"}>
              <Text className="text-[15px] font-semibold text-ink">{row}</Text>
              <Text className="text-[18px] text-muted">›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable className="mt-7 items-center rounded-full border border-red-100 bg-red-50 py-4 active:opacity-85">
          <Text className="text-[14px] font-bold text-red-600">Log out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1">
      <Text className="text-[22px] font-bold tracking-[-0.5px] text-white">{value}</Text>
      <Text className="mt-1 text-[11px] font-medium text-white/65">{label}</Text>
    </View>
  );
}
