// Automatic backup service for daily backups
import { localDB } from './localDatabase';

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const BACKUP_CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

export class BackupService {
  private checkInterval: number | null = null;

  start() {
    // Don't check immediately on start to prevent auto-download on every page load
    // Only check on the interval (every hour)
    this.checkInterval = window.setInterval(() => {
      this.checkAndBackup();
    }, BACKUP_CHECK_INTERVAL_MS);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkAndBackup() {
    try {
      const autoBackupEnabled = await localDB.getAutoBackupEnabled();
      
      if (!autoBackupEnabled) {
        return;
      }

      const lastBackupDate = await localDB.getLastBackupDate();
      const now = new Date();
      
      let shouldBackup = false;

      if (!lastBackupDate) {
        // No backup exists, create one
        shouldBackup = true;
      } else {
        const lastBackup = new Date(lastBackupDate);
        const timeSinceLastBackup = now.getTime() - lastBackup.getTime();
        
        // If more than 24 hours have passed
        if (timeSinceLastBackup >= BACKUP_INTERVAL_MS) {
          shouldBackup = true;
        }
      }

      if (shouldBackup) {
        await this.performAutoBackup();
      }
    } catch (error) {
      console.error('Auto backup check failed:', error);
    }
  }

  private async performAutoBackup() {
    try {
      const backupData = await localDB.exportAllData();
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `shah-je-pizza-backup-${timestamp}.json`;
      
      // Only download if user has explicitly enabled auto backup
      // This prevents unwanted downloads on every startup
      const autoBackupEnabled = await localDB.getAutoBackupEnabled();
      if (autoBackupEnabled) {
        this.downloadBackup(backupData, filename);
      }
      
      // Update last backup date
      await localDB.setLastBackupDate(new Date().toISOString());
      
      // Log successful backup
      await localDB.addBackupLog('auto', true);
      
      console.log('Auto backup completed successfully:', filename);
    } catch (error) {
      console.error('Auto backup failed:', error);
      await localDB.addBackupLog('auto', false);
    }
  }

  async performManualBackup(): Promise<void> {
    try {
      const backupData = await localDB.exportAllData();
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const filename = `pakistani-pizza-shop-manual-backup-${timestamp}.json`;
      
      // Download the backup file
      this.downloadBackup(backupData, filename);
      
      // Update last backup date
      await localDB.setLastBackupDate(new Date().toISOString());
      
      // Log successful backup
      await localDB.addBackupLog('manual', true);
      
      return Promise.resolve();
    } catch (error) {
      await localDB.addBackupLog('manual', false);
      throw error;
    }
  }

  private downloadBackup(data: string, filename: string) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async restoreFromBackup(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          await localDB.importData(content);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read backup file'));
      reader.readAsText(file);
    });
  }

  async toggleAutoBackup(enabled: boolean): Promise<void> {
    await localDB.setAutoBackupEnabled(enabled);
  }

  async isAutoBackupEnabled(): Promise<boolean> {
    return await localDB.getAutoBackupEnabled();
  }

  async getLastBackupDate(): Promise<Date | null> {
    const lastBackupDate = await localDB.getLastBackupDate();
    return lastBackupDate ? new Date(lastBackupDate) : null;
  }
}

// Singleton instance
export const backupService = new BackupService();
