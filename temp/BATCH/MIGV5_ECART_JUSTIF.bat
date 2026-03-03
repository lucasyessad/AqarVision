@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM -------------------------------------------------------------------------------
REM SCHEDULE   : MIGV5BI1                           JOB : MIGV5_ECART_JUSTIF
REM TITRE      : CHARGEMENT DES ECARTS EXPLIQUES V4/V5
REM -------------------------------------------------------------------------------

set "RC=0"
set "HAS_ERROR=0"

REM =====================================================================
REM PARAMETRES
REM =====================================================================
set "Server=erm"
set "DataBase=dwh"

set "SOURCE_DIR=\\kenya\dsi\exploit\datalib\migv5lig\Depot"
set "REF_DIR=\\kenya\dsi\exploit\datalib\migv5lig\referentiel"
set "ARCHIVE_DIR=\\kenya\dsi\exploit\datalib\migv5lig\Archives"
set "ERREUR_DIR=\\kenya\dsi\exploit\datalib\migv5lig\Erreurs"
set "MASQUE_CSV_FILE=ECART_JUSTIF_V4_V5"

set "SCRIPT_DIR=\\kenya\dsi\exploit\proclib\migv5lig"
set "SQL_CREATE=%SCRIPT_DIR%\ecart_0_create_all_tables.sql"
set "SQL_LOAD=%SCRIPT_DIR%\ecart_1_load_tmp.sql"
set "SQL_EXTRACT=%SCRIPT_DIR%\ecart_2_extraction_rejets.sql"
set "SQL_INTEG=%SCRIPT_DIR%\ecart_3_integrate_final.sql"

REM =====================================================================
REM NETTOYAGE REPERTOIRE ERREUR
REM =====================================================================
echo Nettoyage du repertoire d'erreurs...
del /q "%ERREUR_DIR%\*.*" >nul 2>&1
echo Nettoyage termine.

REM =====================================================================
REM HORODATAGE
REM =====================================================================
for /f "tokens=2 delims==." %%a in ('wmic os get LocalDateTime /value 2^>nul') do set "DT=%%a"
set "TS=!DT:~0,8!_!DT:~8,6!"

REM =====================================================================
REM CREATION DOSSIERS
REM =====================================================================
if not exist "%ERREUR_DIR%"  mkdir "%ERREUR_DIR%"
if not exist "%ARCHIVE_DIR%" mkdir "%ARCHIVE_DIR%"
if not exist "%REF_DIR%"     mkdir "%REF_DIR%"

set "GLOBAL_ERR_LOG=%ERREUR_DIR%\ECART_JUSTIF_ERRORS_!TS!.log"
if exist "!GLOBAL_ERR_LOG!" del "!GLOBAL_ERR_LOG!" >nul 2>&1

echo ================================================================
echo TRAITEMENT ECARTS JUSTIFIES V4/V5 - [!TS!]
echo ================================================================

REM =====================================================================
REM ETAPE 0 - FICHIERS
REM =====================================================================
echo [ETAPE 0/5] Recherche fichiers...

if not exist "%SOURCE_DIR%\%MASQUE_CSV_FILE%*.csv" (
    echo   KO - Aucun fichier a traiter
    set "RC=10"
    goto FIN
)

echo   OK - Des fichiers ont ete trouves.

REM =====================================================================
REM ETAPE 1 - CREATION TABLES
REM =====================================================================
echo [ETAPE 1/5] Creation / Verification des tables...

sqlcmd -S %Server% -d %DataBase% -E -l 30 -i "%SQL_CREATE%"
if errorlevel 1 (
    echo   KO - Erreur creation / verification tables
    set "RC=11"
    goto FIN
)

echo   OK - Tables pretes

REM =====================================================================
REM TRAITEMENT DES FICHIERS
REM =====================================================================
for %%F in ("%SOURCE_DIR%\%MASQUE_CSV_FILE%*.csv") do (
    call :PROCESS_FILE "%%~fF" "%%~nF" "%%~nxF"
)

if "!HAS_ERROR!"=="1" if "!RC!"=="0" set "RC=20"

REM Nettoyage logs vides
for %%L in ("%ERREUR_DIR%\*.log") do (
    if %%~zL==0 del "%%L" >nul 2>&1
)

goto FIN

REM =====================================================================
REM === SOUS-ROUTINE TRAITEMENT FICHIER ================================
REM =====================================================================
:PROCESS_FILE
set "FULL_PATH=%~1"
set "CURRENT_BASE=%~2"
set "CSV_FILE=%~3"
set "FILE_LOG=%ERREUR_DIR%\ECART_JUSTIF_%CURRENT_BASE%_LOAD_!TS!.log"
set "INTEG_LOG=%ERREUR_DIR%\ECART_JUSTIF_%CURRENT_BASE%_INTEG_!TS!.log"
set "TMP_DUP=%ERREUR_DIR%\tmp_doublons_%CURRENT_BASE%_!TS!.csv"

echo --------------------------------------------------------------
echo TRAITEMENT DE : %CSV_FILE%
echo --------------------------------------------------------------

REM =====================================================================
REM CONVERSION ANSI
REM =====================================================================
echo [CONV] Conversion ANSI du fichier...

REM Detecte BOM UTF-8 (EF BB BF) -> decode UTF-8 ; sinon lit en ANSI 1252. Reecrit en ANSI 1252.
powershell -NoLogo -NoProfile -Command "$p='!FULL_PATH!'; $b=[IO.File]::ReadAllBytes($p); if($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF){$c=[Text.Encoding]::UTF8.GetString($b,3,$b.Length-3)}else{$c=[Text.Encoding]::GetEncoding(1252).GetString($b)}; [IO.File]::WriteAllText($p,$c,[Text.Encoding]::GetEncoding(1252))"

if errorlevel 1 (
    echo   KO - Echec conversion ANSI [%CSV_FILE%]
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR CONVERSION ANSI : %CSV_FILE%
    goto :EOF
)

echo   OK - Fichier converti en ANSI

REM =====================================================================
REM ETAPE 2 - CHARGEMENT TMP
REM =====================================================================
echo [ETAPE 2/5] Chargement TMP...

if exist "!FILE_LOG!" del "!FILE_LOG!" >nul 2>&1

sqlcmd -S %Server% -d %DataBase% -E -l 30 ^
    -v CSVFILE="!FULL_PATH!" ^
    -i "%SQL_LOAD%" -o "!FILE_LOG!" 2>&1

if errorlevel 1 (
    echo   KO - Erreur chargement TMP [%CSV_FILE%]
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR CHARGEMENT : %CSV_FILE%
    goto :EOF
)

findstr /I /C:"Msg " /C:"Level " /C:"Incorrect" /C:"Cannot" /C:"Error" "!FILE_LOG!" >nul 2>&1
if not errorlevel 1 (
    echo   KO - Erreur SQL detectee dans le log de chargement [%CSV_FILE%]
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR SQL CHARGEMENT : %CSV_FILE%
    goto :EOF
)

echo   OK - TMP chargee

REM =====================================================================
REM ETAPE 3 - EXTRACTION REJETS
REM =====================================================================
echo [ETAPE 3/5] Extraction des rejets...

if exist "!TMP_DUP!" del "!TMP_DUP!" >nul 2>&1

sqlcmd -S %Server% -d %DataBase% -E -l 30 ^
    -i "%SQL_EXTRACT%" ^
    -s ";" -W -h -1 ^
    -o "!TMP_DUP!" 2>> "!FILE_LOG!"

if errorlevel 1 (
    echo   KO - Erreur technique extraction rejets [%CSV_FILE%]
    set "HAS_ERROR=1"
    set "RC=21"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR EXTRACTION REJETS : %CSV_FILE%
    goto :EOF
)

set "NB_REJETS=0"

for /f "usebackq tokens=* delims=" %%L in (`findstr /V /I /C:"rows affected" "!TMP_DUP!"`) do (
    set "LINE=%%L"
    if not "!LINE!"=="" set /a NB_REJETS+=1
)

if "!NB_REJETS!"=="0" (
    echo   OK - Aucun rejet
    del "!TMP_DUP!" >nul 2>&1
    goto ETAPE_4
)

echo   KO - !NB_REJETS! rejet(s) detecte(s) dans %CSV_FILE%

set "REJET_FILE=%CURRENT_BASE%_REJET_!TS!.csv"
ren "!TMP_DUP!" "!REJET_FILE!"

set "HAS_ERROR=1"
>> "!GLOBAL_ERR_LOG!" echo REJETS [!NB_REJETS!] : %CSV_FILE%

goto :EOF

REM =====================================================================
REM ETAPE 4 - INTEGRATION
REM =====================================================================
:ETAPE_4
echo [ETAPE 4/5] Integration finale...

sqlcmd -S %Server% -d %DataBase% -E -l 30 ^
    -i "%SQL_INTEG%" -o "!INTEG_LOG!" 2>&1

if errorlevel 1 (
    echo   KO - Erreur integration finale [%CSV_FILE%]
    set "HAS_ERROR=1"
    if "!RC!"=="0" set "RC=22"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR INTEGRATION : %CSV_FILE%
    goto :EOF
)

findstr /I /C:"Msg " /C:"Level " /C:"Incorrect" /C:"Cannot" /C:"Error" "!INTEG_LOG!" >nul 2>&1
if not errorlevel 1 (
    echo   KO - Erreur SQL detectee dans le log d'integration [%CSV_FILE%]
    set "HAS_ERROR=1"
    if "!RC!"=="0" set "RC=22"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR SQL INTEGRATION : %CSV_FILE%
    goto :EOF
)

echo   OK - Integration terminee

REM =====================================================================
REM ETAPE 5 - ARCHIVAGE
REM =====================================================================
echo [ETAPE 5/5] Archivage...

set "ARCHIVE_NAME=%CSV_FILE:~0,-4%_!TS!.csv"

move "!FULL_PATH!" "%ARCHIVE_DIR%\!ARCHIVE_NAME!" >nul 2>&1

if errorlevel 1 (
    echo   KO - Erreur archivage du fichier %CSV_FILE%
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR ARCHIVAGE : %CSV_FILE%
    goto :EOF
)

echo   OK - Fichier archive : !ARCHIVE_NAME!

goto :EOF

REM =====================================================================
REM FIN
REM =====================================================================
:FIN

call :ZIP_SEPARES

echo ================================================================
if "!RC!"=="10" (
    echo FIN - Aucun fichier a traiter [!TS!] - RC=!RC!
    exit /b !RC!
)

if "!RC!"=="11" (
    echo FIN ANORMALE - Erreur creation tables [!TS!] - RC=!RC!
    exit /b !RC!
)

if "!HAS_ERROR!"=="1" (
    if "!RC!"=="0" set "RC=20"
    echo FIN AVEC ERREURS [!TS!] - RC=!RC!
    if exist "!GLOBAL_ERR_LOG!" echo Consulter : !GLOBAL_ERR_LOG!
    exit /b !RC!
)

echo FIN NORMALE DU JOB [!TS!] - RC=0
exit /b 0

REM =====================================================================
REM === SOUS-ROUTINE ZIP ===============================================
REM =====================================================================
:ZIP_SEPARES
echo Creation des ZIP separes (VALIDES et ERREURS)...

set "ZIP_VALIDES=%ARCHIVE_DIR%\ECART_JUSTIF_VALIDES_%TS%.zip"
set "ZIP_ERR=%ARCHIVE_DIR%\ECART_JUSTIF_ERREURS_%TS%.zip"

set "HAS_VALIDES=0"
set "HAS_ERR=0"

if exist "%ARCHIVE_DIR%\*_%TS%.csv" set "HAS_VALIDES=1"
if exist "%ERREUR_DIR%\*.*"         set "HAS_ERR=1"

if "!HAS_VALIDES!"=="1" (
    powershell -NoLogo -NoProfile -Command ^
        "Compress-Archive -Path '%ARCHIVE_DIR%\*_%TS%.csv' -DestinationPath '%ZIP_VALIDES%' -Force"
    del /q "%ARCHIVE_DIR%\*_%TS%.csv" >nul 2>&1
    echo   ZIP VALIDES cree
)

if "!HAS_ERR!"=="1" (
    powershell -NoLogo -NoProfile -Command ^
        "Compress-Archive -Path '%ERREUR_DIR%\*' -DestinationPath '%ZIP_ERR%' -Force"
    del /q "%ERREUR_DIR%\*.*" >nul 2>&1
    echo   ZIP ERREURS cree
)

exit /b