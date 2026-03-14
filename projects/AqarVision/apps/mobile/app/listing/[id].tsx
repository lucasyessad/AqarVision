import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button } from "../../components/Button";

// Placeholder data - in production this would come from Supabase
const LISTINGS: Record<string, any> = {
  "1": {
    title: "Appartement F3 Hydra",
    price: 12000000,
    property_type: "Appartement",
    wilaya: "Alger",
    description:
      "Bel appartement F3 situe a Hydra, Alger. 3 pieces, cuisine equipee, salle de bain moderne. Vue degagee, proche de toutes commodites.",
    surface: 85,
    rooms: 3,
  },
  "2": {
    title: "Villa avec jardin Tipaza",
    price: 35000000,
    property_type: "Villa",
    wilaya: "Tipaza",
    description:
      "Magnifique villa avec grand jardin a Tipaza. 5 pieces, garage, terrasse avec vue mer. Quartier calme et residentiel.",
    surface: 250,
    rooms: 5,
  },
  "3": {
    title: "Local commercial Oran",
    price: 8000000,
    property_type: "Commercial",
    wilaya: "Oran",
    description:
      "Local commercial bien situe au centre-ville d'Oran. Ideal pour commerce ou bureau. Grande vitrine.",
    surface: 60,
    rooms: 1,
  },
  "4": {
    title: "Terrain 500m2 Bejaia",
    price: 5000000,
    property_type: "Terrain",
    wilaya: "Bejaia",
    description:
      "Terrain constructible de 500m2 a Bejaia. Acte notarie, permis de construire disponible. Zone urbaine.",
    surface: 500,
    rooms: 0,
  },
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = LISTINGS[id ?? ""];

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Annonce introuvable</Text>
      </View>
    );
  }

  const formattedPrice = new Intl.NumberFormat("fr-DZ").format(listing.price);

  return (
    <ScrollView style={styles.container}>
      {/* Placeholder image */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>Photo</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{listing.property_type}</Text>
        </View>

        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>{formattedPrice} DZD</Text>
        <Text style={styles.location}>{listing.wilaya}</Text>

        {listing.surface > 0 && (
          <View style={styles.statsRow}>
            <StatItem label="Surface" value={`${listing.surface} m\u00B2`} />
            {listing.rooms > 0 && (
              <StatItem label="Pieces" value={`${listing.rooms}`} />
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{listing.description}</Text>

        <View style={styles.contactSection}>
          <Button
            title="Contacter le vendeur"
            variant="primary"
            onPress={() =>
              Alert.alert("Contact", "Fonctionnalite bientot disponible")
            }
          />
          <Button
            title="Ajouter aux favoris"
            variant="secondary"
            onPress={() =>
              Alert.alert("Favoris", "Fonctionnalite bientot disponible")
            }
          />
        </View>
      </View>
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: "#1A2B45",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#8899AA",
    fontSize: 18,
  },
  content: {
    padding: 20,
  },
  badge: {
    backgroundColor: "#D4AF37",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: "#0F1B2D",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  location: {
    color: "#8899AA",
    fontSize: 15,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
    backgroundColor: "#1A2B45",
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "#8899AA",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    color: "#CCDDEE",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  contactSection: {
    gap: 12,
    marginBottom: 40,
  },
});
