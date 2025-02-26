/*
  Warnings:

  - You are about to drop the column `libelle_service` on the `VehiculeHistorique` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `VehiculeHistorique` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VehiculeHistorique" (
    "id_vehicule_historique" TEXT NOT NULL PRIMARY KEY,
    "vehiculeId" TEXT,
    "date_historique" DATETIME NOT NULL,
    "kilometrage" INTEGER,
    "pieceouserviceId" TEXT,
    "libelle_pieceouservice" TEXT,
    "remarque" TEXT,
    CONSTRAINT "VehiculeHistorique_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule" ("id_vehicule") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VehiculeHistorique_pieceouserviceId_fkey" FOREIGN KEY ("pieceouserviceId") REFERENCES "Service" ("id_service") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VehiculeHistorique_pieceouserviceId_fkey" FOREIGN KEY ("pieceouserviceId") REFERENCES "Piece" ("id_piece") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VehiculeHistorique" ("date_historique", "id_vehicule_historique", "remarque", "vehiculeId") SELECT "date_historique", "id_vehicule_historique", "remarque", "vehiculeId" FROM "VehiculeHistorique";
DROP TABLE "VehiculeHistorique";
ALTER TABLE "new_VehiculeHistorique" RENAME TO "VehiculeHistorique";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
