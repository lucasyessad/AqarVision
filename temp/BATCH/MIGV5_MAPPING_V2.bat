@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM -------------------------------------------------------------------------------
REM SCHEDULE   : MIGV5BI1                           JOB : MIGV5_MAPPING_V2
REM TITRE      : CHARGEMENT DU MAPPING PARAM V4/V5
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
set "CSV_FILE=PARAM_MAPPING_V4_V5.csv"

set "SCRIPT_DIR=\\kenya\dsi\exploit\proclib\migv5lig"
set "SQL_CREATE=%SCRIPT_DIR%\mapping_0_create_all_tables.sql"
set "SQL_LOAD=%SCRIPT_DIR%\mapping_1_load_tmp.sql"
set "SQL_EXTRACT=%SCRIPT_DIR%\mapping_2_extraction_rejets.sql"
set "SQL_INTEG=%SCRIPT_DIR%\mapping_3_integrate_final.sql"

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

set "GLOBAL_ERR_LOG=%ERREUR_DIR%\MAPPING_ERRORS_!TS!.log"
set "FILE_LOG=%ERREUR_DIR%\MAPPING_%CSV_FILE:~0,-4%_LOAD_!TS!.log"
set "INTEG_LOG=%ERREUR_DIR%\MAPPING_%CSV_FILE:~0,-4%_INTEG_!TS!.log"
set "TMP_REJET=%ERREUR_DIR%\MAPPING_REJETS_%TS%.csv"

if exist "!GLOBAL_ERR_LOG!" del "!GLOBAL_ERR_LOG!" >nul 2>&1

echo ================================================================
echo TRAITEMENT MAPPING V4/V5 - [!TS!]
echo ================================================================

REM =====================================================================
REM ETAPE 1 - CONTROLE DU FICHIER SOURCE
REM =====================================================================
echo [ETAPE 1/5] Controle fichier source...

if not exist "%SOURCE_DIR%\%CSV_FILE%" (
    echo   KO - Fichier introuvable
    set "RC=10"
    goto FIN
)

echo   OK - Fichier trouve : %CSV_FILE%

REM =====================================================================
REM CONVERSION ANSI
REM =====================================================================
echo [CONV] Conversion ANSI du fichier...

REM Detecte BOM UTF-8 (EF BB BF) -> decode UTF-8 ; sinon lit en ANSI 1252. Reecrit en ANSI 1252.
powershell -NoLogo -NoProfile -Command "$p='%SOURCE_DIR%\%CSV_FILE%'; $b=[IO.File]::ReadAllBytes($p); if($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF){$c=[Text.Encoding]::UTF8.GetString($b,3,$b.Length-3)}else{$c=[Text.Encoding]::GetEncoding(1252).GetString($b)}; [IO.File]::WriteAllText($p,$c,[Text.Encoding]::GetEncoding(1252))"

if errorlevel 1 (
    echo   KO - Echec conversion ANSI
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR CONVERSION ANSI : %CSV_FILE%
    goto FIN
)

echo   OK - Fichier converti en ANSI

REM =====================================================================
REM ETAPE 2 - CREATION / VERIFICATION DES TABLES
REM =====================================================================
echo [ETAPE 2/5] Creation / Verification des tables...

sqlcmd -S %Server% -d %DataBase% -E -l 30 -i "%SQL_CREATE%"
if errorlevel 1 (
    echo   KO - Erreur creation / verification tables
    set "RC=11"
    goto FIN
)

echo   OK - Tables pretes

REM =====================================================================
REM ETAPE 3 - CHARGEMENT TMP
REM =====================================================================
echo [ETAPE 3/5] Chargement TMP...

if exist "!FILE_LOG!" del "!FILE_LOG!" >nul 2>&1

sqlcmd -S %Server% -d %DataBase% -E -l 30 ^
    -v CSVFILE="%SOURCE_DIR%\%CSV_FILE%" ^
    -i "%SQL_LOAD%" -o "!FILE_LOG!" 2>&1

if errorlevel 1 (
    echo   KO - Erreur chargement TMP
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR CHARGEMENT : %CSV_FILE%
    goto FIN
)

findstr /I /C:"Msg " /C:"Level " /C:"Incorrect" /C:"Cannot" /C:"Error" "!FILE_LOG!" >nul 2>&1
if not errorlevel 1 (
    echo   KO - Erreur SQL detectee dans le log de chargement
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR SQL CHARGEMENT : %CSV_FILE%
    goto FIN
)

echo   OK - TMP chargee

REM =====================================================================
REM ETAPE 4 - EXTRACTION DES REJETS
REM =====================================================================
echo [ETAPE 4/5] Extraction des rejets (NULL + doublons)...

if exist "!TMP_REJET!" del "!TMP_REJET!" >nul 2>&1

sqlcmd -S %Server% -d %DataBase% -E -l 30 ^
    -i "%SQL_EXTRACT%" ^
    -s ";" -W -h -1 ^
    -o "!TMP_REJET!" 2>> "!FILE_LOG!"

if errorlevel 1 (
    echo   KO - Erreur technique extraction rejets
    set "HAS_ERROR=1"
    set "RC=21"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR EXTRACTION REJETS : %CSV_FILE%
    goto FIN
)

set "NB_REJETS=0"

for /f "usebackq tokens=* delims=" %%L in (`findstr /V /I /C:"rows affected" "!TMP_REJET!"`) do (
    set "LINE=%%L"
    if not "!LINE!"=="" set /a NB_REJETS+=1
)

if "!NB_REJETS!"=="0" (
    echo   OK - Aucun rejet detecte
    del "!TMP_REJET!" >nul 2>&1
    goto ETAPE_5
)

echo   KO - !NB_REJETS! rejet(s) detecte(s) dans %CSV_FILE%
set "HAS_ERROR=1"
>> "!GLOBAL_ERR_LOG!" echo REJETS [!NB_REJETS!] : %CSV_FILE%
goto FIN

REM =====================================================================
REM ETAPE 5 - INTEGRATION FINALE
REM =====================================================================
:ETAPE_5
echo [ETAPE 5/5] Integration finale...

sqlcmd -S %Server% -d %DataBase% -E -l 30 ^
    -i "%SQL_INTEG%" -o "!INTEG_LOG!" 2>&1

if errorlevel 1 (
    echo   KO - Erreur integration finale
    set "HAS_ERROR=1"
    if "!RC!"=="0" set "RC=22"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR INTEGRATION : %CSV_FILE%
    goto FIN
)

findstr /I /C:"Msg " /C:"Level " /C:"Incorrect" /C:"Cannot" /C:"Error" "!INTEG_LOG!" >nul 2>&1
if not errorlevel 1 (
    echo   KO - Erreur SQL detectee dans le log d'integration
    set "HAS_ERROR=1"
    if "!RC!"=="0" set "RC=22"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR SQL INTEGRATION : %CSV_FILE%
    goto FIN
)

echo   OK - Integration terminee

REM =====================================================================
REM REFERENTIEL + ARCHIVAGE (specifique MAPPING)
REM =====================================================================
set "ARCHIVE_NAME=%CSV_FILE:~0,-4%_!TS!.csv"

copy "%SOURCE_DIR%\%CSV_FILE%" "%REF_DIR%\%CSV_FILE%" /Y >nul
move "%SOURCE_DIR%\%CSV_FILE%" "%ARCHIVE_DIR%\!ARCHIVE_NAME!" /Y >nul

if errorlevel 1 (
    echo   KO - Erreur archivage du fichier %CSV_FILE%
    set "HAS_ERROR=1"
    >> "!GLOBAL_ERR_LOG!" echo ERREUR ARCHIVAGE : %CSV_FILE%
    goto FIN
)

echo   OK - Referentiel mis a jour et fichier archive : !ARCHIVE_NAME!

REM =====================================================================
REM FIN
REM =====================================================================
:FIN

REM Nettoyage logs vides
for %%L in ("%ERREUR_DIR%\*.log") do (
    if %%~zL==0 del "%%L" >nul 2>&1
)

call :ZIP_SEPARES

echo ================================================================
if "!RC!"=="10" (
    echo FIN - Fichier introuvable [!TS!] - RC=!RC!
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

set "ZIP_VALIDES=%ARCHIVE_DIR%\MAPPING_VALIDES_%TS%.zip"
set "ZIP_ERR=%ARCHIVE_DIR%\MAPPING_ERREURS_%TS%.zip"

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
