-- CreateTable
CREATE TABLE "Client" (
    "id_client" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "type_personne" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    CONSTRAINT "Client_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule" ("id_vehicule") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id_vehicule" TEXT NOT NULL PRIMARY KEY,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "kilometrage" INTEGER NOT NULL,
    "matricule" TEXT NOT NULL,
    "numero_serie" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VehiculeHistorique" (
    "id_vehicule_historique" TEXT NOT NULL PRIMARY KEY,
    "vehiculeId" TEXT NOT NULL,
    "date_historique" DATETIME NOT NULL,
    "serviceId" TEXT NOT NULL,
    "libelle_service" TEXT NOT NULL,
    CONSTRAINT "VehiculeHistorique_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule" ("id_vehicule") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VehiculeHistorique_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id_service") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Service" (
    "id_service" TEXT NOT NULL PRIMARY KEY,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Piece" (
    "id_piece" TEXT NOT NULL PRIMARY KEY,
    "libelle" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Commande" (
    "id_commande" TEXT NOT NULL PRIMARY KEY,
    "pieceId" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "etat" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix_unite" REAL NOT NULL,
    "prix_total" REAL NOT NULL,
    CONSTRAINT "Commande_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "Piece" ("id_piece") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Commande_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur" ("id_fournisseur") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id_fournisseur" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_vehiculeId_key" ON "Client"("vehiculeId");

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_email_key" ON "Fournisseur"("email");
