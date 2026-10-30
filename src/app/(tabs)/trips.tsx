import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { SectionHeading } from "@/components/roamly/section-heading";
import { Screen } from "@/components/roamly/screen";
import { TripRow } from "@/components/roamly/trip-row";

const travelHero = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=85";

export default function TripsScreen() {
  return (
    <Screen>
      <ScrollView className="flex-1" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        <View className="mb-5 flex-row items-center justify-between px-5 pt-2">
          <View>
            <Text className="text-[13px] font-semibold text-muted">Wednesday, 29 October</Text>
            <Text className="mt-1 text-[31px] font-bold tracking-[-1.2px] text-ink">Your journeys</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-ink">
            <Text className="text-[15px] font-bold text-white">AM</Text>
          </View>
        </View>

        <View className="mx-5 h-[302px] overflow-hidden rounded-4xl">
          <Image className="absolute inset-0 h-full w-full" resizeMode="cover" source={{ uri: travelHero }} />
          <View className="flex-1 justify-between bg-black/30 p-5">
            <View className="self-start rounded-full bg-white/90 px-3 py-2">
              <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-ink">Next escape · 18 days</Text>
            </View>
            <View>
              <Text className="text-[13px] font-semibold text-white/85">France · 4 days · 2 travelers</Text>
              <Text className="mt-1 text-[34px] font-bold tracking-[-1.3px] text-white">Paris, slowly</Text>
              <Text className="mt-1 max-w-[250px] text-[14px] leading-5 text-white/90">Golden-hour galleries, long lunches, and room to wander.</Text>
              <Pressable className="mt-4 self-start rounded-full bg-white px-4 py-3 active:opacity-85" onPress={() => router.push("/trips/paris")}> 
                <Text className="text-[14px] font-bold text-ink">Open itinerary</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mt-7">
          <SectionHeading action="See all" eyebrow="In motion" title="Keep planning" />
          <TripRow city="Tokyo after dark" country="Japan" dates="Apr 8–13" members="You, Hana + 2" state="Planning" image="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80" onPress={() => router.push("/trips/tokyo")} />
          <TripRow city="Amalfi by train" country="Italy" dates="Jun 2–6" members="You + Luca" state="Confirmed" image="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=400&q=80" onPress={() => router.push("/trips/amalfi")} />
        </View>

        <View className="mx-5 mt-4 rounded-3xl border border-slate-100 bg-[#F3F7FF] p-5">
          <Text className="text-[11px] font-bold uppercase tracking-[1.4px] text-ocean">Shared decision</Text>
          <Text className="mt-2 text-[19px] font-bold tracking-[-0.4px] text-ink">Hana voted for the Kyoto day trip.</Text>
          <Text className="mt-2 text-[14px] leading-5 text-slate-600">Review the suggestion before you lock the Tokyo schedule.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
