@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM -------------------------------------------------------------------------------
REM SCHEDULE   : MIGV5BI1                           JOB : MIGV5_COMPARE_V4_V5
REM TITRE      : COMPARAISON STRUCTURE ET DONNEES V4 VS V5
REM -------------------------------------------------------------------------------
REM
REM Etapes :
REM   1 - Creation table ORT_ECART_DETAILS_V4_V5 + remise a zero (TRUNCATE)
REM   2 - Creation proc USP_COMPARE_STRUCTURE_V4_V5
REM   3 - Execution comparaison STRUCTURE  (types et longueurs via INFORMATION_SCHEMA)
REM   4 - Creation proc USP_COMPARE_DONNEES_V4_V5
REM   5 - Execution comparaison DONNEES    (perimetre + valeurs)
REM   6 - Mise a jour flag_ecart_explique  (jointure avec ORT_ECART_JUSTIF_V4_V5)
REM -------------------------------------------------------------------------------

set "RC=0"
set "HAS_ERROR=0"

REM =====================================================================
REM PARAMETRES
REM =====================================================================
set "Server=erm"
set "DataBase=dwh"
set "DB_V4=dwh"
set "DB_V5=dwh_v5"

set "LOG_DIR=\\kenya\dsi\exploit\datalib\migv5lig\Logs"
set "SCRIPT_DIR=\\kenya\dsi\exploit\proclib\migv5lig"

set "SQL_CREATE=%SCRIPT_DIR%\compare_0_create_tables.sql"
set "SQL_STRUCT=%SCRIPT_DIR%\compare_1_structure.sql"
set "SQL_DONN=%SCRIPT_DIR%\compare_2_donnees.sql"
set "SQL_FLAG=%SCRIPT_DIR%\compare_3_update_flag.sql"

REM =====================================================================
REM HORODATAGE
REM =====================================================================
for /f "tokens=2 delims==." %%a in ('wmic os get LocalDateTime /value 2^>nul') do set "DT=%%a"
set "TS=!DT:~0,8!_!DT:~8,6!"

REM =====================================================================
REM CREATION DOSSIER LOGS
REM =====================================================================
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

set "GLOBAL_ERR_LOG=%LOG_DIR%\COMPARE_V4_V5_ERRORS_!TS!.log"
set "LOG_CREATE=%LOG_DIR%\COMPARE_V4_V5_CREATE_!TS!.log"
set "LOG_STRUCT=%LOG_DIR%\COMPARE_V4_V5_STRUCTURE_!TS!.log"
set "LOG_DONN=%LOG_DIR%\COMPARE_V4_V5_DONNEES_!TS!.log"
set "LOG_FLAG=%LOG_DIR%\COMPARE_V4_V5_FLAG_!TS!.log"

echo ============================================================
echo  COMPARAISON V4 VS V5 (STRUCTURE + DONNEES) - !TS!
echo ============================================================

REM =====================================================================
REM ETAPE 1 : CREATION TABLE + REMISE A ZERO
REM =====================================================================
echo [ETAPE 1] Creation et remise a zero de ORT_ECART_DETAILS_V4_V5...

sqlcmd -S !Server! -d !DataBase! -l 30 -b -i "!SQL_CREATE!" >> "!LOG_CREATE!" 2>&1
if !errorlevel! neq 0 (
    echo ERREUR ETAPE 1 - Creation table. RC=11 >> "!GLOBAL_ERR_LOG!"
    set "RC=11" & set "HAS_ERROR=1" & goto :FIN
)
findstr /i "Msg [0-9]* Level [0-9]* State" "!LOG_CREATE!" >nul 2>&1
if !errorlevel! equ 0 (
    echo ERREUR SQL ETAPE 1 - Detectee dans le log. RC=11 >> "!GLOBAL_ERR_LOG!"
    set "RC=11" & set "HAS_ERROR=1" & goto :FIN
)
echo [ETAPE 1] OK.

REM =====================================================================
REM ETAPE 2 : CREATION PROCEDURE STRUCTURE
REM =====================================================================
echo [ETAPE 2] Creation procedure USP_COMPARE_STRUCTURE_V4_V5...

sqlcmd -S !Server! -d !DataBase! -l 30 -b -i "!SQL_STRUCT!" >> "!LOG_STRUCT!" 2>&1
if !errorlevel! neq 0 (
    echo ERREUR ETAPE 2 - Creation proc STRUCTURE. RC=21 >> "!GLOBAL_ERR_LOG!"
    set "RC=21" & set "HAS_ERROR=1" & goto :FIN
)
findstr /i "Msg [0-9]* Level [0-9]* State" "!LOG_STRUCT!" >nul 2>&1
if !errorlevel! equ 0 (
    echo ERREUR SQL ETAPE 2 - Detectee dans le log. RC=21 >> "!GLOBAL_ERR_LOG!"
    set "RC=21" & set "HAS_ERROR=1" & goto :FIN
)
echo [ETAPE 2] OK.

REM =====================================================================
REM ETAPE 3 : EXECUTION COMPARAISON STRUCTURE
REM =====================================================================
echo [ETAPE 3] Execution comparaison STRUCTURE...

sqlcmd -S !Server! -d !DataBase! -l 3600 -b ^
  -Q "EXEC dbo.USP_COMPARE_STRUCTURE_V4_V5 @db_v4='!DB_V4!', @db_v5='!DB_V5!'" ^
  >> "!LOG_STRUCT!" 2>&1

if !errorlevel! neq 0 (
    echo ERREUR ETAPE 3 - Exec STRUCTURE. RC=22 >> "!GLOBAL_ERR_LOG!"
    set "RC=22" & set "HAS_ERROR=1" & goto :FIN
)
findstr /i "Msg [0-9]* Level [0-9]* State" "!LOG_STRUCT!" >nul 2>&1
if !errorlevel! equ 0 (
    echo ERREUR SQL ETAPE 3 - Detectee dans le log. RC=22 >> "!GLOBAL_ERR_LOG!"
    set "RC=22" & set "HAS_ERROR=1" & goto :FIN
)
echo [ETAPE 3] Comparaison STRUCTURE terminee.

REM =====================================================================
REM ETAPE 4 : CREATION PROCEDURE DONNEES
REM =====================================================================
echo [ETAPE 4] Creation procedure USP_COMPARE_DONNEES_V4_V5...

sqlcmd -S !Server! -d !DataBase! -l 30 -b -i "!SQL_DONN!" >> "!LOG_DONN!" 2>&1
if !errorlevel! neq 0 (
    echo ERREUR ETAPE 4 - Creation proc DONNEES. RC=23 >> "!GLOBAL_ERR_LOG!"
    set "RC=23" & set "HAS_ERROR=1" & goto :FIN
)
findstr /i "Msg [0-9]* Level [0-9]* State" "!LOG_DONN!" >nul 2>&1
if !errorlevel! equ 0 (
    echo ERREUR SQL ETAPE 4 - Detectee dans le log. RC=23 >> "!GLOBAL_ERR_LOG!"
    set "RC=23" & set "HAS_ERROR=1" & goto :FIN
)
echo [ETAPE 4] OK.

REM =====================================================================
REM ETAPE 5 : EXECUTION COMPARAISON DONNEES
REM =====================================================================
echo [ETAPE 5] Execution comparaison DONNEES...

sqlcmd -S !Server! -d !DataBase! -l 3600 -b ^
  -Q "EXEC dbo.USP_COMPARE_DONNEES_V4_V5 @db_v4='!DB_V4!', @db_v5='!DB_V5!'" ^
  >> "!LOG_DONN!" 2>&1

if !errorlevel! neq 0 (
    echo ERREUR ETAPE 5 - Exec DONNEES. RC=24 >> "!GLOBAL_ERR_LOG!"
    set "RC=24" & set "HAS_ERROR=1" & goto :FIN
)
findstr /i "Msg [0-9]* Level [0-9]* State" "!LOG_DONN!" >nul 2>&1
if !errorlevel! equ 0 (
    echo ERREUR SQL ETAPE 5 - Detectee dans le log. RC=24 >> "!GLOBAL_ERR_LOG!"
    set "RC=24" & set "HAS_ERROR=1" & goto :FIN
)
echo [ETAPE 5] Comparaison DONNEES terminee.

REM =====================================================================
REM ETAPE 6 : MISE A JOUR DES FLAGS
REM =====================================================================
echo [ETAPE 6] Mise a jour flag_ecart_explique...

sqlcmd -S !Server! -d !DataBase! -l 30 -b -i "!SQL_FLAG!" >> "!LOG_FLAG!" 2>&1
if !errorlevel! neq 0 (
    echo ERREUR ETAPE 6 - Mise a jour flag. RC=25 >> "!GLOBAL_ERR_LOG!"
    set "RC=25" & set "HAS_ERROR=1" & goto :FIN
)
findstr /i "Msg [0-9]* Level [0-9]* State" "!LOG_FLAG!" >nul 2>&1
if !errorlevel! equ 0 (
    echo ERREUR SQL ETAPE 6 - Detectee dans le log. RC=25 >> "!GLOBAL_ERR_LOG!"
    set "RC=25" & set "HAS_ERROR=1" & goto :FIN
)
echo [ETAPE 6] Flags mis a jour.

REM =====================================================================
REM FIN
REM =====================================================================
:FIN
if "!HAS_ERROR!"=="0" (
    echo.
    echo ============================================================
    echo  TRAITEMENT TERMINE AVEC SUCCES - RC=!RC!
    echo  Resultats dans : ORT_ECART_DETAILS_V4_V5
    echo  SELECT type_verif, type_ecart, COUNT(*) nb
    echo  FROM dbo.ORT_ECART_DETAILS_V4_V5
    echo  GROUP BY type_verif, type_ecart ORDER BY 1,2;
    echo ============================================================
    exit /b 0
) else (
    echo.
    echo ============================================================
    echo  TRAITEMENT TERMINE EN ERREUR - RC=!RC!
    echo  Consulter : !GLOBAL_ERR_LOG!
    echo ============================================================
    exit /b !RC!
)

endlocal
