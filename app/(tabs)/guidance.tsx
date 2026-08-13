import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

const rules = [
  ["Stock academic phrasing", "Exact matches to a visible list of reusable academic templates."],
  ["Formulaic transitions", "Formal linking words only when their density exceeds a length-adjusted threshold."],
  ["Generic abstraction frames", "Broad rhetorical frames that may merit a request for specific evidence."],
  ["Repeated structures", "Repeated balanced scaffolds or five-word sequences occurring at least three times."],
];

export default function GuidanceScreen() {
  return (
    <ScreenContainer className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 30, width: "100%", maxWidth: 760, alignSelf: "center" }}>
        <Text className="text-3xl font-bold tracking-tight text-foreground">How to use findings</Text>
        <Text className="mt-3 text-base leading-6 text-muted">Essay Sentinel is a fixed-rule writing review tool. It does not use AI, estimate an AI percentage, or determine authorship.</Text>

        <View className="mt-7 rounded-3xl border border-primary bg-surface p-5"><Text className="text-base font-bold text-foreground">Start a conversation, not a consequence</Text><Text className="mt-2 text-sm leading-5 text-muted">A marker may reflect class instruction, a legitimate writing aid, revision, a student’s own style, or common academic language. Treat it as one data point alongside the assignment and the student’s voice.</Text></View>

        <Text className="mt-8 text-lg font-bold text-foreground">What the app checks</Text>
        <View className="mt-3 gap-3">
          {rules.map(([title, detail]) => <View key={title} className="rounded-2xl border border-border bg-surface p-4"><Text className="text-base font-semibold text-foreground">{title}</Text><Text className="mt-1 text-sm leading-5 text-muted">{detail}</Text></View>)}
        </View>

        <Text className="mt-8 text-lg font-bold text-foreground">Document handling</Text>
        <View className="mt-3 rounded-3xl border border-border bg-surface p-5 gap-3"><Text className="text-sm leading-5 text-muted"><Text className="font-semibold text-foreground">Pasted text:</Text> checked directly with the fixed rules in this browser.</Text><Text className="text-sm leading-5 text-muted"><Text className="font-semibold text-foreground">DOCX:</Text> read locally in this browser; the file is not uploaded. For PDFs, paste the essay text into the review form.</Text><Text className="text-sm leading-5 text-muted"><Text className="font-semibold text-foreground">Saved reviews:</Text> stored in this browser and removable from the review detail screen.</Text></View>

        <Text className="mt-8 text-lg font-bold text-foreground">Suggested educator workflow</Text>
        <View className="mt-3 rounded-3xl border border-border bg-surface p-5"><Text className="text-sm leading-6 text-muted">Read the matching excerpt, compare it to assignment expectations and prior work, then ask an open question about the student’s reasoning, source use, and revision process. Document the conversation separately from these automated markers.</Text></View>

        <Text className="mt-8 text-lg font-bold text-foreground">Open on phone or desktop</Text>
        <View className="mt-3 rounded-3xl border border-border bg-surface p-5"><Text className="text-sm leading-6 text-muted">This version is a static website. Host the project with the included GitHub Pages workflow, then open the published URL in any modern desktop or mobile browser. On a phone, add the browser page to the Home Screen for a quick launch shortcut.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}
