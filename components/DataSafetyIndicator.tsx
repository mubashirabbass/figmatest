import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { dataPersistence } from '../utils/dataPersistence';

export function DataSafetyIndicator() {
  const [isPersistent, setIsPersistent] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [daysSinceBackup, setDaysSinceBackup] = useState<number>(0);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    checkSafetyStatus();
    
    // Check every 5 minutes
    const interval = setInterval(checkSafetyStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkSafetyStatus = async () => {
    const status = await dataPersistence.performSafetyCheck();
    setIsPersistent(status.persistent);
    setLastBackup(status.lastBackup);
    
    if (status.lastBackup) {
      const days = (Date.now() - new Date(status.lastBackup).getTime()) / (1000 * 60 * 60 * 24);
      setDaysSinceBackup(Math.floor(days));
    }
  };

  const handleQuickBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await dataPersistence.createAutoBackup();
      await checkSafetyStatus();
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getSafetyLevel = (): 'safe' | 'warning' | 'danger' => {
    if (!isPersistent) return 'danger';
    if (daysSinceBackup > 7) return 'warning';
    return 'safe';
  };

  const safetyLevel = getSafetyLevel();

  const safetyConfig = {
    safe: {
      icon: ShieldCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Data Protected',
      message: 'Your data is safe and backed up'
    },
    warning: {
      icon: ShieldAlert,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'Backup Needed',
      message: `Last backup: ${daysSinceBackup} days ago`
    },
    danger: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'Not Protected',
      message: 'Storage not persistent - Create backup now!'
    }
  };

  const config = safetyConfig[safetyLevel];
  const Icon = config.icon;

  return (
    <Card className={`p-4 ${config.bgColor} ${config.borderColor} border-2`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.color} flex-shrink-0 mt-1`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`${config.color}`}>{config.title}</h3>
            {safetyLevel !== 'safe' && (
              <Button
                size="sm"
                onClick={handleQuickBackup}
                disabled={isCreatingBackup}
                className="h-8"
              >
                <Download className="w-4 h-4 mr-2" />
                {isCreatingBackup ? 'Creating...' : 'Quick Backup'}
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-600">{config.message}</p>
          
          {!isPersistent && (
            <div className="mt-2 text-xs text-red-600 space-y-1">
              <p>⚠️ Browser may delete data at any time</p>
              <p>✓ Create regular backups to prevent data loss</p>
            </div>
          )}
          
          {lastBackup && (
            <p className="text-xs text-gray-500 mt-1">
              Last backup: {new Date(lastBackup).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
