#!/usr/bin/env python3
"""
Production Sync Utility for Custom Video Player (CYP)
Copies only necessary runtime, source, test, and documentation files to the production directory.
Preserves existing .git repositories and ignores development bloat.
"""

import sys
import shutil
from pathlib import Path

# Paths
DEFAULT_SOURCE = Path(__file__).parent.resolve()
DEFAULT_DEST = Path(r"D:\Github\Custom-Video-Player-CYP")

# Allow command-line override: python copy-to-production.py [dest_path]
DEST_DIR = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_DEST
SOURCE_DIR = DEFAULT_SOURCE

REQUIRED_ROOT_FILES = [
    "index.html",
    "favicon.ico",
    "favicon.svg",
    "apple-touch-icon.png",
    "og-image.png",
    "og-image.svg",
    "copy-to-production.cmd",
    "copy-to-production.py",
    "package.json",
    "package-lock.json",
    "index.d.ts",
    "vite.config.js",
    "vite.config.demo.js",
    "README.md",
    "SECURITY.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "AUDIT_REPORT.md",
    "LICENSE",
    ".gitignore",
]

REQUIRED_DIRECTORIES = [
    "src",
    "styles",
    "dist",
    "demo",
    "tests",
    "public",
    "scripts",
    "docs",
    ".github",
]

IGNORE_PATTERNS = [
    "*.log",
    "Thumbs.db",
    ".DS_Store",
    "__pycache__",
    "*.pyc",
]


def should_ignore(path: Path) -> bool:
    for pattern in IGNORE_PATTERNS:
        if path.match(pattern):
            return True
    return False


def sync_directory(src_dir: Path, dest_dir: Path) -> int:
    """Synchronizes a directory, removing stale files and preserving destination structure."""
    copied_count = 0
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Copy files from src to dest
    for item in src_dir.rglob("*"):
        if item.is_dir():
            continue
        if should_ignore(item):
            continue

        rel_path = item.relative_to(src_dir)
        target_file = dest_dir / rel_path
        target_file.parent.mkdir(parents=True, exist_ok=True)

        # Only copy if missing or modified
        if not target_file.exists() or item.stat().st_mtime > target_file.stat().st_mtime or item.stat().st_size != target_file.stat().st_size:
            shutil.copy2(item, target_file)
            copied_count += 1

    # Remove stale files in destination that no longer exist in source
    for item in dest_dir.rglob("*"):
        if item.is_dir():
            continue
        rel_path = item.relative_to(dest_dir)
        source_counterpart = src_dir / rel_path
        if not source_counterpart.exists():
            item.unlink(missing_ok=True)

    return copied_count


def main():
    print("=" * 70)
    print("  Custom Video Player (CYP) - Production Directory Sync")
    print(f"  Source:      {SOURCE_DIR}")
    print(f"  Destination: {DEST_DIR}")
    print("=" * 70)

    if not SOURCE_DIR.exists():
        print(f"[ERROR] Source directory does not exist: {SOURCE_DIR}")
        sys.exit(1)

    DEST_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Sync Root Files
    print("\n[1/3] Copying Root Configuration & Documentation Files...")
    root_copied = 0
    for filename in REQUIRED_ROOT_FILES:
        src_file = SOURCE_DIR / filename
        dest_file = DEST_DIR / filename

        if src_file.exists():
            shutil.copy2(src_file, dest_file)
            print(f"  [OK] Copied {filename}")
            root_copied += 1
        else:
            print(f"  [SKIP] {filename} not found in source")

    # 2. Sync Directories
    print("\n[2/3] Synchronizing Production Directories...")
    total_dir_files = 0
    for dirname in REQUIRED_DIRECTORIES:
        src_path = SOURCE_DIR / dirname
        dest_path = DEST_DIR / dirname

        if src_path.exists():
            count = sync_directory(src_path, dest_path)
            total_dir_files += count
            print(f"  [OK] Synced {dirname}/ ({count} files updated/verified)")
        else:
            print(f"  [SKIP] Directory {dirname}/ not found in source")

    # 3. Verification & Safety Check
    print("\n[3/3] Verifying Target Integrity...")
    git_dir = DEST_DIR / ".git"
    if git_dir.exists():
        print("  [OK] Destination Git repository preserved (.git intact).")
    else:
        print("  [INFO] Destination directory does not contain .git yet.")

    dist_file = DEST_DIR / "dist" / "player.es.js"
    pkg_file = DEST_DIR / "package.json"

    if pkg_file.exists() and dist_file.exists():
        print("  [OK] Production build files and package manifest confirmed.")
    else:
        print("  [WARN] Missing expected output files in destination.")

    print("\n" + "=" * 70)
    print(f"  Sync Successful! Destination is up to date: {DEST_DIR}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
