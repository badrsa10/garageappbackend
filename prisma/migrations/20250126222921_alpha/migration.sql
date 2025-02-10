-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id_client" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "type_personne" TEXT NOT NULL,
    "vehiculeId" TEXT,
    CONSTRAINT "Client_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule" ("id_vehicule") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("email", "id_client", "nom", "prenom", "tel", "type_personne", "vehiculeId") SELECT "email", "id_client", "nom", "prenom", "tel", "type_personne", "vehiculeId" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE UNIQUE INDEX "Client_vehiculeId_key" ON "Client"("vehiculeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
