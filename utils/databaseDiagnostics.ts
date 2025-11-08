// Database Diagnostics Utility
// Use this in browser console to check database status

export const databaseDiagnostics = {
  // Check if IndexedDB is supported
  async checkSupport(): Promise<void> {
    console.log('🔍 Checking IndexedDB Support...');
    console.log('IndexedDB supported:', !!window.indexedDB);
    console.log('Storage API supported:', !!navigator.storage);
  },

  // Check if storage is persisted
  async checkPersistence(): Promise<void> {
    console.log('🔍 Checking Storage Persistence...');
    
    if (navigator.storage && navigator.storage.persisted) {
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) {
        console.log('✅ Storage IS persistent - Data is safe!');
      } else {
        console.log('⚠️ Storage is NOT persistent - Enable auto-backups!');
      }
    } else {
      console.log('⚠️ Persistence API not available');
    }
  },

  // Check storage usage
  async checkStorageUsage(): Promise<void> {
    console.log('🔍 Checking Storage Usage...');
    
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
      const quotaMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(2);
      const percentage = estimate.quota ? ((estimate.usage || 0) / estimate.quota * 100).toFixed(2) : 0;
      
      console.log(`💾 Used: ${usedMB} MB`);
      console.log(`💾 Available: ${quotaMB} MB`);
      console.log(`💾 Usage: ${percentage}%`);
    } else {
      console.log('⚠️ Storage estimate API not available');
    }
  },

  // List all IndexedDB databases
  async listDatabases(): Promise<void> {
    console.log('🔍 Listing IndexedDB Databases...');
    
    if (indexedDB.databases) {
      const databases = await indexedDB.databases();
      console.log('📚 Databases found:', databases.length);
      databases.forEach((db) => {
        console.log(`  - ${db.name} (version: ${db.version})`);
      });
      
      const shahJeDB = databases.find(db => db.name === 'ShahJePizzaDB');
      if (shahJeDB) {
        console.log('✅ ShahJePizzaDB found!');
      } else {
        console.log('❌ ShahJePizzaDB NOT found!');
      }
    } else {
      console.log('⚠️ databases() method not available');
    }
  },

  // Check specific database
  async checkDatabase(): Promise<void> {
    console.log('🔍 Checking ShahJePizzaDB...');
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ShahJePizzaDB');
      
      request.onsuccess = () => {
        const db = request.result;
        console.log('✅ Database opened successfully');
        console.log('📊 Version:', db.version);
        console.log('📦 Object Stores:', Array.from(db.objectStoreNames));
        
        // Check each store
        const transaction = db.transaction(Array.from(db.objectStoreNames), 'readonly');
        
        db.objectStoreNames.forEach((storeName: string) => {
          const store = transaction.objectStore(storeName);
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            console.log(`  - ${storeName}: ${countRequest.result} records`);
          };
        });
        
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
      };
      
      request.onerror = () => {
        console.log('❌ Failed to open database:', request.error);
        reject(request.error);
      };
    });
  },

  // Run all diagnostics
  async runAll(): Promise<void> {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🔧 DATABASE DIAGNOSTICS');
    console.log('═══════════════════════════════════════');
    console.log('');
    
    await this.checkSupport();
    console.log('');
    
    await this.checkPersistence();
    console.log('');
    
    await this.checkStorageUsage();
    console.log('');
    
    await this.listDatabases();
    console.log('');
    
    await this.checkDatabase();
    console.log('');
    
    console.log('═══════════════════════════════════════');
    console.log('✅ DIAGNOSTICS COMPLETE');
    console.log('═══════════════════════════════════════');
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).dbDiagnostics = databaseDiagnostics;
}

// Example usage in console:
// dbDiagnostics.runAll()
// dbDiagnostics.checkPersistence()
// dbDiagnostics.checkStorageUsage()
