/* ------------------------------------------------------------------------------
   PROJET      : INEO
   APPLICATION : MIG_V5
   OBJET       : Procedure de comparaison structure + donnees V4 vs V5
   AUTEUR      : UFLULY
   DATE        : 03/03/2026

   DESCRIPTION :
     Compare toutes les tables et colonnes referencees dans
     dbo.ORT_PARAM_COMPARAISON_V4_V5 entre les bases V4 et V5.
     Detecte 3 types d'ecarts :
       - STRUCTURE : colonne absente en V4 ou V5
       - PERIM     : ligne presente dans une seule base
       - VALEUR    : ligne presente des deux cotes mais valeur differente

     Les ecarts deja justifies dans dbo.ORT_ECART_JUSTIF_V4_V5 sont
     supprimes en fin de traitement (au niveau colonne, toutes lignes).

   PARAMETRES :
     @db_v4  : nom de la base V4 (defaut : dwh)
     @db_v5  : nom de la base V5 (defaut : dwh_v5)

   EXECUTION :
     EXEC dbo.USP_COMPARE_V4_V5;
     EXEC dbo.USP_COMPARE_V4_V5 @db_v4 = 'dwh', @db_v5 = 'dwh_v5';
   ------------------------------------------------------------------------------ */
CREATE OR ALTER PROCEDURE dbo.USP_COMPARE_V4_V5
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
       Phase 1 : Reinitialisation de la table de resultats
    ---------------------------------------------------------------- */
    TRUNCATE TABLE dbo.ORT_ECART_COMPARAISON;
    PRINT 'ORT_ECART_COMPARAISON tronquee - debut du traitement.';

    /* ----------------------------------------------------------------
       Variables de travail
    ---------------------------------------------------------------- */
    DECLARE
        @t4         VARCHAR(200),
        @t5         VARCHAR(200),
        @col_v4     VARCHAR(200),
        @col_v5     VARCHAR(200),
        @regle      VARCHAR(MAX),
        @key_v4     NVARCHAR(MAX),
        @key_v5     NVARCHAR(MAX),
        @sql        NVARCHAR(MAX),
        @n          INT;

    /* ================================================================
       Phase 2 : Boucle sur les paires de tables
    ================================================================ */
    DECLARE cur_tables CURSOR FAST_FORWARD FOR
        SELECT DISTINCT NOM_TABLE_V4, NOM_TABLE_V5
        FROM   dbo.ORT_PARAM_COMPARAISON_V4_V5
        ORDER  BY NOM_TABLE_V4, NOM_TABLE_V5;

    OPEN cur_tables;
    FETCH NEXT FROM cur_tables INTO @t4, @t5;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Traitement paire : [' + @t4 + '] -> [' + @t5 + ']';

        BEGIN TRY

            /* ------------------------------------------------------------
               Phase 3 : STRUCTURE - Existence des colonnes
               Interroge sys.columns de chaque base via SQL dynamique.
            ------------------------------------------------------------ */
            DECLARE cur_struct CURSOR FAST_FORWARD FOR
                SELECT NOM_COLONNE_V4, NOM_COLONNE_V5
                FROM   dbo.ORT_PARAM_COMPARAISON_V4_V5
                WHERE  NOM_TABLE_V4 = @t4 AND NOM_TABLE_V5 = @t5;

            OPEN cur_struct;
            FETCH NEXT FROM cur_struct INTO @col_v4, @col_v5;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                /* --- Verif colonne V4 --- */
                SET @sql = N'SELECT @n = COUNT(1) FROM '
                         + QUOTENAME(@db_v4) + N'.sys.columns '
                         + N'WHERE object_id = OBJECT_ID(N'''
                         + @db_v4 + N'.dbo.' + @t4 + N''') '
                         + N'AND   name      = N''' + @col_v4 + N'''';
                SET @n = 0;
                EXEC sp_executesql @sql, N'@n INT OUTPUT', @n = @n OUTPUT;

                IF @n = 0
                    INSERT INTO dbo.ORT_ECART_COMPARAISON
                        (type_verif, nom_table_v4, nom_table_v5,
                         nom_colonne_v4, nom_colonne_v5, type_ecart)
                    VALUES ('STRUCTURE', @t4, @t5,
                            @col_v4, @col_v5, 'colonne absente V4');

                /* --- Verif colonne V5 --- */
                SET @sql = N'SELECT @n = COUNT(1) FROM '
                         + QUOTENAME(@db_v5) + N'.sys.columns '
                         + N'WHERE object_id = OBJECT_ID(N'''
                         + @db_v5 + N'.dbo.' + @t5 + N''') '
                         + N'AND   name      = N''' + @col_v5 + N'''';
                SET @n = 0;
                EXEC sp_executesql @sql, N'@n INT OUTPUT', @n = @n OUTPUT;

                IF @n = 0
                    INSERT INTO dbo.ORT_ECART_COMPARAISON
                        (type_verif, nom_table_v4, nom_table_v5,
                         nom_colonne_v4, nom_colonne_v5, type_ecart)
                    VALUES ('STRUCTURE', @t4, @t5,
                            @col_v4, @col_v5, 'colonne absente V5');

                FETCH NEXT FROM cur_struct INTO @col_v4, @col_v5;
            END;

            CLOSE cur_struct;
            DEALLOCATE cur_struct;

            /* ------------------------------------------------------------
               Phase 4a : Construction des expressions de cle fonctionnelle
               Une expression @key_v4 (avec REGLE_TRANSFORMATION_V4)
               et @key_v5 (colonne V5 brute) sont construites pour chaque
               colonne FLAG_CLEFONC = 1 de la paire courante.
            ------------------------------------------------------------ */
            SET @key_v4 = N'';
            SET @key_v5 = N'';

            DECLARE cur_key CURSOR FAST_FORWARD FOR
                SELECT NOM_COLONNE_V5, REGLE_TRANSFORMATION_V4
                FROM   dbo.ORT_PARAM_COMPARAISON_V4_V5
                WHERE  NOM_TABLE_V4 = @t4 AND NOM_TABLE_V5 = @t5
                  AND  FLAG_CLEFONC = 1
                ORDER  BY NOM_COLONNE_V4;    -- ordre stable et reproductible

            OPEN cur_key;
            FETCH NEXT FROM cur_key INTO @col_v5, @regle;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                IF @key_v4 <> N'' SET @key_v4 = @key_v4 + N' + ''|'' + ';
                IF @key_v5 <> N'' SET @key_v5 = @key_v5 + N' + ''|'' + ';

                -- V4 : appliquer la regle de transformation
                SET @key_v4 = @key_v4
                    + N'ISNULL(CAST((' + @regle + N') AS VARCHAR(MAX)),'''')';

                -- V5 : colonne brute (pas de transformation)
                SET @key_v5 = @key_v5
                    + N'ISNULL(CAST([' + @col_v5 + N'] AS VARCHAR(MAX)),'''')';

                FETCH NEXT FROM cur_key INTO @col_v5, @regle;
            END;

            CLOSE cur_key;
            DEALLOCATE cur_key;

            /* Comparaison des donnees uniquement si une cle est definie */
            IF @key_v4 <> N''
            BEGIN

                /* ----------------------------------------------------------
                   Phase 4b : PERIM - lignes seulement dans V4 (pas dans V5)
                   Chaque ligne est identifiee par la valeur de sa cle
                   fonctionnelle calculee avec REGLE_TRANSFORMATION_V4.
                ---------------------------------------------------------- */
                SET @sql = N'
INSERT INTO dbo.ORT_ECART_COMPARAISON
    (type_verif, nom_table_v4, nom_table_v5,
     nom_colonne_v4, nom_colonne_v5, cle_fonctionnelle, type_ecart)
SELECT ''PERIM'', ''' + @t4 + N''', ''' + @t5 + N''',
       NULL, NULL, V4._k, ''pas dans V5''
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
                EXEC sp_executesql @sql;

                /* ----------------------------------------------------------
                   Phase 4c : PERIM - lignes seulement dans V5 (pas dans V4)
                ---------------------------------------------------------- */
                SET @sql = N'
INSERT INTO dbo.ORT_ECART_COMPARAISON
    (type_verif, nom_table_v4, nom_table_v5,
     nom_colonne_v4, nom_colonne_v5, cle_fonctionnelle, type_ecart)
SELECT ''PERIM'', ''' + @t4 + N''', ''' + @t5 + N''',
       NULL, NULL, V5._k, ''pas dans V4''
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
                EXEC sp_executesql @sql;

                /* ----------------------------------------------------------
                   Phase 4d : VALEUR - colonnes non-cle qui different
                   Un bloc par colonne FLAG_CLEFONC = 0.
                   Comparaison apres application de REGLE_TRANSFORMATION_V4
                   sur la valeur V4 ; valeur V5 utilisee brute.
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
INSERT INTO dbo.ORT_ECART_COMPARAISON
    (type_verif, nom_table_v4, nom_table_v5, nom_colonne_v4, nom_colonne_v5,
     cle_fonctionnelle, type_ecart, valeur_v4, valeur_v5)
SELECT ''VALEUR'',
       ''' + @t4 + N''', ''' + @t5 + N''',
       ''' + @col_v4 + N''', ''' + @col_v5 + N''',
       V4._k, ''valeur differente'', V4._v, V5._v
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

                    EXEC sp_executesql @sql;

                    FETCH NEXT FROM cur_nonkey INTO @col_v4, @col_v5, @regle;
                END;

                CLOSE cur_nonkey;
                DEALLOCATE cur_nonkey;

            END; /* IF @key_v4 <> '' */

        END TRY
        BEGIN CATCH
            /* Nettoyage des sous-curseurs eventuellement laisses ouverts */
            IF CURSOR_STATUS('local', 'cur_struct') >= 0  CLOSE cur_struct;
            IF CURSOR_STATUS('local', 'cur_struct') > -2  DEALLOCATE cur_struct;
            IF CURSOR_STATUS('local', 'cur_key')    >= 0  CLOSE cur_key;
            IF CURSOR_STATUS('local', 'cur_key')    > -2  DEALLOCATE cur_key;
            IF CURSOR_STATUS('local', 'cur_nonkey') >= 0  CLOSE cur_nonkey;
            IF CURSOR_STATUS('local', 'cur_nonkey') > -2  DEALLOCATE cur_nonkey;

            PRINT 'ERREUR paire [' + ISNULL(@t4, '?') + ']/[' + ISNULL(@t5, '?') + '] : '
                + ERROR_MESSAGE();
        END CATCH;

        FETCH NEXT FROM cur_tables INTO @t4, @t5;
    END;

    CLOSE cur_tables;
    DEALLOCATE cur_tables;

    /* ================================================================
       Phase 5 : Suppression des ecarts deja justifies
       Logique : ORT_ECART_JUSTIF explique les ecarts au niveau colonne
       (toutes les lignes de cette colonne pour cette paire de tables).
       La jointure porte sur (type_verif + tables + colonnes + type_ecart).
       La cle_fonctionnelle n'est pas comparee : dans ORT_ECART_JUSTIF
       elle contient le NOM de la colonne cle (ex : ID_ADR), pas la valeur.
    ================================================================ */
    DELETE E
    FROM   dbo.ORT_ECART_COMPARAISON E
    WHERE  EXISTS (
        SELECT 1
        FROM   dbo.ORT_ECART_JUSTIF_V4_V5 J
        WHERE  J.nom_table_v4              = E.nom_table_v4
          AND  J.nom_table_v5              = E.nom_table_v5
          AND  ISNULL(J.nom_colonne_v4,'') = ISNULL(E.nom_colonne_v4,'')
          AND  ISNULL(J.nom_colonne_v5,'') = ISNULL(E.nom_colonne_v5,'')
          AND  J.type_ecart                = E.type_ecart
          AND  J.type_verif                = E.type_verif
    );

    PRINT 'Traitement termine. Ecarts stockes dans ORT_ECART_COMPARAISON.';
    PRINT 'Requete de controle : SELECT type_verif, type_ecart, COUNT(*) FROM dbo.ORT_ECART_COMPARAISON GROUP BY type_verif, type_ecart ORDER BY 1,2;';
END;
GO
