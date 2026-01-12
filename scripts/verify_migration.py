#!/usr/bin/env python3
"""
Verification Script - Database Migration
Verifies that migration was successful
Run from local Windows machine
"""

import pymysql
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('verification.log'),
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

# Target Database Configuration (via SSH tunnel)
TARGET_CONFIG = {
    'host': 'localhost',
    'port': 3307,
    'user': 'ncornejo',
    'password': 'RRuiJ3t+Xax5iflP1tI5nQ==',
    'database': 'operaciones_tqw_bkp',
    'charset': 'utf8mb4'
}

class MigrationVerification:
    def __init__(self):
        self.source_conn = None
        self.target_conn = None
        self.issues = []
        
    def connect_databases(self):
        """Connect to source and target databases"""
        try:
            self.source_conn = pymysql.connect(**SOURCE_CONFIG)
            self.target_conn = pymysql.connect(**TARGET_CONFIG)
            return True
        except Exception as e:
            logging.error(f"Connection failed: {e}")
            return False
    
    def verify_table_count(self):
        """Verify table counts match"""
        logging.info("\n=== VERIFYING TABLE COUNT ===")
        
        source_cursor = self.source_conn.cursor()
        source_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = %s AND table_type = 'BASE TABLE'
        """, (SOURCE_CONFIG['database'],))
        source_count = source_cursor.fetchone()[0]
        source_cursor.close()
        
        target_cursor = self.target_conn.cursor()
        target_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = %s AND table_type = 'BASE TABLE'
        """, (TARGET_CONFIG['database'],))
        target_count = target_cursor.fetchone()[0]
        target_cursor.close()
        
        if source_count == target_count:
            logging.info(f"✓ Table count matches: {source_count} tables")
            return True
        else:
            msg = f"✗ Table count mismatch: Source={source_count}, Target={target_count}"
            logging.error(msg)
            self.issues.append(msg)
            return False
    
    def verify_row_counts(self):
        """Verify row counts for all tables"""
        logging.info("\n=== VERIFYING ROW COUNTS ===")
        
        source_cursor = self.source_conn.cursor()
        source_cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = %s AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """, (SOURCE_CONFIG['database'],))
        tables = [row[0] for row in source_cursor.fetchall()]
        source_cursor.close()
        
        mismatches = []
        
        for table_name in tables:
            # Get source count
            source_cursor = self.source_conn.cursor()
            source_cursor.execute(f"SELECT COUNT(*) FROM `{table_name}`")
            source_count = source_cursor.fetchone()[0]
            source_cursor.close()
            
            # Get target count
            target_cursor = self.target_conn.cursor()
            try:
                target_cursor.execute(f"SELECT COUNT(*) FROM `{table_name}`")
                target_count = target_cursor.fetchone()[0]
            except:
                target_count = -1
            target_cursor.close()
            
            if source_count != target_count:
                msg = f"{table_name}: Source={source_count:,}, Target={target_count:,}"
                mismatches.append(msg)
                logging.warning(f"  ✗ {msg}")
            else:
                logging.info(f"  ✓ {table_name}: {source_count:,} rows")
        
        if mismatches:
            logging.error(f"\n✗ Found {len(mismatches)} tables with row count mismatches")
            self.issues.extend(mismatches)
            return False
        else:
            logging.info(f"\n✓ All {len(tables)} tables have matching row counts")
            return True
    
    def verify_views(self):
        """Verify views"""
        logging.info("\n=== VERIFYING VIEWS ===")
        
        source_cursor = self.source_conn.cursor()
        source_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.views 
            WHERE table_schema = %s
        """, (SOURCE_CONFIG['database'],))
        source_count = source_cursor.fetchone()[0]
        source_cursor.close()
        
        target_cursor = self.target_conn.cursor()
        target_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.views 
            WHERE table_schema = %s
        """, (TARGET_CONFIG['database'],))
        target_count = target_cursor.fetchone()[0]
        target_cursor.close()
        
        if source_count == target_count:
            logging.info(f"✓ View count matches: {source_count} views")
            return True
        else:
            msg = f"✗ View count mismatch: Source={source_count}, Target={target_count}"
            logging.error(msg)
            self.issues.append(msg)
            return False
    
    def verify_procedures(self):
        """Verify stored procedures"""
        logging.info("\n=== VERIFYING STORED PROCEDURES ===")
        
        source_cursor = self.source_conn.cursor()
        source_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.routines 
            WHERE routine_schema = %s AND routine_type = 'PROCEDURE'
        """, (SOURCE_CONFIG['database'],))
        source_count = source_cursor.fetchone()[0]
        source_cursor.close()
        
        target_cursor = self.target_conn.cursor()
        target_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.routines 
            WHERE routine_schema = %s AND routine_type = 'PROCEDURE'
        """, (TARGET_CONFIG['database'],))
        target_count = target_cursor.fetchone()[0]
        target_cursor.close()
        
        if source_count == target_count:
            logging.info(f"✓ Stored procedure count matches: {source_count} procedures")
            return True
        else:
            msg = f"✗ Procedure count mismatch: Source={source_count}, Target={target_count}"
            logging.error(msg)
            self.issues.append(msg)
            return False
    
    def verify_triggers(self):
        """Verify triggers"""
        logging.info("\n=== VERIFYING TRIGGERS ===")
        
        source_cursor = self.source_conn.cursor()
        source_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.triggers 
            WHERE trigger_schema = %s
        """, (SOURCE_CONFIG['database'],))
        source_count = source_cursor.fetchone()[0]
        source_cursor.close()
        
        target_cursor = self.target_conn.cursor()
        target_cursor.execute("""
            SELECT COUNT(*) FROM information_schema.triggers 
            WHERE trigger_schema = %s
        """, (TARGET_CONFIG['database'],))
        target_count = target_cursor.fetchone()[0]
        target_cursor.close()
        
        if source_count == target_count:
            logging.info(f"✓ Trigger count matches: {source_count} triggers")
            return True
        else:
            msg = f"✗ Trigger count mismatch: Source={source_count}, Target={target_count}"
            logging.error(msg)
            self.issues.append(msg)
            return False
    
    def print_summary(self):
        """Print verification summary"""
        logging.info("\n" + "="*60)
        logging.info("VERIFICATION SUMMARY")
        logging.info("="*60)
        
        if not self.issues:
            logging.info("✓ ALL CHECKS PASSED - Migration successful!")
        else:
            logging.error(f"✗ Found {len(self.issues)} issues:")
            for issue in self.issues:
                logging.error(f"  - {issue}")
        
        logging.info("="*60)
    
    def close_connections(self):
        """Close database connections"""
        if self.source_conn:
            self.source_conn.close()
        if self.target_conn:
            self.target_conn.close()
    
    def run(self):
        """Run complete verification"""
        logging.info("="*60)
        logging.info("DATABASE MIGRATION VERIFICATION")
        logging.info("="*60 + "\n")
        
        if not self.connect_databases():
            logging.error("Failed to connect to databases. Exiting.")
            return False
        
        try:
            self.verify_table_count()
            self.verify_row_counts()
            self.verify_views()
            self.verify_procedures()
            self.verify_triggers()
            
            self.print_summary()
            
            return len(self.issues) == 0
            
        except Exception as e:
            logging.error(f"Verification failed: {e}")
            return False
        finally:
            self.close_connections()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("IMPORTANT: Make sure SSH tunnel is active:")
    print("  ssh -L 3307:localhost:3306 telqway")
    print("="*60 + "\n")
    
    verification = MigrationVerification()
    success = verification.run()
    
    sys.exit(0 if success else 1)
