-- CreateTable
CREATE TABLE "MarqueModel" (
    "marque" TEXT NOT NULL,
    "model" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Commande" (
    "id_commande" TEXT NOT NULL PRIMARY KEY,
    "pieceId" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "etat" TEXT,
    "quantite" INTEGER NOT NULL,
    "prix_unite" REAL NOT NULL,
    "prix_total" REAL NOT NULL,
    CONSTRAINT "Commande_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece" ("id_piece") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Commande_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur" ("id_fournisseur") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Commande" ("etat", "fournisseurId", "id_commande", "pieceId", "prix_total", "prix_unite", "quantite") SELECT "etat", "fournisseurId", "id_commande", "pieceId", "prix_total", "prix_unite", "quantite" FROM "Commande";
DROP TABLE "Commande";
ALTER TABLE "new_Commande" RENAME TO "Commande";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MarqueModel_marque_key" ON "MarqueModel"("marque");
