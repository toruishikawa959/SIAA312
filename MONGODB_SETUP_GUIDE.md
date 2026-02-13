# MongoDB Setup Guide

Your friend is getting this error because MongoDB is not running on their computer.

## ⚡ QUICK FIX - If MongoDB Compass is Already Installed

If MongoDB Compass is installed, MongoDB is likely already on the computer but just not running!

### Windows - Start MongoDB:

**Step 1: Check if MongoDB service exists:**
```powershell
Get-Service -Name MongoDB*
```

**If service NOT found (error message), try these options:**

#### Option A: Find and Run mongod.exe manually

1. **Search for MongoDB installation:**
   ```powershell
   # Search for mongod.exe
   Get-ChildItem -Path C:\ -Filter mongod.exe -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
   ```

2. **Common MongoDB locations:**
   - `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`
   - `C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe`
   - `C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe`

3. **Once found, create a data directory:**
   ```powershell
   mkdir C:\data\db
   ```

4. **Start MongoDB manually (keep this terminal open):**
   ```powershell
   # Replace with your actual path
   & "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
   ```

5. **Open a NEW PowerShell window, then:**
   ```powershell
   cd C:\Users\Anjella\Downloads\v0-bookstore-management-system
   node scripts/seed-data.js
   npm run dev
   ```

#### Option B: Use MongoDB Atlas (Cloud) - EASIEST!

Since MongoDB isn't properly installed as a service, using the cloud is simpler:

1. Go to: https://www.mongodb.com/cloud/atlas/register (free!)
2. Create a free M0 cluster
3. Create database user & whitelist IP (0.0.0.0/0)
4. Get connection string
5. Update `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bookstore?retryWrites=true&w=majority
   ```
6. Run:
   ```bash
   node scripts/seed-data.js
   npm run dev
   ```

#### Option C: Reinstall MongoDB Community Server

1. Download from: https://www.mongodb.com/try/download/community
2. Run installer
3. **IMPORTANT:** Check "Install MongoDB as a Service" during installation
4. After install, MongoDB will run automatically

### Mac - Start MongoDB Service:

```bash
brew services start mongodb-community
# or if that doesn't work:
mongod --config /usr/local/etc/mongod.conf --fork
```

---

## Other Solutions

If the quick fix above doesn't work, try these:

## ✅ Solution 1: Use MongoDB Atlas (Cloud) - RECOMMENDED

This is the easiest option and doesn't require installing anything locally.

### Steps:

1. **Create a FREE MongoDB Atlas account:**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up (it's free!)

2. **Create a Cluster:**
   - Click "Build a Database"
   - Select "M0 FREE" tier
   - Choose a cloud provider and region (any is fine)
   - Click "Create Cluster"

3. **Create Database User:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `bookstore_user`
   - Password: Create a secure password (save it!)
   - Database User Privileges: Select "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP Address:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String:**
   - Go back to "Database" (left sidebar)
   - Click "Connect" button on your cluster
   - Select "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`)

6. **Update .env.local file:**
   ```env
   MONGODB_URI=mongodb+srv://bookstore_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bookstore?retryWrites=true&w=majority
   ```
   Replace:
   - `bookstore_user` with your username
   - `YOUR_PASSWORD` with your actual password
   - `cluster0.xxxxx` with your actual cluster address

7. **Seed the Database:**
   ```bash
   node scripts/seed-data.js
   ```

---

## 🔧 Solution 2: Install MongoDB Locally

If your friend wants to run MongoDB on their computer:

### For Windows:

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download the Windows MSI installer
   - Run the installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Click "Install"

2. **Verify Installation:**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name MongoDB
   
   # If not running, start it
   Start-Service -Name MongoDB
   ```

3. **Keep the current .env.local:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookstore
   ```

4. **Seed the Database:**
   ```bash
   node scripts/seed-data.js
   ```

### For Mac:

1. **Install using Homebrew:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

2. **Start MongoDB:**
   ```bash
   brew services start mongodb-community@7.0
   ```

3. **Keep the current .env.local:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookstore
   ```

4. **Seed the Database:**
   ```bash
   node scripts/seed-data.js
   ```

---

## 🚀 After Setup

Once MongoDB is connected (either cloud or local):

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Seed the database:**
   ```bash
   node scripts/seed-data.js
   ```

3. **Start the application:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Visit:** http://localhost:3000

---

## 🔍 Troubleshooting

### Error: "MONGODB_URI is not defined"
- Make sure `.env.local` file exists in the root folder
- Restart the development server after changing `.env.local`

### Error: "Authentication failed"
- Double-check username and password in connection string
- Make sure you replaced `<password>` with actual password (remove `<` and `>`)

### Error: "IP not whitelisted" (Atlas only)
- Go to Network Access in MongoDB Atlas
- Add your current IP address or use `0.0.0.0/0` for development

### MongoDB service won't start (Windows)
```powershell
# Run as Administrator
sc start MongoDB
```

---

## 📝 Notes

- **For production:** Always use MongoDB Atlas or another cloud database
- **For development:** Either option works, but Atlas is easier to set up
- The free tier of MongoDB Atlas includes 512MB storage, which is more than enough for this bookstore app
