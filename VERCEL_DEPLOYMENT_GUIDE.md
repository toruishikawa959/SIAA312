# 🚀 Deploy to Vercel - Free Hosting Guide

## Prerequisites
- GitHub account (already done ✓)
- Vercel account (free)
- MongoDB Atlas account (free) - or use local MongoDB

---

## Step 1: Prepare Your Environment Variables

Before deploying, you need to gather these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
DB_NAME=bookstore
PAYMONGO_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=your_email@domain.com
```

### How to get these:

1. **MONGODB_URI**: If using MongoDB Atlas:
   - Go to MongoDB Atlas → your cluster → Connect → Drivers
   - Copy the connection string
   - Replace `<password>` with your database password

2. **PAYMONGO_SECRET_KEY**: 
   - Go to PayMongo dashboard
   - Get your test API key from settings

3. **RESEND_API_KEY**:
   - Go to resend.com
   - Sign up and get your API key (free for development)

4. **NEXT_PUBLIC_BASE_URL**: 
   - Will be your Vercel app URL after deployment (e.g., `https://your-app.vercel.app`)

---

## Step 2: Deploy to Vercel

### Option A: Deploy from Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign up** with your GitHub account
3. **Click "Add New..."** → Project
4. **Import your repository**: Select `toruishikawa959/SIAA312`
5. **Configure Project**:
   - Framework Preset: `Next.js`
   - Build Command: `next build` (or leave blank)
   - Output Directory: `.next` (or leave blank)
6. **Environment Variables**: Add the variables from Step 1
7. **Click "Deploy"**!

### Option B: Deploy from Vercel CLI

```
bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project
cd d:/siaa12/v0-bookstore-management-system

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts. Add environment variables when asked.

---

## Step 3: Update Environment Variables After Deployment

After your first deployment, you'll get a Vercel URL (e.g., `https://your-app.vercel.app`).

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL
3. Redeploy (click "Redeploy" on the Deployments tab)

---

## Step 4: Configure MongoDB Atlas (if using Atlas)

If using MongoDB Atlas:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Enter `0.0.0.0/0` (allows access from Vercel)
4. Click Confirm

---

## Step 5: Test Your Deployment

Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Catalog page shows books
- [ ] User registration works
- [ ] Login works
- [ ] Cart functionality works

---

## Important Notes

### Free Tier Limits (Vercel)
- **Bandwidth**: 100 GB/month
- **Build minutes**: 6,000 minutes/month
- **Serverless functions**: 100 hours/month
- **SSL**: Free (automatic)

### For Production
- Add a custom domain (costs ~$10-15/year)
- Upgrade to Vercel Pro for more resources (optional)

---

## Troubleshooting

### "MongoDB connection failed"
- Check your MONGODB_URI is correct
- Make sure MongoDB Atlas Network Access allows 0.0.0.0/0

### "Payment not working"
- Make sure NEXT_PUBLIC_BASE_URL matches your Vercel URL exactly
- Check PayMongo keys are correct

### "Emails not sending"
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for delivery status

---

## Good luck! 🎉
