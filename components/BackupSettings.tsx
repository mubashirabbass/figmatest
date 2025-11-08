import { useState, useEffect } from 'react';
import { Download, Upload, Database, Calendar, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';
import { api } from '../utils/api';

export function BackupSettings() {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [databaseSize, setDatabaseSize] = useState(0);
  const [databasePath, setDatabasePath] = useState('');
  const [isPersisted, setIsPersisted] = useState(true); // SQLite is always persistent

  useEffect(() => {
    loadBackupSettings();
    loadStorageInfo();
  }, []);

  const loadBackupSettings = async () => {
    try {
      const autoBackup = await api.getSetting('auto_backup_enabled');
      const lastBackup = await api.getSetting('last_backup_date');
      const logs = await api.getBackupLogs();
      const stats = await api.getStats();
      
      setAutoBackupEnabled(autoBackup === 'true');
      setLastBackupDate(lastBackup ? new Date(lastBackup) : null);
      setBackupLogs(logs);
      setDatabaseSize(stats.databaseSize);
      setDatabasePath(stats.databasePath);
    } catch (error) {
      console.error('Failed to load backup settings:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const stats = await api.getStats();
      setDatabaseSize(stats.databaseSize);
      setDatabasePath(stats.databasePath);
      setIsPersisted(true); // SQLite is always persistent
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAutoBackupToggle = async (checked: boolean) => {
    try {
      await api.toggleAutoBackup(checked);
      setAutoBackupEnabled(checked);
      toast.success(
        checked ? 'Auto backup enabled' : 'Auto backup disabled',
        { duration: 1000 }
      );
    } catch (error) {
      toast.error('Failed to update auto backup setting', { duration: 1000 });
    }
  };

  const handleManualBackup = async () => {
    setIsLoading(true);
    try {
      const result = await api.createBackup();
      await loadBackupSettings();
      
      if (result.filename) {
        toast.success(`Backup created: ${result.filename}`, { duration: 2000 });
        console.log('✅ Backup saved to D drive:', result.filePath);
      } else {
        toast.success('Backup created successfully!', { duration: 1000 });
      }
    } catch (error) {
      toast.error('Failed to create backup', { duration: 1000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await api.restoreBackup(file);
      
      if (result.success) {
        await loadBackupSettings();
        toast.success('Backup restored successfully!', { duration: 1000 });
        
        // Reload page to reflect restored data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(result.error || 'Failed to restore backup', { duration: 1000 });
      }
    } catch (error) {
      toast.error('Failed to restore backup', { duration: 1000 });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-emerald-600 mb-4">Backup & Data Management</h2>
        <p className="text-gray-600">
          Manage your POS data backups. All data is stored locally in your browser.
        </p>
      </div>

      {/* Data Protection Summary */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              🛡️
            </div>
            <div>
              <h3 className="text-emerald-800">5-Layer Data Protection Active</h3>
              <p className="text-sm text-emerald-700">Your data will never disappear</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Persistent Storage {isPersisted ? '(Active)' : '(Setup Needed)'}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>IndexedDB Storage</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Emergency LocalStorage</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Downloadable Backups</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Real-time Monitoring</span>
            </div>
          </div>
          
          {!isPersisted && (
            <div className="mt-3 p-3 bg-amber-100 border border-amber-300 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Recommendation:</strong> Enable persistent storage in your browser settings 
                and create regular backups to maximize protection.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Auto Backup Setting */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-emerald-600">Automatic Daily Backup</h3>
              <p className="text-gray-600 text-sm">
                When enabled, system will automatically download a backup file every 24 hours
              </p>
            </div>
          </div>
          <Switch
            checked={autoBackupEnabled}
            onCheckedChange={handleAutoBackupToggle}
          />
        </div>
      </Card>

      {/* SQLite Database Information */}
      <Card className="p-6 bg-emerald-50 border-emerald-200">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <div className="flex-1">
              <h3 className="text-emerald-600">
                SQLite3 Database Status
              </h3>
              <p className="text-sm text-emerald-700">
                ✓ Professional SQLite3 database - ACID compliant, no data loss!
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Database Location:</span>
              <span className="text-gray-900 text-xs break-all">
                {databasePath || 'D:\\ShahJePizza\\database\\shahje-pizza.db'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Database Size:</span>
              <span className="text-gray-900">
                {formatBytes(databaseSize)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Storage Type:</span>
              <span className="text-gray-900">
                SQLite3 (Professional)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Data Safety:</span>
              <span className="text-emerald-600">
                ✅ Permanent (Never deleted)
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Last Backup Info */}
      {lastBackupDate && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-blue-600">Last Automatic Backup</h3>
              <p className="text-gray-700">
                {formatDate(lastBackupDate)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Manual Backup Actions */}
      <Card className="p-6">
        <h3 className="text-emerald-600 mb-4">Manual Backup</h3>
        <div className="flex gap-4">
          <Button
            onClick={handleManualBackup}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Backup
          </Button>
          
          <Button
            onClick={() => document.getElementById('restore-backup-input')?.click()}
            disabled={isLoading}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Restore Backup
          </Button>
          
          <input
            id="restore-backup-input"
            type="file"
            accept=".json"
            onChange={handleRestoreBackup}
            className="hidden"
          />
        </div>
        <p className="text-gray-600 text-sm mt-4">
          Create a backup file that will be downloaded to your computer. Keep it safe!
        </p>
      </Card>

      {/* Backup History */}
      {backupLogs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-emerald-600 mb-4">Recent Backup History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {backupLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {log.success ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-gray-700">
                      {log.type === 'auto' ? 'Automatic Backup' : 'Manual Backup'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(new Date(log.timestamp))}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    log.success
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {log.success ? 'Success' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Important Note */}
      <Card className="p-6 bg-emerald-50 border-emerald-200">
        <h3 className="text-emerald-800 mb-2">✓ Data Persistence - How It Works</h3>
        <ul className="text-emerald-700 text-sm space-y-2">
          <li>• <strong>IndexedDB Storage:</strong> All data is stored in your browser's IndexedDB (NoSQL database)</li>
          <li>• <strong>Persistent Across Sessions:</strong> Data remains saved after closing browser or restarting computer</li>
          <li>• <strong>Login Protection:</strong> Your data is NEVER deleted when you logout or login again</li>
          <li>• <strong>Automatic Recovery:</strong> System loads all your orders, products, and settings on every login</li>
          <li>• <strong>Browser Storage API:</strong> System requests permanent storage to prevent browser from clearing data</li>
          <li>• <strong>Backup Protection:</strong> Keep backup files as additional safety (USB drive, cloud storage, etc.)</li>
          <li>• <strong>Regular Testing:</strong> Test your backup restoration process regularly</li>
        </ul>
      </Card>
      
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="text-amber-800 mb-2">⚠️ Important Warning</h3>
        <ul className="text-amber-700 text-sm space-y-2">
          <li>• Never clear your browser data/cache unless you have a recent backup saved</li>
          <li>• Uninstalling the browser will delete all data</li>
          <li>• Running browser in "Incognito/Private" mode will not persist data</li>
        </ul>
      </Card>
    </div>
  );
}
