/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : TRUNCATE + BULK INSERT dans ORT_PARAM_COMPARAISON_V4_V5_TMP
   AUTEUR      : UFLULY
   DATE        : 25/02/2026
   ------------------------------------------------------------------------------ */

-- Purge de la table temporaire
TRUNCATE TABLE dbo.ORT_PARAM_COMPARAISON_V4_V5_TMP;

-- Chargement du fichier CSV dans la table temporaire
BULK INSERT dbo.ORT_PARAM_COMPARAISON_V4_V5_TMP
FROM '$(CSVFILE)'
WITH (
    FIRSTROW = 2,
    FIELDTERMINATOR = ';',
    ROWTERMINATOR = '0x0A',
    CODEPAGE = '1252',    -- ANSI Windows FR
    TABLOCK
);
