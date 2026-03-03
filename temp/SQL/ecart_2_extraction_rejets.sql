SET NOCOUNT ON;

--------------------------------------------------------------
-- 1) Erreurs : une ou plusieurs colonnes de la clé sont NULL dans le fichier (TMP)
--    Comme demandé : PAS de normalisation, et NULL => ERREUR.
--------------------------------------------------------------
SELECT
    'NULL_IN-KEY' AS type_anomalie,
    T.type_verif, T.nom_table_v4, T.nom_table_v5,
    T.nom_colonne_v4, T.nom_colonne_v5, T.cle_fonctionnelle, T.type_ecart,
    1 AS nb
FROM dbo.ORT_ECART_JUSTIF_V4_V5_TMP T
WHERE
       T.type_verif        IS NULL
    OR T.nom_table_v4      IS NULL
    OR T.nom_table_v5      IS NULL
    OR T.nom_colonne_v4    IS NULL
    OR T.nom_colonne_v5    IS NULL
    OR T.cle_fonctionnelle IS NULL
    OR T.type_ecart        IS NULL

UNION ALL

--------------------------------------------------------------
-- 2) Doublons DANS le fichier (TMP)
--    Groupement strict sur les 7 colonnes de la clé, sans normalisation.
--------------------------------------------------------------
SELECT
    'DUPLICATION_IN_FILE' AS type_anomalie,
    K.type_verif, K.nom_table_v4, K.nom_table_v5,
    K.nom_colonne_v4, K.nom_colonne_v5, K.cle_fonctionnelle, K.type_ecart,
    K.nb
FROM (
    SELECT
        type_verif,
        nom_table_v4,
        nom_table_v5,
        nom_colonne_v4,
        nom_colonne_v5,
        cle_fonctionnelle,
        type_ecart,
        COUNT(*) AS nb
    FROM dbo.ORT_ECART_JUSTIF_V4_V5_TMP
    GROUP BY
        type_verif,
        nom_table_v4,
        nom_table_v5,
        nom_colonne_v4,
        nom_colonne_v5,
        cle_fonctionnelle,
        type_ecart
) K
WHERE K.nb > 1

UNION ALL

--------------------------------------------------------------
-- 3) Doublons ENTRE fichier (TMP) et table cible (FINAL)
--    Comme les 7 colonnes de la clé sont NOT NULL en table finale,
--    la jointure peut être stricte (égalité simple).
--------------------------------------------------------------
SELECT
    'DUPLICATION_IN_TABLE' AS type_anomalie,
    T.type_verif, T.nom_table_v4, T.nom_table_v5,
    T.nom_colonne_v4, T.nom_colonne_v5, T.cle_fonctionnelle, T.type_ecart,
    1 AS nb
FROM dbo.ORT_ECART_JUSTIF_V4_V5_TMP T
JOIN dbo.ORT_ECART_JUSTIF_V4_V5  C
      ON  C.type_verif        = T.type_verif
      AND C.nom_table_v4      = T.nom_table_v4
      AND C.nom_table_v5      = T.nom_table_v5
      AND C.nom_colonne_v4    = T.nom_colonne_v4
      AND C.nom_colonne_v5    = T.nom_colonne_v5
      AND C.cle_fonctionnelle = T.cle_fonctionnelle
      AND C.type_ecart        = T.type_ecart;