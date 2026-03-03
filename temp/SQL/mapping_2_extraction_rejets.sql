SET NOCOUNT ON;

--------------------------------------------------------------------------------
-- 1) NULL DANS LA CLE (4 colonnes PK)
--------------------------------------------------------------------------------
SELECT
    'NULL_IN_KEY' AS type_anomalie,
    T.NOM_TABLE_V5,
    T.NOM_COLONNE_V5,
    T.NOM_TABLE_V4,
    T.NOM_COLONNE_V4,
    T.FLAG_CLEFONC,
    T.REGLE_TRANSFORMATION_V4,
    1 AS NB
FROM dbo.ORT_PARAM_COMPARAISON_V4_V5_TMP T
WHERE 
       T.NOM_TABLE_V5   IS NULL
    OR T.NOM_COLONNE_V5 IS NULL
    OR T.NOM_TABLE_V4   IS NULL
    OR T.NOM_COLONNE_V4 IS NULL

UNION ALL

--------------------------------------------------------------------------------
-- 2) DOUBLONS stricts DANS le fichier TMP
--------------------------------------------------------------------------------
SELECT
    'DUPLICATION_IN_FILE' AS type_anomalie,
    T.NOM_TABLE_V5,
    T.NOM_COLONNE_V5,
    T.NOM_TABLE_V4,
    T.NOM_COLONNE_V4,
    T.FLAG_CLEFONC,
    T.REGLE_TRANSFORMATION_V4,
    T.NB
FROM (
    SELECT
        NOM_TABLE_V5,
        NOM_COLONNE_V5,
        NOM_TABLE_V4,
        NOM_COLONNE_V4,
        MAX(FLAG_CLEFONC)            AS FLAG_CLEFONC,
        MAX(REGLE_TRANSFORMATION_V4) AS REGLE_TRANSFORMATION_V4,
        COUNT(*) AS NB
    FROM dbo.ORT_PARAM_COMPARAISON_V4_V5_TMP
    GROUP BY
        NOM_TABLE_V5,
        NOM_COLONNE_V5,
        NOM_TABLE_V4,
        NOM_COLONNE_V4
) T
WHERE T.NB > 1
ORDER BY 
    NOM_TABLE_V5,
    NOM_COLONNE_V5,
    NOM_TABLE_V4,
    NOM_COLONNE_V4;