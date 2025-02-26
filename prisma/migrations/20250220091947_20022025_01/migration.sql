/*
  Warnings:

  - You are about to drop the column `pieceouserviceId` on the `VehiculeHistorique` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VehiculeHistorique" (
    "id_vehicule_historique" TEXT NOT NULL PRIMARY KEY,
    "vehiculeId" TEXT,
    "date_historique" DATETIME NOT NULL,
    "kilometrage" INTEGER,
    "pieceId" TEXT,
    "serviceId" TEXT,
    "libelle_pieceouservice" TEXT,
    "remarque" TEXT,
    CONSTRAINT "VehiculeHistorique_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule" ("id_vehicule") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VehiculeHistorique_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id_service") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VehiculeHistorique_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece" ("id_piece") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VehiculeHistorique" ("date_historique", "id_vehicule_historique", "kilometrage", "libelle_pieceouservice", "remarque", "vehiculeId") SELECT "date_historique", "id_vehicule_historique", "kilometrage", "libelle_pieceouservice", "remarque", "vehiculeId" FROM "VehiculeHistorique";
DROP TABLE "VehiculeHistorique";
ALTER TABLE "new_VehiculeHistorique" RENAME TO "VehiculeHistorique";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
