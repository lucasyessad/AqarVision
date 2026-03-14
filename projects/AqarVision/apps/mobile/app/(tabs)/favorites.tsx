import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";

export default function FavoritesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>{"\u2661"}</Text>
        <Text style={styles.message}>
          Connectez-vous pour voir vos favoris
        </Text>
        <Button
          title="Se connecter"
          variant="primary"
          onPress={() => router.push("/auth/login")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{"\u2661"}</Text>
      <Text style={styles.message}>
        Aucun favori pour le moment
      </Text>
      <Text style={styles.subMessage}>
        Ajoutez des annonces a vos favoris pour les retrouver ici
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  subMessage: {
    color: "#8899AA",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
});
