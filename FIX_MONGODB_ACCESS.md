# 🔍 MongoDB Already Installed - Quick Fix

## The Problem
You have MongoDB Compass, but the database isn't accessible. Either:
1. MongoDB service isn't running
2. Database was deleted/moved
3. MongoDB wasn't installed as a service

## ✅ Quick Diagnostic & Fix

### Step 1: Check if MongoDB is Running

Open PowerShell:

```powershell
# Check for MongoDB service
Get-Service -Name MongoDB*
```

**Result A: Service Found (Status: Running or Stopped)**
```
Status   Name               DisplayName
------   ----               -----------
Running  MongoDB            MongoDB
```
✅ Good! MongoDB is installed as a service.

If status is "Stopped", start it:
```powershell
Start-Service -Name MongoDB
```

**Result B: No Service Found**
```
Get-Service: Cannot find any service with service name 'MongoDB*'
```
❌ MongoDB is installed but NOT as a service. Jump to **Step 3**.

---

### Step 2: Test Connection with Compass

1. **Open MongoDB Compass**
2. **Connection String:** `mongodb://localhost:27017`
3. **Click "Connect"**

**If it connects:** Great! Database just needs to be re-seeded. Jump to **Step 4**.

**If it fails:** Continue to Step 3.

---

### Step 3: Find and Start MongoDB Manually

MongoDB is installed but not running as a service. Let's find it:

```powershell
# Find where MongoDB is installed
Get-ChildItem -Path "C:\Program Files\MongoDB" -Recurse -Filter mongod.exe -ErrorAction SilentlyContinue | Select-Object FullName
```

**Common locations:**
- `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`
- `C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe`
- `C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe`

**Once found:**

1. **Create data directory (if needed):**
   ```powershell
   mkdir C:\data\db
   ```

2. **Start MongoDB manually:**
   ```powershell
   # Replace with YOUR actual path
   & "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
   ```

3. **Keep that PowerShell window OPEN** (MongoDB is now running)

4. **Open MongoDB Compass** → Connect to `mongodb://localhost:27017`

5. **Open a NEW PowerShell window** for the next steps

---

### Step 4: Re-seed the Database

The database might be empty. Let's fill it with data:

```powershell
# Navigate to project
cd C:\Users\Anjella\Downloads\v0-bookstore-management-system

# Seed the database
node scripts/seed-data.js
```

**Expected output:**
```
✅ Connected to MongoDB
Seeding books...
✅ Seeded 50 books
Seeding users...
✅ Seeded 3 users
✅ Database seeded successfully
```

---

### Step 5: Start the Application

```powershell
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 If MongoDB Still Won't Start

### Option A: Reinstall MongoDB as a Service

1. **Uninstall current MongoDB:**
   - Settings → Apps → MongoDB → Uninstall

2. **Download fresh installer:**
   - https://www.mongodb.com/try/download/community

3. **During installation:**
   - ✅ **MUST CHECK: "Install MongoDB as a Service"**
   - This is the key step!

4. **After install:**
   ```powershell
   Get-Service -Name MongoDB
   node scripts/seed-data.js
   npm run dev
   ```

### Option B: Install MongoDB as Service Manually

If MongoDB is installed but not as a service:

```powershell
# Run as Administrator
sc.exe create MongoDB binPath= "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe --service --config=C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg" DisplayName= "MongoDB" start= "auto"

# Start the service
Start-Service -Name MongoDB
```

---

## 📋 Quick Commands Reference

**Check MongoDB status:**
```powershell
Get-Service -Name MongoDB
```

**Start MongoDB service:**
```powershell
Start-Service -Name MongoDB
```

**Check what's using port 27017:**
```powershell
netstat -ano | findstr :27017
```

**Re-seed database:**
```powershell
cd C:\Users\Anjella\Downloads\v0-bookstore-management-system
node scripts/seed-data.js
```

**Start the app:**
```powershell
npm run dev
```

---

## 🎯 Most Common Solution

90% of the time, this fixes it:

```powershell
# 1. Check if service exists
Get-Service -Name MongoDB

# 2. If it exists but stopped, start it:
Start-Service -Name MongoDB

# 3. Re-seed the database
cd C:\Users\Anjella\Downloads\v0-bookstore-management-system
node scripts/seed-data.js

# 4. Start app
npm run dev
```

If `Get-Service` says "Cannot find service", MongoDB needs to be installed as a service (see Option A or B above).

---

## ✅ Success Indicators

- [ ] `Get-Service -Name MongoDB` shows "Running"
- [ ] MongoDB Compass connects to `localhost:27017`
- [ ] Can see "bookstore" database in Compass
- [ ] `node scripts/seed-data.js` completes successfully
- [ ] App starts without MongoDB connection errors
- [ ] Can browse books at http://localhost:3000

Good luck! 🚀
