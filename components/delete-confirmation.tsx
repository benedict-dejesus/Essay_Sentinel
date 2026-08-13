import { Text, TouchableOpacity, View } from "react-native";

export function DeleteConfirmation({
  title,
  detail,
  confirmLabel,
  busy = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  detail: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return <View className="rounded-3xl border border-error bg-surface p-5">
    <Text className="text-base font-bold text-foreground">{title}</Text>
    <Text className="mt-2 text-sm leading-5 text-muted">{detail}</Text>
    <View className="mt-5 flex-row gap-3">
      <TouchableOpacity onPress={onCancel} disabled={busy} className="flex-1 items-center rounded-xl border border-border bg-background py-3 active:opacity-75"><Text className="text-sm font-semibold text-foreground">Cancel</Text></TouchableOpacity>
      <TouchableOpacity onPress={onConfirm} disabled={busy} className="flex-1 items-center rounded-xl bg-error py-3 active:opacity-75"><Text className="text-sm font-semibold text-white">{busy ? "Deleting…" : confirmLabel}</Text></TouchableOpacity>
    </View>
  </View>;
}
