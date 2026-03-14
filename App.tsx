import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEY = "yeetfiles-smoke-test-note";

export default function App() {
  const [tapCount, setTapCount] = useState(0);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void loadSavedNote();
  }, []);

  async function loadSavedNote() {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedValue) {
      setNote(storedValue);
      setSavedNote(storedValue);
    }
    setIsLoaded(true);
  }

  async function saveNote() {
    await AsyncStorage.setItem(STORAGE_KEY, note);
    setSavedNote(note);
    Alert.alert("Saved locally", "Your note was written to AsyncStorage on this device.");
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>Pre-Phase 0</Text>
          <Text style={styles.title}>Expo QR Smoke Test</Text>
          <Text style={styles.body}>
            This screen exists to prove the local Expo loop works on a real phone before we
            build the actual swipe experience.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>What this checks</Text>
            <Text style={styles.cardBody}>1. QR launch from Expo Go</Text>
            <Text style={styles.cardBody}>2. Native text, layout, and touch input</Text>
            <Text style={styles.cardBody}>3. Local persistence after refresh or reopen</Text>
          </View>

          <View style={styles.row}>
            <Pressable style={styles.primaryButton} onPress={() => setTapCount((count) => count + 1)}>
              <Text style={styles.primaryButtonText}>Tap me</Text>
            </Pressable>
            <View style={styles.pill}>
              <Text style={styles.pillLabel}>Tap count</Text>
              <Text style={styles.pillValue}>{tapCount}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Persistence check</Text>
            <TextInput
              placeholder="Type a note, then save it"
              placeholderTextColor="#7E746A"
              style={styles.input}
              value={note}
              onChangeText={setNote}
            />
            <Pressable style={styles.secondaryButton} onPress={saveNote}>
              <Text style={styles.secondaryButtonText}>Save note on device</Text>
            </Pressable>
            <Text style={styles.helper}>
              {isLoaded ? savedNote || "No saved note yet." : "Loading saved note..."}
            </Text>
          </View>

          <Pressable
            style={styles.ghostButton}
            onPress={() =>
              Alert.alert(
                "Device test complete",
                "If this alert appears, native interactions are wired up correctly."
              )
            }
          >
            <Text style={styles.ghostButtonText}>Show native alert</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4EFE7",
  },
  content: {
    padding: 24,
    gap: 20,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#9A4D32",
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    color: "#1F1A17",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4A413A",
  },
  card: {
    backgroundColor: "#FFF9F2",
    borderRadius: 24,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E6D9CA",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F1A17",
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A413A",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#1F7A5B",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pill: {
    minWidth: 96,
    backgroundColor: "#1F1A17",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  pillLabel: {
    fontSize: 12,
    color: "#E6D9CA",
  },
  pillValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8C8B6",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F1A17",
  },
  secondaryButton: {
    backgroundColor: "#F0E0CE",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6C3F24",
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5A524B",
  },
  ghostButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  ghostButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6C3F24",
  },
});