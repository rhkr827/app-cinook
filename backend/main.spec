# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['app/main.py'],
    pathex=['.'],
    binaries=[],
    datas=[('app', 'app'), ('../db', 'db')],
    hiddenimports=[
        'app.app',
        'uvicorn',
        'uvicorn.main',
        'uvicorn.server',
        'uvicorn.config',
        'uvicorn.importer',
        'fastapi',
        'fastapi.applications',
        'fastapi.middleware',
        'fastapi.middleware.cors',
        'pydantic',
        'pydantic.main',
        'pydantic.fields',
        'sqlite3',
        'logging',
        'traceback',
        'datetime'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'matplotlib',
        'numpy',
        'PIL',
        'pandas',
        'scipy',
        'test',
        'unittest',
        'doctest',
        'xml',
        'xmlrpc',
        'email',
        'html',
        'http.client',
        'urllib',
        'multiprocessing',
        'concurrent.futures'
    ],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='main',
)
