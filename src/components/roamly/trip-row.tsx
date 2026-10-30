import { Image, Pressable, Text, View } from "react-native";

type TripRowProps = {
  city: string;
  country: string;
  dates: string;
  members: string;
  image: string;
  state: "Planning" | "Confirmed";
  onPress?: () => void;
};

export function TripRow({ city, country, dates, members, image, state, onPress }: TripRowProps) {
  return (
    <Pressable className="mx-5 mb-3 flex-row items-center gap-4 rounded-3xl bg-white p-3 shadow-sm shadow-slate-200 active:opacity-85" onPress={onPress}>
      <Image className="h-[72px] w-[72px] rounded-2xl" source={{ uri: image }} />
      <View className="min-w-0 flex-1">
        <View className="mb-1 flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-[17px] font-bold tracking-[-0.25px] text-ink" numberOfLines={1}>
            {city}
          </Text>
          <View className={state === "Confirmed" ? "rounded-full bg-emerald-50 px-2 py-1" : "rounded-full bg-cloud px-2 py-1"}>
            <Text className={state === "Confirmed" ? "text-[10px] font-bold text-sage" : "text-[10px] font-bold text-ocean"}>{state}</Text>
          </View>
        </View>
        <Text className="mb-1 text-[13px] text-muted" numberOfLines={1}>
          {country} · {dates}
        </Text>
        <Text className="text-[12px] font-medium text-slate-500">{members}</Text>
      </View>
    </Pressable>
  );
}
