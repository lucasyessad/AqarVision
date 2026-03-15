import { describe, it, expect } from "vitest";
import { sanitizeInput } from "@/lib/sanitize";

describe("sanitizeInput", () => {
  describe("HTML escaping", () => {
    it("échappe le caractère '<'", () => {
      expect(sanitizeInput("<script>")).toBe("&lt;script&gt;");
    });

    it("échappe le caractère '>'", () => {
      expect(sanitizeInput("foo > bar")).toBe("foo &gt; bar");
    });

    it("échappe le caractère '&'", () => {
      expect(sanitizeInput("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("échappe le caractère '\"'", () => {
      expect(sanitizeInput('Say "hello"')).toBe("Say &quot;hello&quot;");
    });

    it("échappe le caractère apostrophe \"'\"", () => {
      expect(sanitizeInput("l'appartement")).toBe("l&#x27;appartement");
    });

    it("échappe une balise script complète", () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
    });
  });

  describe("suppression des null bytes", () => {
    it("supprime un null byte isolé", () => {
      expect(sanitizeInput("foo\0bar")).toBe("foobar");
    });

    it("supprime plusieurs null bytes", () => {
      expect(sanitizeInput("\0hello\0world\0")).toBe("helloworld");
    });

    it("retourne une chaîne vide si le contenu n'est que des null bytes", () => {
      expect(sanitizeInput("\0\0\0")).toBe("");
    });
  });

  describe("normalisation des espaces multiples", () => {
    it("réduit plusieurs espaces consécutifs en un seul", () => {
      expect(sanitizeInput("hello   world")).toBe("hello world");
    });

    it("réduit les tabulations et espaces mélangés en un seul espace", () => {
      expect(sanitizeInput("hello\t  world")).toBe("hello world");
    });

    it("réduit les sauts de ligne en un seul espace", () => {
      expect(sanitizeInput("hello\n\nworld")).toBe("hello world");
    });
  });

  describe("trim (suppression des espaces en début et fin)", () => {
    it("supprime les espaces en début de chaîne", () => {
      expect(sanitizeInput("   hello")).toBe("hello");
    });

    it("supprime les espaces en fin de chaîne", () => {
      expect(sanitizeInput("hello   ")).toBe("hello");
    });

    it("supprime les espaces des deux côtés", () => {
      expect(sanitizeInput("  hello world  ")).toBe("hello world");
    });
  });

  describe("texte propre", () => {
    it("laisse passer un texte sans caractères spéciaux sans modification", () => {
      expect(sanitizeInput("Appartement 3 pièces")).toBe("Appartement 3 pièces");
    });

    it("retourne une chaîne vide pour une chaîne vide", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("retourne une chaîne vide pour une chaîne d'espaces uniquement", () => {
      expect(sanitizeInput("   ")).toBe("");
    });
  });

  describe("combinaison de transformations", () => {
    it("applique trim, normalisation des espaces et escaping dans le bon ordre", () => {
      expect(sanitizeInput('  hello  <b>world</b>  ')).toBe(
        "hello &lt;b&gt;world&lt;/b&gt;"
      );
    });

    it("gère les null bytes combinés avec du HTML", () => {
      expect(sanitizeInput("\0<script>\0")).toBe("&lt;script&gt;");
    });
  });
});
