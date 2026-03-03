/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Procedure comparaison DONNEES V4 vs V5
   AUTEUR      : UFLULY
   DATE        : 03/03/2026

   DESCRIPTION :
     Compare ligne par ligne les donnees de chaque paire de tables
     referencee dans dbo.ORT_PARAM_COMPARAISON_V4_V5.

     La cle fonctionnelle est construite dynamiquement :
       FLAG_CLEFONC=1 → colonne de cle, transformee via REGLE_TRANSFORMATION_V4
       FLAG_CLEFONC=0 → colonne de valeur a comparer

     Ecarts detectes :
       'dans V4 et pas dans V5'   : PERIM - ligne absente en V5
       'dans V5 et pas dans V4'   : PERIM - ligne absente en V4
       'different entre V4 et V5' : VALEUR - valeur differente sur perimetre commun

     Les ecarts VALEUR ne portent QUE sur le perimetre commun (INNER JOIN).

     Insere dans dbo.ORT_ECART_DETAILS_V4_V5 (table unique, tronquee par ETAPE 1).
     flag_ecart_explique = 0 a l'insertion (mis a jour par compare_3_update_flag.sql).

   EXECUTION (via le bat MIGV5_COMPARE_V4_V5) :
     EXEC dbo.USP_COMPARE_DONNEES_V4_V5 @db_v4='dwh', @db_v5='dwh_v5';
   ------------------------------------------------------------------------------ */
CREATE OR ALTER PROCEDURE dbo.USP_COMPARE_DONNEES_V4_V5
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
       Timestamp unique pour ce run DONNEES
    ---------------------------------------------------------------- */
    DECLARE @date_verif DATETIME = GETDATE();
    PRINT 'USP_COMPARE_DONNEES_V4_V5 - debut : ' + CONVERT(VARCHAR, @date_verif, 121);

    /* ----------------------------------------------------------------
       Variables de travail
    ---------------------------------------------------------------- */
    DECLARE
        @t4       VARCHAR(200),
        @t5       VARCHAR(200),
        @col_v4   VARCHAR(200),
        @col_v5   VARCHAR(200),
        @regle    VARCHAR(MAX),
        @key_v4   NVARCHAR(MAX),
        @key_v5   NVARCHAR(MAX),
        @sql      NVARCHAR(MAX);

    /* ================================================================
       Cursor sur les paires de tables distinctes
    ================================================================ */
    DECLARE cur_tables CURSOR FAST_FORWARD FOR
        SELECT DISTINCT NOM_TABLE_V4, NOM_TABLE_V5
        FROM   dbo.ORT_PARAM_COMPARAISON_V4_V5
        ORDER  BY NOM_TABLE_V4, NOM_TABLE_V5;

    OPEN cur_tables;
    FETCH NEXT FROM cur_tables INTO @t4, @t5;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT '  Paire : [' + @t4 + '] -> [' + @t5 + ']';

        BEGIN TRY

            /* ------------------------------------------------------------
               Construction des expressions de cle fonctionnelle
               FLAG_CLEFONC=1 : colonne cle (avec REGLE_TRANSFORMATION_V4)
               Ordre stable : ORDER BY NOM_COLONNE_V4
            ------------------------------------------------------------ */
            SET @key_v4 = N'';
            SET @key_v5 = N'';

            DECLARE cur_key CURSOR FAST_FORWARD FOR
                SELECT NOM_COLONNE_V5, REGLE_TRANSFORMATION_V4
                FROM   dbo.ORT_PARAM_COMPARAISON_V4_V5
                WHERE  NOM_TABLE_V4 = @t4 AND NOM_TABLE_V5 = @t5
                  AND  FLAG_CLEFONC = 1
                ORDER  BY NOM_COLONNE_V4;

            OPEN cur_key;
            FETCH NEXT FROM cur_key INTO @col_v5, @regle;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                IF @key_v4 <> N'' SET @key_v4 = @key_v4 + N' + ''|'' + ';
                IF @key_v5 <> N'' SET @key_v5 = @key_v5 + N' + ''|'' + ';

                SET @key_v4 = @key_v4
                    + N'ISNULL(CAST((' + @regle + N') AS VARCHAR(MAX)),'''')';
                SET @key_v5 = @key_v5
                    + N'ISNULL(CAST([' + @col_v5 + N'] AS VARCHAR(MAX)),'''')';

                FETCH NEXT FROM cur_key INTO @col_v5, @regle;
            END;
            CLOSE cur_key; DEALLOCATE cur_key;

            IF @key_v4 = N''
            BEGIN
                PRINT '  ATTENTION : aucune cle fonctionnelle (FLAG_CLEFONC=1) - ignoree.';
            END
            ELSE
            BEGIN

                /* ----------------------------------------------------------
                   PERIM : lignes dans V4 absentes de V5
                   cle_fonctionnelle_v4 = valeur reelle de la cle V4
                   cle_fonctionnelle_v5 = NULL (ligne absente en V5)
                ---------------------------------------------------------- */
                SET @sql = N'
INSERT INTO dbo.ORT_ECART_DETAILS_V4_V5
    (date_verification, type_verif,
     nom_table_v4, nom_table_v5,
     nom_colonne_v4, nom_colonne_v5,
     type_ecart,
     cle_fonctionnelle_v4, cle_fonctionnelle_v5,
     valeur_ecart_v4, valeur_ecart_v5,
     flag_ecart_explique)
SELECT @dv, ''DONNEES'',
       ''' + @t4 + N''', ''' + @t5 + N''',
       NULL, NULL,
       ''dans V4 et pas dans V5'',
       V4._k, NULL,
       NULL, NULL, 0
FROM (
    SELECT ' + @key_v4 + N' AS _k
    FROM   ' + QUOTENAME(@db_v4) + N'.dbo.' + QUOTENAME(@t4) + N'
) V4
WHERE NOT EXISTS (
    SELECT 1
    FROM (
        SELECT ' + @key_v5 + N' AS _k
        FROM   ' + QUOTENAME(@db_v5) + N'.dbo.' + QUOTENAME(@t5) + N'
    ) V5
    WHERE V5._k = V4._k
)';
                EXEC sp_executesql @sql, N'@dv DATETIME', @dv = @date_verif;

                /* ----------------------------------------------------------
                   PERIM : lignes dans V5 absentes de V4
                   cle_fonctionnelle_v4 = NULL (ligne absente en V4)
                   cle_fonctionnelle_v5 = valeur reelle de la cle V5
                ---------------------------------------------------------- */
                SET @sql = N'
INSERT INTO dbo.ORT_ECART_DETAILS_V4_V5
    (date_verification, type_verif,
     nom_table_v4, nom_table_v5,
     nom_colonne_v4, nom_colonne_v5,
     type_ecart,
     cle_fonctionnelle_v4, cle_fonctionnelle_v5,
     valeur_ecart_v4, valeur_ecart_v5,
     flag_ecart_explique)
SELECT @dv, ''DONNEES'',
       ''' + @t4 + N''', ''' + @t5 + N''',
       NULL, NULL,
       ''dans V5 et pas dans V4'',
       NULL, V5._k,
       NULL, NULL, 0
FROM (
    SELECT ' + @key_v5 + N' AS _k
    FROM   ' + QUOTENAME(@db_v5) + N'.dbo.' + QUOTENAME(@t5) + N'
) V5
WHERE NOT EXISTS (
    SELECT 1
    FROM (
        SELECT ' + @key_v4 + N' AS _k
        FROM   ' + QUOTENAME(@db_v4) + N'.dbo.' + QUOTENAME(@t4) + N'
    ) V4
    WHERE V4._k = V5._k
)';
                EXEC sp_executesql @sql, N'@dv DATETIME', @dv = @date_verif;

                /* ----------------------------------------------------------
                   VALEUR : colonnes non-cle differentes sur perimetre commun
                   INNER JOIN sur la cle fonctionnelle.
                   Un INSERT par colonne FLAG_CLEFONC=0.
                   cle_fonctionnelle_v4 = cle_fonctionnelle_v5 (meme valeur apres jointure)
                ---------------------------------------------------------- */
                DECLARE cur_nonkey CURSOR FAST_FORWARD FOR
                    SELECT NOM_COLONNE_V4, NOM_COLONNE_V5, REGLE_TRANSFORMATION_V4
                    FROM   dbo.ORT_PARAM_COMPARAISON_V4_V5
                    WHERE  NOM_TABLE_V4 = @t4 AND NOM_TABLE_V5 = @t5
                      AND  FLAG_CLEFONC = 0;

                OPEN cur_nonkey;
                FETCH NEXT FROM cur_nonkey INTO @col_v4, @col_v5, @regle;

                WHILE @@FETCH_STATUS = 0
                BEGIN
                    SET @sql = N'
INSERT INTO dbo.ORT_ECART_DETAILS_V4_V5
    (date_verification, type_verif,
     nom_table_v4, nom_table_v5,
     nom_colonne_v4, nom_colonne_v5,
     type_ecart,
     cle_fonctionnelle_v4, cle_fonctionnelle_v5,
     valeur_ecart_v4, valeur_ecart_v5,
     flag_ecart_explique)
SELECT @dv, ''DONNEES'',
       ''' + @t4 + N''', ''' + @t5 + N''',
       ''' + @col_v4 + N''', ''' + @col_v5 + N''',
       ''different entre V4 et V5'',
       V4._k, V5._k,
       V4._v, V5._v,
       0
FROM (
    SELECT ' + @key_v4 + N' AS _k,
           CAST((' + @regle + N') AS VARCHAR(MAX)) AS _v
    FROM   ' + QUOTENAME(@db_v4) + N'.dbo.' + QUOTENAME(@t4) + N'
) V4
JOIN (
    SELECT ' + @key_v5 + N' AS _k,
           CAST([' + @col_v5 + N'] AS VARCHAR(MAX)) AS _v
    FROM   ' + QUOTENAME(@db_v5) + N'.dbo.' + QUOTENAME(@t5) + N'
) V5 ON V4._k = V5._k
WHERE ISNULL(V4._v, ''__NULL__'') != ISNULL(V5._v, ''__NULL__'')';

                    EXEC sp_executesql @sql, N'@dv DATETIME', @dv = @date_verif;

                    FETCH NEXT FROM cur_nonkey INTO @col_v4, @col_v5, @regle;
                END;
                CLOSE cur_nonkey; DEALLOCATE cur_nonkey;

            END; /* IF @key_v4 <> '' */

        END TRY
        BEGIN CATCH
            IF CURSOR_STATUS('local','cur_key')    >= 0  CLOSE cur_key;
            IF CURSOR_STATUS('local','cur_key')    > -2  DEALLOCATE cur_key;
            IF CURSOR_STATUS('local','cur_nonkey') >= 0  CLOSE cur_nonkey;
            IF CURSOR_STATUS('local','cur_nonkey') > -2  DEALLOCATE cur_nonkey;

            PRINT '  ERREUR paire [' + ISNULL(@t4,'?') + ']/[' + ISNULL(@t5,'?') + '] : '
                + ERROR_MESSAGE();
        END CATCH;

        FETCH NEXT FROM cur_tables INTO @t4, @t5;
    END;

    CLOSE cur_tables;
    DEALLOCATE cur_tables;

    DECLARE @nb_perim INT, @nb_valeur INT;
    SELECT @nb_perim  = COUNT(*) FROM dbo.ORT_ECART_DETAILS_V4_V5
    WHERE  type_verif = 'DONNEES'
      AND  type_ecart IN ('dans V4 et pas dans V5','dans V5 et pas dans V4');
    SELECT @nb_valeur = COUNT(*) FROM dbo.ORT_ECART_DETAILS_V4_V5
    WHERE  type_verif = 'DONNEES' AND type_ecart = 'different entre V4 et V5';

    PRINT 'USP_COMPARE_DONNEES_V4_V5 - fin.';
    PRINT '  Ecarts PERIM  inseres : ' + CAST(@nb_perim  AS VARCHAR);
    PRINT '  Ecarts VALEUR inseres : ' + CAST(@nb_valeur AS VARCHAR);
END;
GO
