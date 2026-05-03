// One-shot critique : Sanity v4 traite les docs avec _id contenant un
// point ('.') comme des documents systeme et les filtre des reads publics.
// On reconstruit toutes les fiches rentalCar / rentalCarCategory avec
// des _id UUID autogenerees, en gardant les references images existantes
// (pas de re-upload).
import { client } from './_client';

async function main() {
  // 1. Categories : map old _id -> new uuid _id
  const oldCategories = await client.fetch<any[]>(`*[_type == "rentalCarCategory" && _id match "rentalCarCategory.*"]`);
  console.log(`${oldCategories.length} categories a recreer`);
  const catMap = new Map<string, string>();
  for (const c of oldCategories) {
    const fresh = { ...c };
    delete fresh._id;
    delete fresh._rev;
    delete fresh._createdAt;
    delete fresh._updatedAt;
    const created = await client.create(fresh);
    catMap.set(c._id, created._id);
    console.log(`  cat ${c._id} -> ${created._id}`);
  }

  // 2. Cars : recreer avec nouveau ref category
  const oldCars = await client.fetch<any[]>(`*[_type == "rentalCar" && _id match "rentalCar.*"]`);
  console.log(`${oldCars.length} voitures a recreer`);
  for (const car of oldCars) {
    const fresh: any = { ...car };
    delete fresh._id;
    delete fresh._rev;
    delete fresh._createdAt;
    delete fresh._updatedAt;
    if (fresh.category?._ref && catMap.has(fresh.category._ref)) {
      fresh.category._ref = catMap.get(fresh.category._ref);
    }
    const created = await client.create(fresh);
    console.log(`  car ${car.fullName} -> ${created._id}`);
  }

  // 3. Suppression des anciens docs (cars puis categories pour respecter
  //    les references)
  console.log('Suppression des anciennes fiches...');
  for (const car of oldCars) {
    await client.delete(car._id);
  }
  for (const c of oldCategories) {
    await client.delete(c._id);
  }
  console.log('Termine. Studio + reads publics : OK.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
