# Database Migration - Quick Start Guide

## Prerequisites

1. **Install Python package** (if not already installed):
   ```bash
   pip install pymysql
   ```

2. **Create SSH tunnel to VPS**:
   ```bash
   ssh -L 3307:localhost:3306 telqway
   ```
   
   Leave this terminal open during the entire migration process.

## Migration Steps

### Step 1: Run Migration Script

In a new terminal (keep SSH tunnel running):

```bash
cd C:\Users\pc\Documents\GitHub\AppTQW
python scripts\migrate_database.py
```

The script will:
- Connect to both databases
- Migrate 256 tables with data
- Migrate 13 views
- Migrate 13 stored procedures
- Migrate 7 triggers
- Show progress for each table
- Generate `migration.log` file

**Estimated time**: 15-30 minutes

### Step 2: Verify Migration

After migration completes:

```bash
python scripts\verify_migration.py
```

This will verify:
- Table counts match
- Row counts match for all tables
- All views migrated
- All stored procedures migrated
- All triggers migrated
- Generate `verification.log` file

## What the Scripts Do

### migrate_database.py
- Connects to source DB (170.239.85.233) and target DB (VPS via tunnel)
- Migrates tables in 4 phases:
  1. Tables (structure + data)
  2. Views
  3. Stored Procedures
  4. Triggers
- Shows real-time progress
- Handles large tables in batches (1000 rows at a time)
- Logs everything to `migration.log`

### verify_migration.py
- Compares source and target databases
- Checks all object counts
- Verifies row counts for every table
- Reports any discrepancies
- Logs results to `verification.log`

## Important Notes

- ✅ Source database is **read-only** - no changes made
- ✅ Target database will be **overwritten** (DROP/CREATE tables)
- ✅ SSH tunnel must stay open during entire process
- ✅ Both scripts can be re-run if needed
- ✅ Detailed logs saved for troubleshooting

## Troubleshooting

**If migration fails:**
1. Check `migration.log` for errors
2. Verify SSH tunnel is still active
3. Verify both database credentials
4. Re-run the migration script (it will start fresh)

**If verification finds issues:**
1. Check `verification.log` for details
2. Re-run migration for specific tables if needed
3. Contact for assistance if persistent issues

## After Successful Migration

Once verification passes:
- You have a complete backup of `operaciones_tqw` in your VPS
- Database is at `localhost:3306/operaciones_tqw_bkp`
- User: `ncornejo`
- Password: `RRuiJ3t+Xax5iflP1tI5nQ==`
