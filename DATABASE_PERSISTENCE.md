# Database Persistence Guide

## ✅ Your Data is Safe and Persistent!

Shah Je Pizza POS uses **IndexedDB** - a powerful NoSQL database built into your browser. Here's what you need to know:

## How Data Persistence Works

### 🔒 Permanent Storage
- **All data is stored locally** in your browser's IndexedDB database
- **Data persists permanently** across:
  - Browser closes and reopens
  - Computer restarts
  - Login/Logout sessions
  - Days, weeks, and months

### 🔄 Automatic Data Recovery
Every time you login, the system automatically:
1. ✅ Loads all completed orders
2. ✅ Loads all incomplete/pending orders  
3. ✅ Loads all products and menu items
4. ✅ Loads your settings and preferences
5. ✅ Restores table statuses for dine-in orders
6. ✅ Continues sequential order numbering from where you left off

### 💾 What Gets Saved
- **Orders**: Every completed and incomplete order with full details
- **Products**: All menu items, prices, categories, and images
- **Settings**: Auto-backup preferences, order counters
- **Customer Data**: Names, contacts, addresses for each order
- **Payment Info**: Payment methods, partial payments, amounts
- **Staff Info**: Which staff member handled each order
- **Timestamps**: Exact date/time for every order

## Storage Technology

### IndexedDB (NoSQL Database)
- Browser-based database that works **offline**
- Can store **hundreds of megabytes** of data
- **Fast queries** for instant order lookups
- **Transactional** - data integrity guaranteed
- **Indexed searches** for quick filtering

### Persistent Storage API
The system requests **persistent storage** from your browser, which means:
- Browser will **NOT** automatically clear your data under storage pressure
- Data survives **browser updates**
- Protected from **automatic cleanup**

## What WILL Clear Your Data

⚠️ **Only these actions will delete your data:**

1. **Manually clearing browser data/cache**
   - Settings → Privacy → Clear Browsing Data
   - Make sure to UNCHECK "Cookies and site data" or take a backup first!

2. **Uninstalling the browser**
   - Always keep backups before major browser changes

3. **Using Incognito/Private Mode**
   - Private mode doesn't persist any data
   - Always use normal browser mode for POS

4. **Using "Restore Backup" feature**
   - This intentionally replaces all data with backup data

## Backup Strategy

### Why Backups Matter
Even though data persists, **backups are your insurance policy**:
- Protects against accidental data clearing
- Allows moving data to another computer
- Recovery from hardware failure
- Historical archive of all business data

### Backup Options

#### 1. Automatic Daily Backup (Recommended)
- Enable in **Dashboard → Backup & Data**
- Downloads a JSON file every 24 hours automatically
- Keep these files in a safe location

#### 2. Manual Backup
- Click **"Download Backup"** anytime
- Before major changes (browser updates, etc.)
- Weekly or monthly for extra safety

#### 3. Multiple Storage Locations
Store backup files in:
- 💾 USB Flash Drive
- ☁️ Cloud Storage (Google Drive, Dropbox, OneDrive)
- 📧 Email to yourself
- 🖥️ Different computer/laptop

## Verifying Data Persistence

### On Dashboard
Check the **Database Status** card on dashboard:
- Shows total orders and products stored
- Confirms data is loaded from database

### In Backup & Data Section
- View **Storage Status** - shows if storage is persistent
- See **Storage Used** - how much data is stored
- Check **Recent Backup History**

### After Logout/Login
1. Note your order count before logout
2. Logout from the system
3. Login again
4. Verify same order count appears
5. Check that all data is intact

## Console Logging

Open browser console (F12) to see detailed logs:
- `✅ IndexedDB opened successfully`
- `✅ Storage will persist and won't be cleared by browser`
- `📊 Database loaded: X orders, Y products`
- `💾 Storage: X MB used of Y MB available`

## Troubleshooting

### "Data seems to be missing"
1. Check if you're using the same browser
2. Verify you haven't cleared browser data
3. Check Backup & Data section for storage status
4. Look at console logs for errors

### "Orders disappeared after login"
1. This should NOT happen with the new system
2. Check console for error messages
3. Restore from your most recent backup
4. Report the issue for investigation

### "Storage not persistent" warning
1. Browser may not support Persistent Storage API
2. Enable auto-backups immediately
3. Take manual backups more frequently
4. Consider using Chrome or Firefox for better support

## Best Practices

1. ✅ **Enable Auto-Backup** - Set it and forget it
2. ✅ **Test Restore** - Practice restoring a backup occasionally
3. ✅ **Multiple Locations** - Keep backups in 2-3 different places
4. ✅ **Regular Schedule** - Download manual backup weekly
5. ✅ **Before Major Changes** - Backup before browser updates
6. ✅ **Monitor Storage** - Check storage usage periodically
7. ✅ **Keep Browser Updated** - Latest versions have best support
8. ✅ **Use Normal Mode** - Never use private/incognito for POS

## Technical Details

### Database Schema
- **Database Name**: `ShahJePizzaDB`
- **Version**: 2
- **Stores**: 
  - `orders` - All order records
  - `products` - Menu items
  - `settings` - System settings
  - `backupLog` - Backup history

### Storage Limits
- **Desktop Chrome/Firefox**: ~60% of available disk space
- **Mobile Chrome**: ~50% of available storage
- **Typical Capacity**: Several hundred megabytes to gigabytes

### Browser Support
- ✅ Chrome 38+
- ✅ Firefox 35+
- ✅ Safari 10+
- ✅ Edge 12+

## Need Help?

Contact Abbas Developers:
- 📱 Phone: 0304165629
- 💻 For technical support and questions

---

**Remember**: Your data persists automatically, but backups are your safety net! 🛡️
