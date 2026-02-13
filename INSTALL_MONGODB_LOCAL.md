# 🔧 Install MongoDB Locally - Step by Step

## Download and Install MongoDB Community Server

### Step 1: Download MongoDB

1. **Go to:** https://www.mongodb.com/try/download/community
2. **Select:**
   - Version: `7.0.x (current)` or latest
   - Platform: `Windows`
   - Package: `msi`
3. **Click "Download"**

### Step 2: Install MongoDB

1. **Run the downloaded `.msi` file**
2. **Setup Type:** Choose "Complete"
3. **Service Configuration:** 
   - ✅ **CHECK: "Install MongoDB as a Service"** (IMPORTANT!)
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data\`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log\`
   - ✅ CHECK: "Run service as Network Service user"
4. **MongoDB Compass:**
   - You can uncheck this since it's already installed
5. **Click "Install"**
6. **Wait for installation to complete**
7. **Click "Finish"**

### Step 3: Verify MongoDB is Running

Open PowerShell and run:

```powershell
Get-Service -Name MongoDB
```

Should show:
```
Status   Name               DisplayName
------   ----               -----------
Running  MongoDB            MongoDB
```

If it shows "Stopped", start it:

```powershell
Start-Service -Name MongoDB
```

### Step 4: Test MongoDB Connection

Open MongoDB Compass and connect to:
```
mongodb://localhost:27017
```

You should see a successful connection!

### Step 5: Setup Your Project

1. **Make sure `.env.local` has:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookstore
   DB_NAME=bookstore
   ```

2. **Navigate to project:**
   ```powershell
   cd C:\Users\Anjella\Downloads\v0-bookstore-management-system
   ```

3. **Install dependencies (if not already done):**
   ```powershell
   npm install
   ```

4. **Seed the database:**
   ```powershell
   node scripts/seed-data.js
   ```

   You should see output like:
   ```
   ✅ Connected to MongoDB
   ✅ Seeded X books
   ✅ Seeded X users
   ✅ Database seeded successfully
   ```

5. **Start the application:**
   ```powershell
   npm run dev
   ```

6. **Visit:** http://localhost:3000

---

## 🔍 Troubleshooting

### Problem: Service won't start

**Solution 1 - Run as Administrator:**
```powershell
# Right-click PowerShell → "Run as Administrator"
Start-Service -Name MongoDB
```

**Solution 2 - Check if port 27017 is in use:**
```powershell
netstat -ano | findstr :27017
```
If something else is using port 27017, you need to stop that process.

**Solution 3 - Manually create data directory:**
```powershell
mkdir "C:\data\db"
```

### Problem: "mongod.exe" not found

Add MongoDB to PATH:
1. Open System Properties → Environment Variables
2. Edit "Path" variable
3. Add: `C:\Program Files\MongoDB\Server\7.0\bin`
4. Click OK
5. Restart PowerShell

### Problem: Service installed but won't start

Try manual start:
```powershell
# Create data directory
mkdir C:\data\db

# Run MongoDB manually
& "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

Keep that terminal open (MongoDB is running), then open a NEW PowerShell window:
```powershell
cd C:\Users\Anjella\Downloads\v0-bookstore-management-system
node scripts/seed-data.js
npm run dev
```

---

## 📋 Quick Reference

**Check if MongoDB is running:**
```powershell
Get-Service -Name MongoDB
```

**Start MongoDB:**
```powershell
Start-Service -Name MongoDB
```

**Stop MongoDB:**
```powershell
Stop-Service -Name MongoDB
```

**Restart MongoDB:**
```powershell
Restart-Service -Name MongoDB
```

**Check MongoDB logs:**
```powershell
Get-Content "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -Tail 50
```

---

## 🎯 After Installation

Your `.env.local` should be:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/bookstore

# Database Name
DB_NAME=bookstore

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# PayMongo Configuration (Test Keys)
PAYMONGO_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3001

RESEND_API_KEY=re_SCeeePk5_BPxyepV3u4ELTzVxFMRmEgdD
RESEND_FROM_EMAIL=onboarding@resend.dev
```

MongoDB will now run automatically when Windows starts!

---

## ✅ Success Checklist

- [ ] MongoDB Community Server downloaded and installed
- [ ] "Install MongoDB as a Service" was checked during installation
- [ ] Service shows "Running" when you check
- [ ] MongoDB Compass can connect to `localhost:27017`
- [ ] `.env.local` has correct `MONGODB_URI`
- [ ] Database seeded successfully with `node scripts/seed-data.js`
- [ ] App runs with `npm run dev`
- [ ] Can access http://localhost:3000

Good luck! 🚀
