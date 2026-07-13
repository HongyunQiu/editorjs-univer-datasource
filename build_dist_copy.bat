@echo off
setlocal enabledelayedexpansion

echo Building editorjs-univer-datasource...

if not exist "node_modules\vite" (
    echo vite dependency not found. Running npm install...
    call npm install
    set INSTALL_RESULT=!ERRORLEVEL!
    if !INSTALL_RESULT! NEQ 0 (
        echo npm install failed with code !INSTALL_RESULT!
        exit /b !INSTALL_RESULT!
    )
)

call npm run build
set BUILD_RESULT=!ERRORLEVEL!

echo.
echo Build finished with code !BUILD_RESULT!

if !BUILD_RESULT! NEQ 0 (
    echo Build failed with code !BUILD_RESULT!
    exit /b !BUILD_RESULT!
)

if not exist "dist\univerDatasource.umd.js" (
    echo Missing file: dist\univerDatasource.umd.js
    exit /b 1
)

if not exist "dist\univerDatasource.mjs" (
    echo Missing file: dist\univerDatasource.mjs
    exit /b 1
)

if not exist "..\..\QNotes\public\vendor\editorjs-univer-datasource" (
    echo Creating target directory...
    mkdir "..\..\QNotes\public\vendor\editorjs-univer-datasource"
    set MKDIR_RESULT=!ERRORLEVEL!
    if !MKDIR_RESULT! NEQ 0 (
        echo Failed to create target directory. Code !MKDIR_RESULT!
        exit /b !MKDIR_RESULT!
    )
)

echo Copying dist files...
copy /Y "dist\univerDatasource.umd.js" "..\..\QNotes\public\vendor\editorjs-univer-datasource\univerDatasource.umd.js" >nul
set COPY_UMD_RESULT=!ERRORLEVEL!
if !COPY_UMD_RESULT! NEQ 0 (
    echo Failed to copy univerDatasource.umd.js. Code !COPY_UMD_RESULT!
    exit /b !COPY_UMD_RESULT!
)

copy /Y "dist\univerDatasource.mjs" "..\..\QNotes\public\vendor\editorjs-univer-datasource\univerDatasource.mjs" >nul
set COPY_MJS_RESULT=!ERRORLEVEL!
if !COPY_MJS_RESULT! NEQ 0 (
    echo Failed to copy univerDatasource.mjs. Code !COPY_MJS_RESULT!
    exit /b !COPY_MJS_RESULT!
)

echo.
echo ========================================
echo editorjs-univer-datasource build and copy completed successfully.
echo ========================================

exit /b 0
