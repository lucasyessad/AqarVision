import { Pressable, Text, StyleSheet } from "react-native";

interface ButtonProps {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  onPress: () => void;
  disabled?: boolean;
}

export function Button({
  title,
  variant = "primary",
  onPress,
  disabled = false,
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#0F1B2D",
    borderWidth: 2,
    borderColor: "#D4AF37",
  },
  secondary: {
    backgroundColor: "#D4AF37",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#D4AF37",
  },
  secondaryText: {
    color: "#0F1B2D",
  },
  ghostText: {
    color: "#8899AA",
  },
});
