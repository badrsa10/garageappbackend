-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicule" (
    "id_vehicule" TEXT NOT NULL PRIMARY KEY,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "matricule" TEXT NOT NULL,
    "numeroSerie" TEXT
);
INSERT INTO "new_Vehicule" ("annee", "id_vehicule", "kilometrage", "marque", "matricule", "modele", "numeroSerie") SELECT "annee", "id_vehicule", "kilometrage", "marque", "matricule", "modele", "numeroSerie" FROM "Vehicule";
DROP TABLE "Vehicule";
ALTER TABLE "new_Vehicule" RENAME TO "Vehicule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
