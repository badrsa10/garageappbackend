-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MarqueModel" (
    "marque" TEXT NOT NULL,
    "model" TEXT NOT NULL,

    PRIMARY KEY ("marque", "model")
);
INSERT INTO "new_MarqueModel" ("marque", "model") SELECT "marque", "model" FROM "MarqueModel";
DROP TABLE "MarqueModel";
ALTER TABLE "new_MarqueModel" RENAME TO "MarqueModel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
