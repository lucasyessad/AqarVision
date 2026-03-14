import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { ListingCard } from "../../components/ListingCard";

interface Listing {
  id: string;
  title: string;
  price: number;
  property_type: string;
  wilaya: string;
  image_url: string | null;
}

const PLACEHOLDER_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Appartement F3 Hydra",
    price: 12000000,
    property_type: "Appartement",
    wilaya: "Alger",
    image_url: null,
  },
  {
    id: "2",
    title: "Villa avec jardin Tipaza",
    price: 35000000,
    property_type: "Villa",
    wilaya: "Tipaza",
    image_url: null,
  },
  {
    id: "3",
    title: "Local commercial Oran",
    price: 8000000,
    property_type: "Commercial",
    wilaya: "Oran",
    image_url: null,
  },
  {
    id: "4",
    title: "Terrain 500m2 Bejaia",
    price: 5000000,
    property_type: "Terrain",
    wilaya: "Bejaia",
    image_url: null,
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  const filtered = PLACEHOLDER_LISTINGS.filter(
    (l) =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.wilaya.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par ville, type..."
        placeholderTextColor="#8899AA"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun resultat</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
    padding: 16,
  },
  searchInput: {
    backgroundColor: "#1A2B45",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A3B55",
  },
  list: {
    gap: 12,
  },
  emptyText: {
    color: "#8899AA",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
