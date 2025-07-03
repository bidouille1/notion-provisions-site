import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

console.log("🔍 Test de connexion à Notion");
console.log("📂 ID reçu :", databaseId);

try {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  console.log("✅ Base trouvée !");
  console.log("📝 Nom de la base :", db.title[0]?.plain_text || "(non renseigné)");
} catch (error) {
  console.error("❌ Erreur lors de la connexion ou récupération de la base :");
  console.error(error.body || error.message);
  process.exit(1);
}
