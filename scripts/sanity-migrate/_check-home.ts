// Verif rapide du contenu du singleton homePage en base.
import { client } from './_client';

async function main() {
  const d = await client.fetch(
    `*[_id == "homePage"][0] { _id, heroImage, "panels": servicePanels[]{service, "img": image.asset._ref}}`,
  );
  console.log(JSON.stringify(d, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
