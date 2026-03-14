import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>{"\uD83D\uDC64"}</Text>
        <Text style={styles.message}>Vous n'etes pas connecte</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="Se connecter"
            variant="primary"
            onPress={() => router.push("/auth/login")}
          />
          <Button
            title="Creer un compte"
            variant="secondary"
            onPress={() => router.push("/auth/signup")}
          />
        </View>
      </View>
    );
  }

  const fullName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Utilisateur";
  const email = user.email ?? "—";
  const locale = user.user_metadata?.locale ?? "fr";

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {fullName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name}>{fullName}</Text>

      <View style={styles.infoCard}>
        <InfoRow label="Email" value={email} />
        <InfoRow label="Langue" value={locale.toUpperCase()} />
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
    alignItems: "center",
    padding: 32,
    paddingTop: 48,
  },
  loadingText: {
    color: "#8899AA",
    fontSize: 16,
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
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 12,
    width: "100%",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#0F1B2D",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#1A2B45",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: "#8899AA",
    fontSize: 14,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
