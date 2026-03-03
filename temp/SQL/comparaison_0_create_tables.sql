/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Creation table de resultats ORT_ECART_COMPARAISON
   AUTEUR      : UFLULY
   DATE        : 03/03/2026
   ------------------------------------------------------------------------------ */
SET NOCOUNT ON;
GO

/* ============================================================
   TABLE DE RESULTATS : ORT_ECART_COMPARAISON
   Stocke les ecarts detectes lors de la comparaison V4/V5
   (structure + perimetre + valeurs)
   ============================================================ */
IF OBJECT_ID('dbo.ORT_ECART_COMPARAISON', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ORT_ECART_COMPARAISON (
        id                BIGINT        IDENTITY(1,1) NOT NULL,

        -- Type d'ecart : STRUCTURE | PERIM | VALEUR
        type_verif        VARCHAR(20)   NOT NULL,

        -- Identification des tables comparees
        nom_table_v4      VARCHAR(200)  NOT NULL,
        nom_table_v5      VARCHAR(200)  NOT NULL,

        -- Colonnes concernees (NULL pour les ecarts PERIM au niveau ligne)
        nom_colonne_v4    VARCHAR(200)  NULL,
        nom_colonne_v5    VARCHAR(200)  NULL,

        -- Valeur reelle de la cle fonctionnelle (ex : "42|CLI001")
        -- NULL pour les ecarts STRUCTURE
        cle_fonctionnelle VARCHAR(2000) NULL,

        -- Description de l'ecart
        type_ecart        VARCHAR(100)  NOT NULL,

        -- Valeurs comparees (renseignees pour VALEUR uniquement)
        valeur_v4         VARCHAR(MAX)  NULL,
        valeur_v5         VARCHAR(MAX)  NULL,

        -- Horodatage
        date_comparaison  DATETIME      NOT NULL
            CONSTRAINT DF_ECART_COMPAR_DATE DEFAULT GETDATE(),

        CONSTRAINT PK_ECART_COMPARAISON
            PRIMARY KEY CLUSTERED (id)
    );

    PRINT 'Table dbo.ORT_ECART_COMPARAISON creee.';
END
ELSE
BEGIN
    PRINT 'Table dbo.ORT_ECART_COMPARAISON deja existante - aucune action.';
END
GO
