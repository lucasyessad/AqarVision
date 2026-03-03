/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Int�gration des donn�es TMP vers la table finale
   AUTEUR      : UFLULY
   DATE        : 25/02/2026
   ------------------------------------------------------------------------------ */

SET NOCOUNT ON;

INSERT INTO dbo.ORT_ECART_JUSTIF_V4_V5 (
    type_verif,
    nom_table_v4,
    nom_table_v5,
    nom_colonne_v4,
    nom_colonne_v5,
    cle_fonctionnelle,
    type_ecart,
    explication,
    date_explication
)
SELECT
    T.type_verif,
    T.nom_table_v4,
    T.nom_table_v5,
    T.nom_colonne_v4,
    T.nom_colonne_v5,
    T.cle_fonctionnelle,
    T.type_ecart,
    T.explication,
    ISNULL(TRY_CONVERT(datetime,T.date_explication,121), GETDATE())
FROM dbo.ORT_ECART_JUSTIF_V4_V5_TMP T;