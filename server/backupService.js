// Automatic backup service for local database
// BACKUPS STORED ON D DRIVE FOR SAFETY
const { dbOperations } = require('./database');
const fs = require('fs');
const path = require('path');

// ⚠️ IMPORTANT: Backups stored on D drive to prevent data loss if C drive corrupts
// Default location: D:\ShahJePizza\backups\

const customPath = process.env.DATABASE_PATH || 'D:\\ShahJePizza';
let backupDir;

try {
  // Try to use D drive first
  backupDir = path.join(customPath, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  console.log(`✅ Backups will be stored on D drive: ${backupDir}`);
} catch (error) {
  // Fallback to project directory if D drive not accessible
  console.warn('⚠️ D drive not accessible for backups, using project directory');
  backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

class BackupService {
  constructor() {
    this.intervalId = null;
  }

  start() {
    console.log('Backup service started');
    
    // Check immediately on start
    this.checkAndBackup();
    
    // Then check every hour
    this.intervalId = setInterval(() => {
      this.checkAndBackup();
    }, 60 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Backup service stopped');
    }
  }

  checkAndBackup() {
    try {
      const autoBackupEnabled = dbOperations.getSetting('auto_backup_enabled');
      
      if (autoBackupEnabled !== 'true') {
        return;
      }

      const lastBackupDate = dbOperations.getSetting('last_backup_date');
      const now = new Date();
      
      let shouldBackup = false;

      if (!lastBackupDate) {
        shouldBackup = true;
      } else {
        const lastBackup = new Date(lastBackupDate);
        const timeSinceLastBackup = now.getTime() - lastBackup.getTime();
        
        if (timeSinceLastBackup >= BACKUP_INTERVAL_MS) {
          shouldBackup = true;
        }
      }

      if (shouldBackup) {
        this.performAutoBackup();
      }
    } catch (error) {
      console.error('Auto backup check failed:', error);
    }
  }

  performAutoBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `auto-backup-${timestamp}.json`;
      const filePath = path.join(backupDir, filename);

      const backupData = dbOperations.exportData();
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      dbOperations.setSetting('last_backup_date', new Date().toISOString());
      dbOperations.addBackupLog('auto', true, filePath);

      console.log(`Auto backup created: ${filePath}`);
      
      // Clean old backups (keep last 30 days)
      this.cleanOldBackups(30);
    } catch (error) {
      console.error('Auto backup failed:', error);
      dbOperations.addBackupLog('auto', false, '');
    }
  }

  performManualBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `manual-backup-${timestamp}.json`;
      const filePath = path.join(backupDir, filename);

      const backupData = dbOperations.exportData();
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      dbOperations.setSetting('last_backup_date', new Date().toISOString());
      dbOperations.addBackupLog('manual', true, filePath);

      console.log(`Manual backup created: ${filePath}`);

      return { success: true, filePath, filename };
    } catch (error) {
      console.error('Manual backup failed:', error);
      dbOperations.addBackupLog('manual', false, '');
      return { success: false, error: error.message };
    }
  }

  restoreFromBackup(backupFilePath) {
    try {
      const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
      dbOperations.importData(backupData);
      
      console.log(`Database restored from: ${backupFilePath}`);
      return { success: true };
    } catch (error) {
      console.error('Restore failed:', error);
      return { success: false, error: error.message };
    }
  }

  cleanOldBackups(daysToKeep) {
    try {
      const files = fs.readdirSync(backupDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith('auto-backup-')) {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          const age = now - stats.mtime.getTime();

          if (age > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`Deleted old backup: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clean old backups:', error);
    }
  }

  listBackups() {
    try {
      const files = fs.readdirSync(backupDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const filePath = path.join(backupDir, f);
          const stats = fs.statSync(filePath);
          return {
            filename: f,
            path: filePath,
            size: stats.size,
            created: stats.mtime,
            type: f.startsWith('auto-') ? 'auto' : 'manual'
          };
        })
        .sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }
}

module.exports = new BackupService();
