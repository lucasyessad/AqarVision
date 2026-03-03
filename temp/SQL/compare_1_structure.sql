/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Procedure comparaison STRUCTURE V4 vs V5
   AUTEUR      : UFLULY
   DATE        : 03/03/2026

   DESCRIPTION :
     Compare colonne par colonne la structure (type + longueur) de chaque
     table referencee dans dbo.ORT_PARAM_COMPARAISON_V4_V5.
     Utilise INFORMATION_SCHEMA.COLUMNS des bases V4 et V5.

     Ecarts detectes :
       'pas dans V4'              : colonne absente dans la base V4
       'pas dans V5'              : colonne absente dans la base V5
       'different entre V4 et V5' : type ou longueur different

     valeur_ecart_v4/v5 = DATA_TYPE + taille
       ex: 'VARCHAR(50)', 'DECIMAL(15,4)', 'DATE', 'VARCHAR(MAX)'
       NULL si la colonne est absente dans la base correspondante

     Insere dans dbo.ORT_ECART_DETAILS_V4_V5 (table unique, tronquee par ETAPE 1).
     flag_ecart_explique = 0 a l'insertion (mis a jour par compare_3_update_flag.sql).

   EXECUTION (via le bat MIGV5_COMPARE_V4_V5) :
     EXEC dbo.USP_COMPARE_STRUCTURE_V4_V5 @db_v4='dwh', @db_v5='dwh_v5';
   ------------------------------------------------------------------------------ */
CREATE OR ALTER PROCEDURE dbo.USP_COMPARE_STRUCTURE_V4_V5
    @db_v4  SYSNAME = N'dwh',
    @db_v5  SYSNAME = N'dwh_v5'
AS
BEGIN
    SET NOCOUNT ON;

    /* ----------------------------------------------------------------
       Validation des bases de donnees
    ---------------------------------------------------------------- */
    IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = @db_v4)
    BEGIN
        RAISERROR('Base de donnees V4 introuvable : %s', 16, 1, @db_v4);
        RETURN;
    END
    IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = @db_v5)
    BEGIN
        RAISERROR('Base de donnees V5 introuvable : %s', 16, 1, @db_v5);
        RETURN;
    END

    /* ----------------------------------------------------------------
       Timestamp unique pour ce run STRUCTURE
    ---------------------------------------------------------------- */
    DECLARE @date_verif DATETIME = GETDATE();
    PRINT 'USP_COMPARE_STRUCTURE_V4_V5 - debut : ' + CONVERT(VARCHAR, @date_verif, 121);

    /* ----------------------------------------------------------------
       Variables de travail
    ---------------------------------------------------------------- */
    DECLARE
        @t4       VARCHAR(200),
        @col_v4   VARCHAR(200),
        @t5       VARCHAR(200),
        @col_v5   VARCHAR(200),
        -- Infos INFORMATION_SCHEMA V4
        @dt_v4    VARCHAR(50),
        @len_v4   INT,
        @prec_v4  INT,
        @scale_v4 INT,
        -- Infos INFORMATION_SCHEMA V5
        @dt_v5    VARCHAR(50),
        @len_v5   INT,
        @prec_v5  INT,
        @scale_v5 INT,
        -- Formats lisibles calcules
        @fmt_v4   VARCHAR(500),
        @fmt_v5   VARCHAR(500),
        -- SQL dynamique (lecture INFORMATION_SCHEMA cross-DB)
        @sql      NVARCHAR(MAX);

    /* ================================================================
       Cursor sur toutes les lignes du mapping
       (une ligne = une paire colonne V4 / colonne V5)
    ================================================================ */
    DECLARE cur_cols CURSOR FAST_FORWARD FOR
        SELECT NOM_TABLE_V4, NOM_COLONNE_V4,
               NOM_TABLE_V5, NOM_COLONNE_V5
        FROM   dbo.ORT_PARAM_COMPARAISON_V4_V5
        ORDER  BY NOM_TABLE_V4, NOM_COLONNE_V4;

    OPEN cur_cols;
    FETCH NEXT FROM cur_cols INTO @t4, @col_v4, @t5, @col_v5;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        /* ---- Lecture INFORMATION_SCHEMA V4 ---- */
        SET @dt_v4 = NULL; SET @len_v4 = NULL; SET @prec_v4 = NULL; SET @scale_v4 = NULL;

        SET @sql = N'
SELECT @dt    = DATA_TYPE,
       @len   = CHARACTER_MAXIMUM_LENGTH,
       @prec  = NUMERIC_PRECISION,
       @scale = NUMERIC_SCALE
FROM   [' + @db_v4 + N'].INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_SCHEMA = ''dbo''
  AND  TABLE_NAME   = @tbl
  AND  COLUMN_NAME  = @col';

        EXEC sp_executesql @sql,
            N'@tbl VARCHAR(200), @col VARCHAR(200),
              @dt VARCHAR(50) OUTPUT, @len INT OUTPUT,
              @prec INT OUTPUT, @scale INT OUTPUT',
            @tbl = @t4, @col = @col_v4,
            @dt = @dt_v4 OUTPUT, @len = @len_v4 OUTPUT,
            @prec = @prec_v4 OUTPUT, @scale = @scale_v4 OUTPUT;

        /* ---- Lecture INFORMATION_SCHEMA V5 ---- */
        SET @dt_v5 = NULL; SET @len_v5 = NULL; SET @prec_v5 = NULL; SET @scale_v5 = NULL;

        SET @sql = N'
SELECT @dt    = DATA_TYPE,
       @len   = CHARACTER_MAXIMUM_LENGTH,
       @prec  = NUMERIC_PRECISION,
       @scale = NUMERIC_SCALE
FROM   [' + @db_v5 + N'].INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_SCHEMA = ''dbo''
  AND  TABLE_NAME   = @tbl
  AND  COLUMN_NAME  = @col';

        EXEC sp_executesql @sql,
            N'@tbl VARCHAR(200), @col VARCHAR(200),
              @dt VARCHAR(50) OUTPUT, @len INT OUTPUT,
              @prec INT OUTPUT, @scale INT OUTPUT',
            @tbl = @t5, @col = @col_v5,
            @dt = @dt_v5 OUTPUT, @len = @len_v5 OUTPUT,
            @prec = @prec_v5 OUTPUT, @scale = @scale_v5 OUTPUT;

        /* ---- Calcul des formats lisibles ---- */
        SET @fmt_v4 = CASE
            WHEN @dt_v4 IS NULL       THEN NULL
            WHEN @len_v4 = -1         THEN @dt_v4 + '(MAX)'
            WHEN @len_v4 IS NOT NULL  THEN @dt_v4 + '(' + CAST(@len_v4  AS VARCHAR(20)) + ')'
            WHEN @prec_v4 IS NOT NULL THEN @dt_v4 + '(' + CAST(@prec_v4 AS VARCHAR(10))
                                               + ',' + CAST(@scale_v4 AS VARCHAR(10)) + ')'
            ELSE @dt_v4
        END;

        SET @fmt_v5 = CASE
            WHEN @dt_v5 IS NULL       THEN NULL
            WHEN @len_v5 = -1         THEN @dt_v5 + '(MAX)'
            WHEN @len_v5 IS NOT NULL  THEN @dt_v5 + '(' + CAST(@len_v5  AS VARCHAR(20)) + ')'
            WHEN @prec_v5 IS NOT NULL THEN @dt_v5 + '(' + CAST(@prec_v5 AS VARCHAR(10))
                                               + ',' + CAST(@scale_v5 AS VARCHAR(10)) + ')'
            ELSE @dt_v5
        END;

        /* ---- Classification de l'ecart et insertion ---- */

        IF @dt_v4 IS NULL AND @dt_v5 IS NULL
        BEGIN
            /* Absente des deux cotes */
            INSERT INTO dbo.ORT_ECART_DETAILS_V4_V5
                (date_verification, type_verif, nom_table_v4, nom_table_v5,
                 nom_colonne_v4, nom_colonne_v5, type_ecart,
                 cle_fonctionnelle_v4, cle_fonctionnelle_v5,
                 valeur_ecart_v4, valeur_ecart_v5, flag_ecart_explique)
            VALUES
                (@date_verif, 'STRUCTURE', @t4, @t5,
                 @col_v4, @col_v5, 'pas dans V4 et pas dans V5',
                 NULL, NULL, NULL, NULL, 0);
        END
        ELSE IF @dt_v4 IS NULL
        BEGIN
            /* Cas 1 : absente en V4 */
            INSERT INTO dbo.ORT_ECART_DETAILS_V4_V5
                (date_verification, type_verif, nom_table_v4, nom_table_v5,
                 nom_colonne_v4, nom_colonne_v5, type_ecart,
                 cle_fonctionnelle_v4, cle_fonctionnelle_v5,
                 valeur_ecart_v4, valeur_ecart_v5, flag_ecart_explique)
            VALUES
                (@date_verif, 'STRUCTURE', @t4, @t5,
                 @col_v4, @col_v5, 'pas dans V4',
                 NULL, NULL, NULL, @fmt_v5, 0);
        END
        ELSE IF @dt_v5 IS NULL
        BEGIN
            /* Cas 2 : absente en V5 */
            INSERT INTO dbo.ORT_ECART_DETAILS_V4_V5
                (date_verification, type_verif, nom_table_v4, nom_table_v5,
                 nom_colonne_v4, nom_colonne_v5, type_ecart,
                 cle_fonctionnelle_v4, cle_fonctionnelle_v5,
                 valeur_ecart_v4, valeur_ecart_v5, flag_ecart_explique)
            VALUES
                (@date_verif, 'STRUCTURE', @t4, @t5,
                 @col_v4, @col_v5, 'pas dans V5',
                 NULL, NULL, @fmt_v4, NULL, 0);
        END
        ELSE IF @fmt_v4 <> @fmt_v5
        BEGIN
            /* Cas 3 : format different */
            INSERT INTO dbo.ORT_ECART_DETAILS_V4_V5
                (date_verification, type_verif, nom_table_v4, nom_table_v5,
                 nom_colonne_v4, nom_colonne_v5, type_ecart,
                 cle_fonctionnelle_v4, cle_fonctionnelle_v5,
                 valeur_ecart_v4, valeur_ecart_v5, flag_ecart_explique)
            VALUES
                (@date_verif, 'STRUCTURE', @t4, @t5,
                 @col_v4, @col_v5, 'different entre V4 et V5',
                 NULL, NULL, @fmt_v4, @fmt_v5, 0);
        END
        /* Cas 4 : formats identiques -> pas d'insertion */

        FETCH NEXT FROM cur_cols INTO @t4, @col_v4, @t5, @col_v5;
    END;

    CLOSE cur_cols;
    DEALLOCATE cur_cols;

    DECLARE @nb INT;
    SELECT @nb = COUNT(*) FROM dbo.ORT_ECART_DETAILS_V4_V5 WHERE type_verif = 'STRUCTURE';
    PRINT 'USP_COMPARE_STRUCTURE_V4_V5 - fin. Ecarts STRUCTURE inseres : ' + CAST(@nb AS VARCHAR);
END;
GO
