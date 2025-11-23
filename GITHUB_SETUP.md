# GitHub Setup Guide

Your project is now ready to push to GitHub! Follow these steps:

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `dev-ai` (or any name you prefer)
   - **Description**: "Multi-Model AI Chat Interface"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

### Option A: If you haven't created the repo yet
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Option B: If you already created the repo with a README
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Step 3: Replace Placeholders

Replace:
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

## Example Commands

If your username is `sunnydev` and repo name is `dev-ai`:

```bash
git remote add origin https://github.com/sunnydev/dev-ai.git
git branch -M main
git push -u origin main
```

## Authentication

When you push, GitHub will ask for authentication:
- **Personal Access Token** (recommended): Use a token instead of password
- Or use **GitHub CLI** (`gh auth login`)

## Quick Commands Reference

```bash
# Check current remote (after adding)
git remote -v

# Push changes
git push

# Pull latest changes
git pull

# Check status
git status
```

## Troubleshooting

### If you get "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### If you need to update the remote URL
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

---

**Your project is committed and ready! Just create the GitHub repo and run the push commands above.**



