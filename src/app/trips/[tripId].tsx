import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const itinerary = [
  { time: "09:30", title: "Coffee at Fringe", detail: "Le Marais · 10 min walk", tone: "bg-[#FFF2E7]" },
  { time: "11:00", title: "Musée de l'Orangerie", detail: "Reserved · 1 hr 30 min", tone: "bg-[#EAF2FF]" },
  { time: "14:00", title: "Long lunch at Clamato", detail: "Reservation recommended", tone: "bg-[#EAF8F4]" },
  { time: "17:30", title: "Seine at golden hour", detail: "Flexible buffer · 20 min metro", tone: "bg-[#F1EEFF]" },
];

export default function TripDetailsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const name = tripId === "tokyo" ? "Tokyo after dark" : tripId === "amalfi" ? "Amalfi by train" : "Paris, slowly";

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" contentContainerClassName="pb-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-5 py-3">
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white active:opacity-85" onPress={() => router.back()}>
            <Text className="text-[23px] text-ink">‹</Text>
          </Pressable>
          <View className="rounded-full bg-cloud px-3 py-2">
            <Text className="text-[11px] font-bold text-ocean">COLLABORATIVE</Text>
          </View>
        </View>

        <View className="px-5 pt-4">
          <Text className="text-[13px] font-semibold text-muted">France · May 16–20 · 2 travelers</Text>
          <Text className="mt-1 text-[34px] font-bold tracking-[-1.2px] text-ink">{name}</Text>
          <Text className="mt-3 max-w-[330px] text-[15px] leading-6 text-muted">A realistic route with time to linger, reroute, and decide together.</Text>
        </View>

        <View className="mx-5 mt-7 overflow-hidden rounded-4xl bg-ink p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[1.4px] text-white/60">Today · Day 2</Text>
          <Text className="mt-2 text-[25px] font-bold tracking-[-0.6px] text-white">Left Bank, unhurried</Text>
          <View className="mt-5 h-[118px] rounded-3xl border border-white/15 bg-[#283556] p-4">
            <View className="h-[2px] w-full rounded-full bg-ocean" />
            <View className="mt-6 flex-row justify-between">
              <MapPin label="Coffee" />
              <MapPin label="Museum" />
              <MapPin label="Dinner" />
            </View>
          </View>
          <Text className="mt-3 text-[12px] leading-5 text-white/65">4 stops · 3.8 km · 27 min total travel</Text>
        </View>

        <View className="mt-8 px-5">
          <View className="mb-5 flex-row items-end justify-between">
            <View>
              <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-ocean">Thursday, May 17</Text>
              <Text className="mt-1 text-[25px] font-bold tracking-[-0.7px] text-ink">Your day, paced</Text>
            </View>
            <Pressable className="rounded-full bg-ink px-4 py-2 active:opacity-85">
              <Text className="text-[12px] font-bold text-white">Edit day</Text>
            </Pressable>
          </View>

          {itinerary.map((stop, index) => (
            <View key={stop.time} className="flex-row gap-4">
              <View className="w-11 items-end pt-1">
                <Text className="text-[12px] font-bold text-muted">{stop.time}</Text>
              </View>
              <View className="items-center">
                <View className="h-3 w-3 rounded-full bg-ocean" />
                {index < itinerary.length - 1 ? <View className="w-px flex-1 bg-slate-200" /> : null}
              </View>
              <View className={`mb-5 flex-1 rounded-3xl ${stop.tone} p-4`}>
                <Text className="text-[16px] font-bold text-ink">{stop.title}</Text>
                <Text className="mt-1 text-[13px] text-slate-600">{stop.detail}</Text>
                {index === 2 ? <Text className="mt-3 text-[11px] font-bold text-sun">RESERVATION RECOMMENDED</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View className="mx-5 mt-2 rounded-3xl border border-slate-100 bg-white p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[1.4px] text-ocean">Group pulse</Text>
          <Text className="mt-2 text-[17px] font-bold text-ink">Hana voted for the museum. Leo suggested a nearby pastry stop.</Text>
          <Pressable className="mt-4 self-start rounded-full bg-cloud px-4 py-3 active:opacity-85">
            <Text className="text-[13px] font-bold text-ocean">Review suggestions</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MapPin({ label }: { label: string }) {
  return (
    <View className="items-center gap-1">
      <View className="h-3 w-3 rounded-full border-2 border-white bg-ocean" />
      <Text className="text-[10px] font-semibold text-white/65">{label}</Text>
    </View>
  );
}
