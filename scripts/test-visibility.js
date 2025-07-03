import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

console.log("🔍 Lancement du scan des bases accessibles avec ce token...");

try {
  const response = await notion.search({
    filter: {
      value: "database",
      property: "object"
    },
    page_size: 25
  });

  if (response.results.length === 0) {
    console.log("❌ Aucune base de données visible avec ce token.");
    process.exit(1);
  }

  console.log(`✅ ${response.results.length} base(s) accessible(s) trouvée(s) :\n`);
  for (const result of response.results) {
    const title = result.title?.[0]?.plain_text || "(titre non défini)";
    console.log(`🗂️ ${title} → ID : ${result.id}`);
  }

} catch (error) {
  console.error("❌ Erreur lors de l'appel à l'API Notion :");
  console.error(error.body || error.message);
  process.exit(1);
}
