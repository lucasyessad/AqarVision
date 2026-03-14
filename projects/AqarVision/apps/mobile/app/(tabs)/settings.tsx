import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { Button } from "../../components/Button";

const LANGUAGES = [
  { code: "fr", label: "Francais" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [selectedLang, setSelectedLang] = useState("fr");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se deconnecter");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Langue</Text>
      <View style={styles.langGrid}>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            style={[
              styles.langOption,
              selectedLang === lang.code && styles.langOptionActive,
            ]}
            onPress={() => setSelectedLang(lang.code)}
          >
            <Text
              style={[
                styles.langText,
                selectedLang === lang.code && styles.langTextActive,
              ]}
            >
              {lang.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {user && (
        <View style={styles.logoutSection}>
          <Button
            title="Se deconnecter"
            variant="ghost"
            onPress={handleSignOut}
          />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.version}>AqarVision v0.1.0</Text>
        <Text style={styles.copyright}>2024 AqarVision</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
    padding: 24,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 32,
  },
  langOption: {
    backgroundColor: "#1A2B45",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2A3B55",
  },
  langOptionActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  langText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  langTextActive: {
    color: "#0F1B2D",
    fontWeight: "700",
  },
  logoutSection: {
    marginTop: 16,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: "center",
    gap: 4,
  },
  version: {
    color: "#8899AA",
    fontSize: 13,
  },
  copyright: {
    color: "#556677",
    fontSize: 12,
  },
});
