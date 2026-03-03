/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Creation tables TMP + FINALE pour PARAM_COMPARAISON V4/V5
   AUTEUR      : UFLULY
   DATE        : 03/03/2026
   ------------------------------------------------------------------------------ */
SET NOCOUNT ON;

--------------------------------------------------------------
-- TABLE TEMPORAIRE
--------------------------------------------------------------
IF OBJECT_ID('dbo.ORT_PARAM_COMPARAISON_V4_V5_TMP', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ORT_PARAM_COMPARAISON_V4_V5_TMP (
        NOM_TABLE_V5            VARCHAR(200),
        NOM_COLONNE_V5          VARCHAR(200),
        NOM_TABLE_V4            VARCHAR(200),
        NOM_COLONNE_V4          VARCHAR(200),
        FLAG_CLEFONC            BIT,             
        REGLE_TRANSFORMATION_V4 VARCHAR(MAX)
    );
END;
GO

--------------------------------------------------------------
-- TABLE FINALE
-- Clé fonctionnelle = combinaison stricte des 4 colonnes
--------------------------------------------------------------
IF OBJECT_ID('dbo.ORT_PARAM_COMPARAISON_V4_V5', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ORT_PARAM_COMPARAISON_V4_V5 (
        NOM_TABLE_V5             VARCHAR(200) NOT NULL,
        NOM_COLONNE_V5           VARCHAR(200) NOT NULL,
        NOM_TABLE_V4             VARCHAR(200) NOT NULL,
        NOM_COLONNE_V4           VARCHAR(200) NOT NULL,
        FLAG_CLEFONC             BIT,   
        REGLE_TRANSFORMATION_V4  VARCHAR(MAX),

        CONSTRAINT PK_PARAM_COMPARAISON_V4_V5
            PRIMARY KEY (
                NOM_TABLE_V5,
                NOM_COLONNE_V5,
                NOM_TABLE_V4,
                NOM_COLONNE_V4
            )
    );
END;
GO