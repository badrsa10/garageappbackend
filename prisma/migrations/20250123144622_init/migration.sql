/*
  Warnings:

  - You are about to drop the column `numero_serie` on the `Vehicule` table. All the data in the column will be lost.
  - Added the required column `numeroSerie` to the `Vehicule` table without a default value. This is not possible if the table is not empty.

*/
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
    "numeroSerie" TEXT NOT NULL
);
INSERT INTO "new_Vehicule" ("annee", "id_vehicule", "kilometrage", "marque", "matricule", "modele") SELECT "annee", "id_vehicule", "kilometrage", "marque", "matricule", "modele" FROM "Vehicule";
DROP TABLE "Vehicule";
ALTER TABLE "new_Vehicule" RENAME TO "Vehicule";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
