#!/usr/bin/env python3
"""
Database Migration Script - operaciones_tqw
Migrates complete database from remote server to local VPS
Run from local Windows machine
"""

import pymysql
import sys
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

# Source Database Configuration
SOURCE_CONFIG = {
    'host': '170.239.85.233',
    'port': 3306,
    'user': 'ncornejo',
    'password': 'N1c0l7as17',
    'database': 'operaciones_tqw',
    'charset': 'utf8mb4'
}

# Target Database Configuration (local on VPS)
TARGET_CONFIG = {
    'host': 'localhost',
    'port': 3306,  # Local MySQL on VPS
    'user': 'ncornejo',
    'password': 'RRuiJ3t+Xax5iflP1tI5nQ==',
    'database': 'operaciones_tqw_bkp',
    'charset': 'utf8mb4'
}

class DatabaseMigration:
    def __init__(self):
        self.source_conn = None
        self.target_conn = None
        self.migration_stats = {
            'tables_migrated': 0,
            'rows_migrated': 0,
            'views_migrated': 0,
            'procedures_migrated': 0,
            'triggers_migrated': 0,
            'skipped_tables': 0,
            'errors': []
        }
        
    def connect_databases(self):
        """Connect to source and target databases"""
        try:
            logging.info("Connecting to source database...")
            self.source_conn = pymysql.connect(**SOURCE_CONFIG)
            logging.info("✓ Connected to source database")
            
            logging.info("Connecting to target database...")
            self.target_conn = pymysql.connect(**TARGET_CONFIG)
            logging.info("✓ Connected to target database")
            
            return True
        except Exception as e:
            logging.error(f"Connection failed: {e}")
            return False
    
    def get_tables(self):
        """Get list of all tables from source database"""
        cursor = self.source_conn.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = %s AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """, (SOURCE_CONFIG['database'],))
        tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        return tables
    
    def get_table_create_statement(self, table_name):
        """Get CREATE TABLE statement"""
        cursor = self.source_conn.cursor()
        cursor.execute(f"SHOW CREATE TABLE `{table_name}`")
        create_stmt = cursor.fetchone()[1]
        cursor.close()
        return create_stmt
    
    def create_table(self, table_name, create_stmt):
        """Create table in target database"""
        cursor = self.target_conn.cursor()
        try:
            cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")
            cursor.execute(create_stmt)
            self.target_conn.commit()
            return True
        except Exception as e:
            logging.error(f"Error creating table {table_name}: {e}")
            self.migration_stats['errors'].append(f"Table {table_name}: {e}")
            return False
        finally:
            cursor.close()
    
    def get_row_count(self, table_name):
        """Get row count for a table"""
        cursor = self.source_conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM `{table_name}`")
        count = cursor.fetchone()[0]
        cursor.close()
        return count
    
    def migrate_table_data(self, table_name):
        """Migrate data from source to target table"""
        try:
            row_count = self.get_row_count(table_name)
            
            if row_count == 0:
                logging.info(f"  {table_name}: Empty table, skipping data migration")
                return True
            
            # Skip large tables (more than 50,000 rows)
            if row_count > 50000:
                logging.warning(f"  {table_name}: SKIPPED - Table too large ({row_count:,} rows > 50,000)")
                self.migration_stats['errors'].append(f"SKIPPED (large table): {table_name} ({row_count:,} rows)")
                return False
            
            logging.info(f"  {table_name}: Migrating {row_count:,} rows...")
            
            # Fetch data in batches
            batch_size = 1000
            source_cursor = self.source_conn.cursor()
            target_cursor = self.target_conn.cursor()
            
            source_cursor.execute(f"SELECT * FROM `{table_name}`")
            
            # Get column names
            columns = [desc[0] for desc in source_cursor.description]
            placeholders = ', '.join(['%s'] * len(columns))
            insert_query = f"INSERT INTO `{table_name}` ({', '.join([f'`{c}`' for c in columns])}) VALUES ({placeholders})"
            
            rows_migrated = 0
            batch = []
            
            for row in source_cursor:
                batch.append(row)
                
                if len(batch) >= batch_size:
                    target_cursor.executemany(insert_query, batch)
                    self.target_conn.commit()
                    rows_migrated += len(batch)
                    logging.info(f"    Progress: {rows_migrated:,}/{row_count:,} rows ({rows_migrated*100//row_count}%)")
                    batch = []
            
            # Insert remaining rows
            if batch:
                target_cursor.executemany(insert_query, batch)
                self.target_conn.commit()
                rows_migrated += len(batch)
            
            source_cursor.close()
            target_cursor.close()
            
            self.migration_stats['rows_migrated'] += rows_migrated
            logging.info(f"  ✓ {table_name}: {rows_migrated:,} rows migrated")
            return True
            
        except Exception as e:
            logging.error(f"  ✗ Error migrating {table_name}: {e}")
            self.migration_stats['errors'].append(f"Data migration {table_name}: {e}")
            return False
    
    def migrate_tables(self):
        """Migrate all tables"""
        logging.info("\n=== PHASE 1: MIGRATING TABLES ===")
        tables = self.get_tables()
        total_tables = len(tables)
        
        logging.info(f"Found {total_tables} tables to migrate\n")
        
        for idx, table_name in enumerate(tables, 1):
            logging.info(f"[{idx}/{total_tables}] Processing table: {table_name}")
            
            # Create table structure
            create_stmt = self.get_table_create_statement(table_name)
            if not self.create_table(table_name, create_stmt):
                continue
            
            # Migrate data
            result = self.migrate_table_data(table_name)
            if result:
                self.migration_stats['tables_migrated'] += 1
            else:
                # Check if it was skipped due to size
                if any(f"SKIPPED (large table): {table_name}" in err for err in self.migration_stats['errors']):
                    self.migration_stats['skipped_tables'] += 1
            
            logging.info("")
    
    def migrate_views(self):
        """Migrate all views"""
        logging.info("\n=== PHASE 2: MIGRATING VIEWS ===")
        cursor = self.source_conn.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = %s
            ORDER BY table_name
        """, (SOURCE_CONFIG['database'],))
        
        views = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        logging.info(f"Found {len(views)} views to migrate\n")
        
        for view_name in views:
            try:
                cursor = self.source_conn.cursor()
                cursor.execute(f"SHOW CREATE VIEW `{view_name}`")
                create_stmt = cursor.fetchone()[1]
                cursor.close()
                
                target_cursor = self.target_conn.cursor()
                target_cursor.execute(f"DROP VIEW IF EXISTS `{view_name}`")
                target_cursor.execute(create_stmt)
                self.target_conn.commit()
                target_cursor.close()
                
                self.migration_stats['views_migrated'] += 1
                logging.info(f"  ✓ View migrated: {view_name}")
            except Exception as e:
                logging.error(f"  ✗ Error migrating view {view_name}: {e}")
                self.migration_stats['errors'].append(f"View {view_name}: {e}")
    
    def migrate_procedures(self):
        """Migrate all stored procedures"""
        logging.info("\n=== PHASE 3: MIGRATING STORED PROCEDURES ===")
        cursor = self.source_conn.cursor()
        cursor.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = %s AND routine_type = 'PROCEDURE'
            ORDER BY routine_name
        """, (SOURCE_CONFIG['database'],))
        
        procedures = [row[0] for row in cursor.fetchall()]
        cursor.close()
        
        logging.info(f"Found {len(procedures)} stored procedures to migrate\n")
        
        for proc_name in procedures:
            try:
                cursor = self.source_conn.cursor()
                cursor.execute(f"SHOW CREATE PROCEDURE `{proc_name}`")
                create_stmt = cursor.fetchone()[2]
                cursor.close()
                
                target_cursor = self.target_conn.cursor()
                target_cursor.execute(f"DROP PROCEDURE IF EXISTS `{proc_name}`")
                target_cursor.execute(create_stmt)
                self.target_conn.commit()
                target_cursor.close()
                
                self.migration_stats['procedures_migrated'] += 1
                logging.info(f"  ✓ Procedure migrated: {proc_name}")
            except Exception as e:
                logging.error(f"  ✗ Error migrating procedure {proc_name}: {e}")
                self.migration_stats['errors'].append(f"Procedure {proc_name}: {e}")
    
    def migrate_triggers(self):
        """Migrate all triggers"""
        logging.info("\n=== PHASE 4: MIGRATING TRIGGERS ===")
        cursor = self.source_conn.cursor()
        cursor.execute("""
            SELECT trigger_name, event_object_table
            FROM information_schema.triggers 
            WHERE trigger_schema = %s
            ORDER BY trigger_name
        """, (SOURCE_CONFIG['database'],))
        
        triggers = cursor.fetchall()
        cursor.close()
        
        logging.info(f"Found {len(triggers)} triggers to migrate\n")
        
        for trigger_name, table_name in triggers:
            try:
                cursor = self.source_conn.cursor()
                cursor.execute(f"SHOW CREATE TRIGGER `{trigger_name}`")
                create_stmt = cursor.fetchone()[2]
                cursor.close()
                
                target_cursor = self.target_conn.cursor()
                target_cursor.execute(f"DROP TRIGGER IF EXISTS `{trigger_name}`")
                target_cursor.execute(create_stmt)
                self.target_conn.commit()
                target_cursor.close()
                
                self.migration_stats['triggers_migrated'] += 1
                logging.info(f"  ✓ Trigger migrated: {trigger_name} (on {table_name})")
            except Exception as e:
                logging.error(f"  ✗ Error migrating trigger {trigger_name}: {e}")
                self.migration_stats['errors'].append(f"Trigger {trigger_name}: {e}")
    
    def print_summary(self):
        """Print migration summary"""
        logging.info("\n" + "="*60)
        logging.info("MIGRATION SUMMARY")
        logging.info("="*60)
        logging.info(f"Tables migrated:     {self.migration_stats['tables_migrated']}")
        logging.info(f"Tables skipped:      {self.migration_stats['skipped_tables']} (large tables > 50K rows)")
        logging.info(f"Rows migrated:       {self.migration_stats['rows_migrated']:,}")
        logging.info(f"Views migrated:      {self.migration_stats['views_migrated']}")
        logging.info(f"Procedures migrated: {self.migration_stats['procedures_migrated']}")
        logging.info(f"Triggers migrated:   {self.migration_stats['triggers_migrated']}")
        logging.info(f"Errors encountered:  {len(self.migration_stats['errors'])}")
        
        if self.migration_stats['errors']:
            logging.info("\nErrors/Warnings:")
            for error in self.migration_stats['errors']:
                logging.info(f"  - {error}")
        
        logging.info("="*60)
    
    def close_connections(self):
        """Close database connections"""
        if self.source_conn:
            self.source_conn.close()
            logging.info("Source connection closed")
        if self.target_conn:
            self.target_conn.close()
            logging.info("Target connection closed")
    
    def run(self):
        """Run complete migration"""
        start_time = time.time()
        
        logging.info("="*60)
        logging.info("DATABASE MIGRATION - operaciones_tqw")
        logging.info("="*60)
        logging.info(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info(f"Source: {SOURCE_CONFIG['host']}:{SOURCE_CONFIG['port']}/{SOURCE_CONFIG['database']}")
        logging.info(f"Target: {TARGET_CONFIG['host']}:{TARGET_CONFIG['port']}/{TARGET_CONFIG['database']}")
        logging.info("="*60 + "\n")
        
        if not self.connect_databases():
            logging.error("Failed to connect to databases. Exiting.")
            return False
        
        try:
            self.migrate_tables()
            self.migrate_views()
            self.migrate_procedures()
            self.migrate_triggers()
            
            elapsed_time = time.time() - start_time
            logging.info(f"\nTotal migration time: {elapsed_time/60:.2f} minutes")
            
            self.print_summary()
            
            return True
            
        except Exception as e:
            logging.error(f"Migration failed: {e}")
            return False
        finally:
            self.close_connections()

if __name__ == "__main__":
    migration = DatabaseMigration()
    success = migration.run()
    
    sys.exit(0 if success else 1)
