/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Creation + remise a zero de la table ORT_ECART_DETAILS_V4_V5
   AUTEUR      : UFLULY
   DATE        : 03/03/2026

   DESCRIPTION :
     Table unique pour tous les ecarts de comparaison V4/V5 :
       STRUCTURE → ecarts de type et longueur de colonnes (INFORMATION_SCHEMA)
       DONNEES   → ecarts de perimetre (PERIM) et de valeurs (VALEUR)

     Ce script est appele en ETAPE 1 du bat MIGV5_COMPARE_V4_V5.
     Il cree la table si elle n'existe pas, puis la tronque systematiquement
     pour garantir un recalcul complet a chaque run.
   ------------------------------------------------------------------------------ */
SET NOCOUNT ON;
GO

/* ============================================================
   TABLE UNIQUE : ORT_ECART_DETAILS_V4_V5
   ============================================================ */
IF OBJECT_ID('dbo.ORT_ECART_DETAILS_V4_V5', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ORT_ECART_DETAILS_V4_V5 (
        id                   BIGINT        IDENTITY(1,1) NOT NULL,

        -- Horodatage du lancement (GETDATE() au debut de chaque procedure)
        date_verification    DATETIME      NOT NULL,

        -- Discriminant : 'STRUCTURE' ou 'DONNEES'
        type_verif           VARCHAR(20)   NOT NULL,

        -- Tables comparees
        nom_table_v4         VARCHAR(200)  NOT NULL,
        nom_table_v5         VARCHAR(200)  NOT NULL,

        -- Colonnes concernees
        --   STRUCTURE : toujours renseignees
        --   DONNEES PERIM : NULL (ecart au niveau ligne, pas colonne)
        --   DONNEES VALEUR : renseignees
        nom_colonne_v4       VARCHAR(200)  NULL,
        nom_colonne_v5       VARCHAR(200)  NULL,

        -- Nature de l'ecart
        --   STRUCTURE : 'pas dans V4' | 'pas dans V5' | 'different entre V4 et V5'
        --   DONNEES   : 'dans V4 et pas dans V5' | 'dans V5 et pas dans V4'
        --               | 'different entre V4 et V5'
        type_ecart           VARCHAR(100)  NOT NULL,

        -- Valeur reelle de la cle fonctionnelle (DONNEES uniquement)
        --   PERIM dans V4 : cle_v4 renseignee, cle_v5 NULL
        --   PERIM dans V5 : cle_v4 NULL, cle_v5 renseignee
        --   VALEUR        : les deux renseignees (egales apres jointure)
        --   STRUCTURE     : toujours NULL
        cle_fonctionnelle_v4 VARCHAR(2000) NULL,
        cle_fonctionnelle_v5 VARCHAR(2000) NULL,

        -- Valeur en ecart
        --   STRUCTURE : format type+longueur  ex: 'VARCHAR(50)', 'DECIMAL(15,4)'
        --               NULL si colonne absente dans la base correspondante
        --   DONNEES VALEUR : valeur reelle de la colonne
        --   DONNEES PERIM  : NULL
        valeur_ecart_v4      VARCHAR(MAX)  NULL,
        valeur_ecart_v5      VARCHAR(MAX)  NULL,

        -- 0 a l'insertion, mis a 1 par compare_3_update_flag.sql
        -- si l'ecart est present dans ORT_ECART_JUSTIF_V4_V5
        flag_ecart_explique  BIT           NOT NULL
            CONSTRAINT DF_ECART_DETAILS_FLAG DEFAULT 0,

        CONSTRAINT PK_ECART_DETAILS
            PRIMARY KEY CLUSTERED (id)
    );

    PRINT 'Table dbo.ORT_ECART_DETAILS_V4_V5 creee.';
END
ELSE
BEGIN
    PRINT 'Table dbo.ORT_ECART_DETAILS_V4_V5 deja existante.';
END
GO

/* Remise a zero systematique avant chaque run */
TRUNCATE TABLE dbo.ORT_ECART_DETAILS_V4_V5;
PRINT 'Table dbo.ORT_ECART_DETAILS_V4_V5 tronquee - prete pour le run.';
GO
