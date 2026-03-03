/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Intégration des données TMP vers la table finale
   AUTEUR      : UFLULY
   DATE        : 03/03/2026
   ------------------------------------------------------------------------------ */

SET NOCOUNT ON;

-- Purge complète de la table finale avant réintégration
TRUNCATE TABLE dbo.ORT_PARAM_COMPARAISON_V4_V5;

-- Intégration simple des données après contrôle (sans clés fonctionnelles)
INSERT INTO dbo.ORT_PARAM_COMPARAISON_V4_V5
(
    NOM_TABLE_V5,
    NOM_COLONNE_V5,
    NOM_TABLE_V4,
    NOM_COLONNE_V4,
    FLAG_CLEFONC,
    REGLE_TRANSFORMATION_V4
)
SELECT
    NOM_TABLE_V5,
    NOM_COLONNE_V5,
    NOM_TABLE_V4,
    NOM_COLONNE_V4,
    FLAG_CLEFONC,
    REGLE_TRANSFORMATION_V4
FROM dbo.ORT_PARAM_COMPARAISON_V4_V5_TMP;