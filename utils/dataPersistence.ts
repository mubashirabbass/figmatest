// Data Persistence Manager - Ensures data never disappears
import { toast } from 'sonner@2.0.3';
import * as browserDB from './browserDatabase';

export class DataPersistenceManager {
  private static instance: DataPersistenceManager;
  private isMonitoring = false;
  private backupReminderInterval: NodeJS.Timeout | null = null;

  static getInstance(): DataPersistenceManager {
    if (!DataPersistenceManager.instance) {
      DataPersistenceManager.instance = new DataPersistenceManager();
    }
    return DataPersistenceManager.instance;
  }

  // Request persistent storage from browser
  async requestPersistentStorage(): Promise<boolean> {
    if (navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persisted();
        
        if (!isPersisted) {
          console.log('🔒 Requesting persistent storage...');
          const result = await navigator.storage.persist();
          
          if (result) {
            console.log('✅ PERSISTENT STORAGE GRANTED!');
            console.log('🛡️  Your data is now protected from automatic deletion');
            await browserDB.setSetting('persistentStorageGranted', new Date().toISOString());
            return true;
          } else {
            console.warn('⚠️  Persistent storage denied - data may be cleared by browser');
            this.showPersistenceWarning();
            return false;
          }
        } else {
          console.log('✅ Storage already persistent');
          return true;
        }
      } catch (error) {
        console.error('Failed to request persistent storage:', error);
        return false;
      }
    } else {
      console.warn('⚠️  Persistent storage API not supported');
      return false;
    }
  }

  // Check if storage is persistent
  async isStoragePersistent(): Promise<boolean> {
    if (navigator.storage && navigator.storage.persisted) {
      try {
        return await navigator.storage.persisted();
      } catch (error) {
        console.error('Failed to check storage persistence:', error);
        return false;
      }
    }
    return false;
  }

  // Show warning if storage is not persistent
  private showPersistenceWarning() {
    toast.error('Storage Not Protected!', {
      duration: 10000,
      description: 'Please enable persistent storage in browser settings and create regular backups.',
      action: {
        label: 'Learn How',
        onClick: () => this.showPersistenceInstructions()
      }
    });
  }

  private showPersistenceInstructions() {
    const instructions = `
TO PROTECT YOUR DATA:

1. BROWSER SETTINGS:
   - Chrome/Edge: Site Settings → Storage → Allow
   - Firefox: Automatically grants on user interaction
   - Safari: Settings → Advanced → Website Data

2. REGULAR BACKUPS:
   - Dashboard → Backup & Restore
   - Download backup files weekly
   - Store backups on D: drive or cloud

3. BROWSER WARNINGS:
   - Don't clear browser data
   - Don't use Incognito/Private mode
   - Keep browser updated
    `;
    
    console.log(instructions);
    alert('Data Protection Instructions\n\nCheck browser console (F12) for detailed instructions.');
  }

  // Create automatic backup
  async createAutoBackup(): Promise<boolean> {
    try {
      console.log('💾 Creating automatic backup...');
      
      const data = await browserDB.exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `shahje-pizza-AUTO-BACKUP-${timestamp}.json`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      await browserDB.setSetting('lastAutoBackup', new Date().toISOString());
      
      console.log('✅ Auto backup created:', filename);
      return true;
    } catch (error) {
      console.error('❌ Auto backup failed:', error);
      return false;
    }
  }

  // Check if backup is needed
  async shouldCreateBackup(): Promise<boolean> {
    try {
      const lastBackup = await browserDB.getSetting('lastAutoBackup');
      
      if (!lastBackup) return true;
      
      const lastBackupDate = new Date(lastBackup);
      const daysSinceBackup = (Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Recommend backup every 7 days
      return daysSinceBackup >= 7;
    } catch (error) {
      return true;
    }
  }

  // Show backup reminder
  async showBackupReminder() {
    const shouldBackup = await this.shouldCreateBackup();
    
    if (shouldBackup) {
      toast.warning('Time to Create Backup!', {
        duration: 10000,
        description: 'It has been 7+ days since your last backup. Protect your data now!',
        action: {
          label: 'Backup Now',
          onClick: async () => {
            const success = await this.createAutoBackup();
            if (success) {
              toast.success('Backup downloaded successfully!', { duration: 2000 });
            }
          }
        }
      });
    }
  }

  // Start monitoring storage health
  async startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Starting data persistence monitoring...');
    
    // Check persistence status immediately
    const isPersisted = await this.isStoragePersistent();
    if (!isPersisted) {
      await this.requestPersistentStorage();
    }
    
    // Check backup status
    await this.showBackupReminder();
    
    // Monitor storage quota
    this.monitorStorageQuota();
    
    // Set up periodic backup reminders (check every 24 hours)
    this.backupReminderInterval = setInterval(async () => {
      await this.showBackupReminder();
    }, 24 * 60 * 60 * 1000);
    
    console.log('✅ Data persistence monitoring active');
  }

  // Monitor storage quota
  private async monitorStorageQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;
        
        console.log('💾 Storage Usage:');
        console.log(`   Used: ${this.formatBytes(used)}`);
        console.log(`   Quota: ${this.formatBytes(quota)}`);
        console.log(`   Percentage: ${percentage.toFixed(2)}%`);
        
        // Warn if storage is getting full (>80%)
        if (percentage > 80) {
          toast.warning('Storage Almost Full!', {
            duration: 8000,
            description: `${percentage.toFixed(0)}% of browser storage used. Create backup and clear old data.`
          });
        }
      } catch (error) {
        console.error('Failed to check storage quota:', error);
      }
    }
  }

  // Format bytes to human readable
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.backupReminderInterval) {
      clearInterval(this.backupReminderInterval);
      this.backupReminderInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Data persistence monitoring stopped');
  }

  // Save data to localStorage as backup
  async saveToLocalStorage() {
    try {
      const data = await browserDB.exportAllData();
      const compressed = JSON.stringify(data);
      
      // Split into chunks if too large (localStorage has 5-10MB limit)
      const chunkSize = 1024 * 1024; // 1MB chunks
      const chunks = Math.ceil(compressed.length / chunkSize);
      
      localStorage.setItem('shahje-pizza-backup-chunks', chunks.toString());
      
      for (let i = 0; i < chunks; i++) {
        const chunk = compressed.slice(i * chunkSize, (i + 1) * chunkSize);
        localStorage.setItem(`shahje-pizza-backup-${i}`, chunk);
      }
      
      localStorage.setItem('shahje-pizza-backup-date', new Date().toISOString());
      
      console.log('✅ Emergency backup saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
      return false;
    }
  }

  // Restore from localStorage backup
  async restoreFromLocalStorage(): Promise<boolean> {
    try {
      const chunks = parseInt(localStorage.getItem('shahje-pizza-backup-chunks') || '0');
      
      if (chunks === 0) {
        console.log('No localStorage backup found');
        return false;
      }
      
      let compressed = '';
      for (let i = 0; i < chunks; i++) {
        compressed += localStorage.getItem(`shahje-pizza-backup-${i}`) || '';
      }
      
      const data = JSON.parse(compressed);
      await browserDB.importAllData(data);
      
      console.log('✅ Data restored from localStorage backup');
      return true;
    } catch (error) {
      console.error('❌ Failed to restore from localStorage:', error);
      return false;
    }
  }

  // Comprehensive data safety check
  async performSafetyCheck(): Promise<{
    persistent: boolean;
    hasData: boolean;
    storageAvailable: number;
    lastBackup: string | null;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    
    // Check persistence
    const persistent = await this.isStoragePersistent();
    if (!persistent) {
      recommendations.push('Enable persistent storage in browser settings');
    }
    
    // Check if we have data
    const orders = await browserDB.getAllOrders();
    const hasData = orders.length > 0;
    
    // Check storage
    let storageAvailable = 0;
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      storageAvailable = quota - used;
      
      if ((used / quota) > 0.8) {
        recommendations.push('Storage is 80%+ full - create backup and clear old data');
      }
    }
    
    // Check last backup
    const lastBackup = await browserDB.getSetting('lastAutoBackup');
    if (!lastBackup) {
      recommendations.push('No backups created yet - create your first backup');
    } else {
      const daysSince = (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 7) {
        recommendations.push(`Last backup was ${Math.floor(daysSince)} days ago - create new backup`);
      }
    }
    
    // Save emergency backup to localStorage
    if (hasData) {
      await this.saveToLocalStorage();
    }
    
    return {
      persistent,
      hasData,
      storageAvailable,
      lastBackup,
      recommendations
    };
  }

  // Display safety status
  async displaySafetyStatus() {
    const status = await this.performSafetyCheck();
    
    console.log('═══════════════════════════════════════════════════');
    console.log('🛡️  DATA SAFETY STATUS');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✓ Persistent Storage: ${status.persistent ? '✅ YES' : '❌ NO'}`);
    console.log(`✓ Has Data: ${status.hasData ? '✅ YES' : '⚠️  NO'}`);
    console.log(`✓ Storage Available: ${this.formatBytes(status.storageAvailable)}`);
    console.log(`✓ Last Backup: ${status.lastBackup ? new Date(status.lastBackup).toLocaleDateString() : '⚠️  NEVER'}`);
    
    if (status.recommendations.length > 0) {
      console.log('\n📋 RECOMMENDATIONS:');
      status.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    } else {
      console.log('\n✅ ALL GOOD! Your data is safe.');
    }
    console.log('═══════════════════════════════════════════════════');
    
    return status;
  }
}

// Export singleton instance
export const dataPersistence = DataPersistenceManager.getInstance();
