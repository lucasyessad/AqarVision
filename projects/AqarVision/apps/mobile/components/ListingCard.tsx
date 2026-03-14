import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    property_type: string;
    wilaya: string;
    image_url: string | null;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter();
  const formattedPrice = new Intl.NumberFormat("fr-DZ").format(listing.price);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/listing/${listing.id}`)}
    >
      {/* Placeholder image */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>Photo</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{listing.property_type}</Text>
          </View>
          <Text style={styles.wilaya}>{listing.wilaya}</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>

        <Text style={styles.price}>{formattedPrice} DZD</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1A2B45",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A3B55",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: "#0F1B2D",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#556677",
    fontSize: 14,
  },
  info: {
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#0F1B2D",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  wilaya: {
    color: "#8899AA",
    fontSize: 13,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  price: {
    color: "#D4AF37",
    fontSize: 17,
    fontWeight: "700",
  },
});
