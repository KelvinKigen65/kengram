import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/roamly/screen";

const vibes = ["Slow mornings", "Food first", "Art & design", "Outdoors", "After dark", "A little luxury"];

export default function PlanScreen() {
  return (
    <Screen>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text className="mt-2 text-[12px] font-bold uppercase tracking-[1.8px] text-ocean">A better first draft</Text>
        <Text className="mt-2 text-[34px] font-bold tracking-[-1.2px] text-ink">Plan a trip that breathes.</Text>
        <Text className="mt-3 max-w-[330px] text-[15px] leading-6 text-muted">Tell Roamly the essentials. We will shape the rest around realistic movement and a little room for surprise.</Text>

        <View className="mt-8 gap-5">
          <Field label="Where are you going?" placeholder="Paris, France" value="Paris, France" />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="When" placeholder="May 16–20" value="May 16–20" />
            </View>
            <View className="flex-1">
              <Field label="Budget" placeholder="Comfortable" value="Comfortable" />
            </View>
          </View>
        </View>

        <Text className="mb-3 mt-8 text-[15px] font-bold text-ink">Set the mood</Text>
        <View className="flex-row flex-wrap gap-2">
          {vibes.map((vibe, index) => (
            <View key={vibe} className={index === 1 ? "rounded-full bg-ocean px-4 py-3" : "rounded-full border border-slate-200 bg-white px-4 py-3"}>
              <Text className={index === 1 ? "text-[13px] font-semibold text-white" : "text-[13px] font-semibold text-slate-700"}>{vibe}</Text>
            </View>
          ))}
        </View>

        <View className="mt-7">
          <Text className="mb-3 text-[15px] font-bold text-ink">Anything non-negotiable?</Text>
          <TextInput className="min-h-[98px] rounded-3xl border border-slate-200 bg-white px-4 py-4 text-[15px] leading-5 text-ink" multiline placeholder="A rooftop dinner. A quiet museum. No rushed mornings." placeholderTextColor="#9A9A9A" textAlignVertical="top" />
        </View>

        <Pressable className="mt-8 items-center rounded-full bg-ink py-4 active:opacity-85">
          <Text className="text-[16px] font-bold text-white">Generate my trip</Text>
        </Pressable>
        <Text className="mt-4 text-center text-[12px] leading-5 text-muted">Roamly balances travel time, pace, and the places you care about.</Text>
      </ScrollView>
    </Screen>
  );
}

function Field({ label, placeholder, value }: { label: string; placeholder: string; value: string }) {
  return (
    <View>
      <Text className="mb-2 text-[13px] font-bold text-ink">{label}</Text>
      <TextInput className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[15px] font-medium text-ink" defaultValue={value} placeholder={placeholder} placeholderTextColor="#9A9A9A" />
    </View>
  );
}
