SET NOCOUNT ON;
GO

/* ============================================================
   TABLE TMP : ORT_ECART_JUSTIF_V4_V5_TMP
   - staging pour le chargement CSV
   - colonnes NULL (ingestion brute)
   ============================================================ */
IF OBJECT_ID('dbo.ORT_ECART_JUSTIF_V4_V5_TMP', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ORT_ECART_JUSTIF_V4_V5_TMP (
        type_verif          VARCHAR(20)     NULL,
        nom_table_v4        VARCHAR(255)    NULL,
        nom_table_v5        VARCHAR(255)    NULL,
        nom_colonne_v4      VARCHAR(255)    NULL,
        nom_colonne_v5      VARCHAR(255)    NULL,
        cle_fonctionnelle   VARCHAR(500)    NULL,
        type_ecart          VARCHAR(100)    NULL,
        explication         VARCHAR(MAX)    NULL,
        date_explication    DATETIME        NULL
    );
END
GO


/* ============================================================
   TABLE FINALE : ORT_ECART_JUSTIF_V4_V5
   - PK courte (id BIGINT) pour éviter l’avertissement 900 octets
   - Unicité métier garantie via pk_hash (SHA-256)
   ============================================================ */
IF OBJECT_ID('dbo.ORT_ECART_JUSTIF_V4_V5', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ORT_ECART_JUSTIF_V4_V5 (
        id                  BIGINT IDENTITY(1,1) NOT NULL,
        type_verif          VARCHAR(20)     NOT NULL,  
        nom_table_v4        VARCHAR(255)    NOT NULL,
        nom_table_v5        VARCHAR(255)    NOT NULL,
        nom_colonne_v4      VARCHAR(255)    NOT NULL,      
        nom_colonne_v5      VARCHAR(255)    NOT NULL,      
        cle_fonctionnelle   VARCHAR(500)    NOT NULL,      
        type_ecart          VARCHAR(100)    NOT NULL,  
        explication         VARCHAR(MAX)    NULL,
        date_explication    DATETIME        NULL,

        CONSTRAINT PK_ECART_JUSTIF_V4_V5
            PRIMARY KEY CLUSTERED (id)
    );
END
GO