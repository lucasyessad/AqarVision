import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../lib/auth-context";
import { Button } from "../../components/Button";

const LOCALES = ["fr", "ar", "en", "es"];

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [locale, setLocale] = useState("fr");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, locale);
      Alert.alert(
        "Compte cree",
        "Verifiez votre email pour confirmer votre compte",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Erreur", error.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>
          Creez votre compte AqarVision
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8899AA"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe (6 caracteres min.)"
          placeholderTextColor="#8899AA"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Langue preferee</Text>
        <View style={styles.localeRow}>
          {LOCALES.map((l) => (
            <Pressable
              key={l}
              style={[
                styles.localeOption,
                locale === l && styles.localeOptionActive,
              ]}
              onPress={() => setLocale(l)}
            >
              <Text
                style={[
                  styles.localeText,
                  locale === l && styles.localeTextActive,
                ]}
              >
                {l.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          title={loading ? "Creation..." : "Creer mon compte"}
          variant="primary"
          onPress={handleSignup}
          disabled={loading}
        />

        <Button
          title="Deja un compte ? Se connecter"
          variant="ghost"
          onPress={() => router.replace("/auth/login")}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
  },
  form: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#8899AA",
    fontSize: 15,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#1A2B45",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2A3B55",
  },
  label: {
    color: "#8899AA",
    fontSize: 14,
    marginBottom: -8,
  },
  localeRow: {
    flexDirection: "row",
    gap: 10,
  },
  localeOption: {
    backgroundColor: "#1A2B45",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A3B55",
  },
  localeOptionActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  localeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  localeTextActive: {
    color: "#0F1B2D",
    fontWeight: "700",
  },
});
