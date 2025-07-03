import { Client } from "@notionhq/client";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const outputFile = "provisions.md";

console.log("🔍 Démarrage de la synchronisation Notion → Markdown...");
console.log("📂 Base utilisée :", databaseId);

try {
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  });

  console.log("✅ Base trouvée. Nombre d'entrées :", response.results.length);

  const header = "# Mes provisions\n\n📦 Dernière mise à jour : " +
    new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) +
    " (UTC+2)\n\n";

  const tableHeader = "| Catégorie | Produit | Quantité | Unité | Remarques | À acheter |\n" +
                      "|-----------|---------|----------|-------|-----------|-----------|\n";

  const rows = response.results.map((page, index) => {
    const props = page.properties;
    try {
      const categorie = props["Catégorie"]?.select?.name || "";
      const produit = props["Produit"]?.title?.[0]?.plain_text || "";
      const quantite = props["Quantité"]?.number ?? "";
      const unite = props["Unité"]?.select?.name || "";
      const remarques = props["Remarques"]?.rich_text?.[0]?.plain_text || "";
      const aAcheter = props["À acheter"]?.checkbox ? "oui" : "non";

      if (!produit) {
        console.warn(`⚠️ Ligne ${index + 1} ignorée : champ "Produit" manquant. Catégorie : "${categorie}"`);
        return null;
      }

      return `| ${categorie} | ${produit} | ${quantite} | ${unite} | ${remarques} | ${aAcheter} |`;
    } catch (error) {
      const produit = props["Produit"]?.title?.[0]?.plain_text || "(inconnu)";
      const categorie = props["Catégorie"]?.select?.name || "(inconnue)";
      console.warn(`⚠️ Ligne ${index + 1} ignorée à cause d'une erreur : ${error.message} → Produit : "${produit}", Catégorie : "${categorie}"`);
      return null;
    }
  }).filter(Boolean);

  const finalContent = header + tableHeader + rows.join("\n");

  fs.writeFileSync(outputFile, finalContent, "utf8");
  console.log("✅ Fichier provisions.md généré avec succès !");
} catch (error) {
  console.error("❌ Échec de la récupération depuis Notion :", error.message);
  process.exit(1);
}
