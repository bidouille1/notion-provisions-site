import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

console.log("🧪 Vérification des lignes invalides dans la base Notion...");
console.log("📂 Base utilisée :", databaseId);

try {
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  });

  console.log("🔍 Nombre d'entrées dans la base :", response.results.length);
  let erreurs = 0;

  response.results.forEach((page, index) => {
    const props = page.properties;

    const produit = props["Produit"]?.title?.[0]?.plain_text;
    const categorie = props["Catégorie"]?.select?.name;
    const quantite = props["Quantité"]?.number;
    const unite = props["Unité"]?.select?.name;

    if (!produit) {
      console.warn(`⚠️ Ligne ${index + 1} : Produit manquant (Catégorie : ${categorie || "(inconnue)"})`);
      erreurs++;
    }

    if (!categorie) {
      console.warn(`⚠️ Ligne ${index + 1} : Catégorie manquante (Produit : ${produit || "(inconnu)"})`);
      erreurs++;
    }

    if (quantite === undefined) {
      console.warn(`⚠️ Ligne ${index + 1} : Quantité manquante (Produit : ${produit || "(inconnu)"})`);
      erreurs++;
    }

    if (!unite) {
      console.warn(`⚠️ Ligne ${index + 1} : Unité manquante (Produit : ${produit || "(inconnu)"})`);
      erreurs++;
    }
  });

  if (erreurs === 0) {
    console.log("✅ Toutes les lignes sont valides.");
  } else {
    console.log(`⚠️ ${erreurs} problème(s) détecté(s). Corrige les lignes dans Notion.`);
  }

} catch (error) {
  console.error("❌ Erreur lors de l'accès à la base Notion :", error.message);
  process.exit(1);
}
