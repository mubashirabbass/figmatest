# Pakistani Pizza Shop POS - Local Database System

## Overview

Your POS system now uses a **true local database** stored on your computer's hard drive using **SQLite**.

---

## What You Get

✅ **Real Local Database** - SQLite database file on your computer  
✅ **Offline Operation** - No internet required  
✅ **Permanent Storage** - Data stays even when you restart computer  
✅ **Automatic Backups** - Daily automatic backups to local files  
✅ **Manual Backup/Restore** - Create backups anytime  
✅ **Fast Performance** - Direct file access, no network delays  

---

## How It Works

```
┌─────────────────┐         ┌─────────────────┐
│  Your Browser   │ ◄─────► │  Node.js Server │
│  (Frontend)     │         │  (Port 3001)    │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  SQLite Database│
                            │  (Local File)   │
                            └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  Backup Files   │
                            │  (JSON files)   │
                            └─────────────────┘
```

1. **Frontend** (React app in browser) - What you see and interact with
2. **Backend Server** (Node.js + Express) - Handles database operations
3. **SQLite Database** - Single file containing all your data
4. **Backup Files** - JSON files for backup/restore

---

## Quick Start

### 1. Install Dependencies

```bash
npm install express cors better-sqlite3 multer
```

### 2. Start Database Server

**Windows:**
```bash
start-server.bat
```

**macOS/Linux:**
```bash
chmod +x start-server.sh
./start-server.sh
```

**Or manually:**
```bash
npm run server
```

### 3. Start Frontend App

Open a NEW terminal window:
```bash
npm start
```

### 4. Login and Use!

The system will automatically connect to your local database.

---

## Database Location

Your database is stored at:

```
your-project-folder/
└── database_files/
    └── pakistani-pizza-shop.db  ← YOUR DATABASE FILE
```

- This is a **single SQLite file** containing ALL your data
- Size grows as you add orders (typically a few MB)
- Never delete this file while the server is running!

---

## Backup System

### Automatic Backups

- **Frequency:** Every 24 hours
- **Location:** `backups/` folder
- **Format:** JSON files with timestamp
- **Cleanup:** Auto-deletes backups older than 30 days
- **Example:** `auto-backup-2025-11-03T10-00-00.json`

### Manual Backups

From the Dashboard → Backup & Data section:

1. **Create Backup** - Generate backup file immediately
2. **Download** - Download backup to save elsewhere  
3. **Restore** - Restore from a backup file

### Backup File Contents

Each backup contains:
- All orders (complete and incomplete)
- All order items
- System settings
- Backup history log

---

## Key Features

### 1. Data Persistence

- **Browser closes?** → Data stays in database ✅
- **Computer restarts?** → Data stays in database ✅  
- **Server restarts?** → Data stays in database ✅
- **Clear browser cache?** → Data stays in database ✅

### 2. Performance

- **Fast:** Direct file system access
- **Reliable:** SQLite is battle-tested technology
- **Efficient:** Automatic indexing for quick searches
- **Scalable:** Can handle thousands of orders

### 3. Offline Operation

- **No internet needed** - Everything runs locally
- **No monthly fees** - Your own database
- **No cloud dependency** - You control your data
- **Privacy** - Data never leaves your computer

---

## File Structure

```
pakistani-pizza-shop-pos/
├── server/                          # Backend server code
│   ├── database.js                  # Database operations
│   ├── backupService.js            # Backup automation
│   └── server.js                   # Express server
│
├── database_files/                  # Database storage
│   └── pakistani-pizza-shop.db     # ← YOUR DATA IS HERE
│
├── backups/                         # Backup files
│   ├── auto-backup-2025-11-03...json
│   └── manual-backup-2025-11-03...json
│
├── components/                      # React components
├── utils/
│   └── api.ts                      # API client for database
│
├── package.json
├── start-server.bat                # Windows startup script
└── start-server.sh                 # Unix/Mac startup script
```

---

## Daily Usage Workflow

### Morning (Opening)

1. Start database server: `npm run server`
2. Start frontend app: `npm start`  
3. Login and begin taking orders

### During Day

- All orders automatically saved to database
- View sales history anytime
- Generate reports as needed

### Evening (Closing)

1. Check Backup & Data section
2. Verify last backup time
3. Optionally create manual backup
4. Copy backup file to USB drive
5. Close browser
6. Press Ctrl+C in server terminal

---

## Backup Best Practices

### Daily
- ✅ Let automatic backup run (every 24 hours)
- ✅ Copy latest backup to USB drive
- ✅ Verify backup file exists in `backups/` folder

### Weekly  
- ✅ Create manual backup
- ✅ Upload to cloud storage (Google Drive, Dropbox, etc.)
- ✅ Test restoration on a backup copy

### Monthly
- ✅ Archive all backups by month
- ✅ Store backups in 3 different locations:
  - Original: `backups/` folder
  - USB drive
  - Cloud storage
- ✅ Test full restore procedure

---

## Troubleshooting

### "Cannot connect to database server"

**Problem:** Frontend can't reach the backend server

**Solution:**
1. Make sure you ran `npm run server` first
2. Check that the server terminal shows "Server running on: http://localhost:3001"
3. Verify port 3001 is not blocked by firewall

### "Database file is locked"

**Problem:** Another program is accessing the database

**Solution:**
1. Close any database viewers/editors
2. Make sure only one server instance is running
3. Restart the server

### "Backup failed"

**Problem:** Cannot create backup file

**Solution:**
1. Check disk space
2. Verify `backups/` folder exists
3. Check folder permissions

---

## Security & Privacy

### Your Data is Safe

- ✅ **Stored locally** on your computer
- ✅ **Not sent to internet** - completely offline
- ✅ **You have full control** - it's your file
- ✅ **Encrypted at rest** if you use disk encryption

### Protect Your Data

1. **Physical Security:**
   - Lock your computer when away
   - Secure the room/building

2. **Backup Security:**
   - Password-protect USB drives
   - Use encrypted cloud storage
   - Don't email backup files

3. **System Security:**
   - Keep operating system updated
   - Use antivirus software
   - Regular security updates

---

## Advanced Topics

### Migrating to New Computer

1. Stop the server
2. Copy entire `database_files/` folder
3. Copy entire `backups/` folder  
4. Install Node.js on new computer
5. Copy project folder
6. Run `npm install`
7. Start server

### Database Maintenance

**Check database integrity:**
```bash
sqlite3 database_files/pakistani-pizza-shop.db "PRAGMA integrity_check;"
```

**Optimize database:**
```bash
sqlite3 database_files/pakistani-pizza-shop.db "VACUUM;"
```

**View database stats:**
Check the Backup & Data section in dashboard

### Scaling Up

SQLite handles:
- **Rows:** Billions of rows (limited only by disk space)
- **Size:** Up to 281 terabytes  
- **Writes:** Thousands per second
- **Reads:** Millions per second

Your POS can easily handle years of transactions!

---

## Support

### Before Contacting Support

1. Check server is running (`npm run server`)
2. Check console for errors (F12 in browser)
3. Note exact error messages
4. Check database file exists
5. Verify Node.js version (`node --version`)

### Information to Provide

- Operating system (Windows/Mac/Linux)
- Node.js version
- Error messages (exact text)
- Database path and size
- Steps to reproduce the issue

---

## Summary

Your Pakistani Pizza Shop POS now has:

📊 **Local SQLite Database**
- Single file on your hard drive
- Located in `database_files/` folder
- Contains all orders and data

🔄 **Automatic Backups**
- Every 24 hours automatically
- Saved as JSON files
- Easy to restore

💾 **Manual Control**
- Create backups anytime
- Download backups
- Restore from any backup

🔒 **Complete Offline**
- No internet required
- Data stays on your computer
- Full privacy and control

---

**You're ready to use your offline POS system!**

Start the server, login, and begin taking orders. All data is safely stored on your computer's hard drive.

---

Last Updated: November 3, 2025
