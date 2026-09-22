# Complete Deployment Guide: Hetzner Cloud & cPanel Node.js Environment

This guide provides end-to-end production deployment steps for the **9Xen Regulettee Full-Stack Platform** (Express + React + Vite + SQLite/Cloud SQL) on **Hetzner Cloud VPS/Dedicated Servers** and **cPanel Node.js (Phusion Passenger)** hosting.

---

## Part 1: Hetzner Cloud Deployment Guide (Ubuntu 22.04 / 24.04 LTS)

Hetzner Cloud provides cost-effective, high-performance cloud servers (CX22, CPX21, or Dedicated Root Servers).

### Step 1: Server Provisioning & Initial Setup
1. Log in to [Hetzner Cloud Console](https://console.hetzner.cloud/) and create a project.
2. Launch a Server:
   - **Location**: Falkenstein (EU), Nuremberg (EU), or Ashburn (US).
   - **OS**: Ubuntu 24.04 LTS or 22.04 LTS.
   - **Type**: Shared vCPU (CPX21 - 3 vCPU, 4 GB RAM) or Dedicated vCPU.
3. SSH into your server:
   ```bash
   ssh root@<YOUR_HETZNER_SERVER_IP>
   ```
4. Update packages and configure basic firewall (`ufw`):
   ```bash
   apt update && apt upgrade -y
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

### Step 2: Install Node.js 20 LTS & PM2
Install Node.js via NodeSource repository:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs build-essential git nginx certbot python3-certbot-nginx

# Install PM2 Process Manager globally
npm install -g pm2
```

### Step 3: Clone Project & Configure Environment
1. Clone your project repository into `/var/www/`:
   ```bash
   cd /var/www
   git clone <YOUR_GIT_REPOSITORY_URL> 9xen-regulettee
   cd 9xen-regulettee
   ```
2. Create production `.env` file:
   ```bash
   nano .env
   ```
   Add production variables:
   ```env
   NODE_ENV=production
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_IDLE_TIMEOUT_MINUTES=15
   DATABASE_URL=file:./sqlite.db
   ```
3. Install dependencies & build production assets:
   ```bash
   npm install
   npm run build
   ```
   *Note: `npm run build` runs `vite build` for frontend static assets into `dist/` and compiles `server.ts` into a self-contained `dist/server.cjs` bundle via esbuild.*

### Step 4: Configure PM2 Process Manager
Create a PM2 configuration file `ecosystem.config.cjs` in the project root:
```javascript
module.exports = {
  apps: [
    {
      name: "9xen-regulettee",
      script: "dist/server.cjs",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log"
    }
  ]
};
```
Start application and save startup configuration:
```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Step 5: Configure Nginx & Let's Encrypt SSL
1. Create Nginx site configuration:
   ```bash
   nano /etc/nginx/sites-available/9xen-regulettee
   ```
2. Add the reverse proxy configuration:
   ```nginx
   server {
       server_name regulettee.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           client_max_body_size 50M;
       }
   }
   ```
3. Enable configuration and test Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/9xen-regulettee /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```
4. Obtain free SSL certificate via Let's Encrypt:
   ```bash
   certbot --nginx -d regulettee.yourdomain.com
   ```

---

## Part 2: cPanel Node.js Environment Deployment (Phusion Passenger)

cPanel uses **Phusion Passenger** to serve Node.js applications.

### Step 1: Prepare Code Structure
Ensure your project contains an entry file named `app.js` in the project root to load the compiled server:
```javascript
// app.js - cPanel Passenger Entry Point
require('./dist/server.cjs');
```

### Step 2: Upload Files to cPanel
1. Log in to cPanel File Manager or SSH terminal.
2. Upload and extract your application directory outside `public_html` or inside a dedicated folder (e.g. `/home/username/apps/9xen-regulettee`).

### Step 3: Setup Node.js App in cPanel UI
1. In cPanel, navigate to **Software** -> **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version**: Choose `20.x` or `18.x`.
   - **Application mode**: `Production`.
   - **Application root**: `apps/9xen-regulettee` (relative to `/home/username/`).
   - **Application URL**: `regulettee.yourdomain.com` or `yourdomain.com`.
   - **Application startup file**: `app.js`.
3. Click **Create**.

### Step 4: Set Environment Variables
In the cPanel Node.js Application management panel, scroll down to **Environment Variables**:
- `NODE_ENV`: `production`
- `PORT`: `3000`
- `GEMINI_API_KEY`: `your_gemini_key`
- `VITE_IDLE_TIMEOUT_MINUTES`: `15`

### Step 5: Install Dependencies & Build in cPanel Terminal
Copy the virtual environment path command shown at the top of cPanel Node.js UI (e.g., `source /home/username/nodevenv/apps/9xen-regulettee/20/bin/activate`).
Enter cPanel **Terminal** or SSH:
```bash
source /home/username/nodevenv/apps/9xen-regulettee/20/bin/activate
cd /home/username/apps/9xen-regulettee
npm install
npm run build
```

### Step 6: Configure `.htaccess` for Phusion Passenger
cPanel automatically generates or manages `.htaccess` in your domain directory. Ensure `.htaccess` points to Passenger:
```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/username/apps/9xen-regulettee"
PassengerBaseURI "/"
PassengerNodejs "/home/username/nodevenv/apps/9xen-regulettee/20/bin/node"
PassengerAppType node
PassengerStartupFile app.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

### Step 7: Restart Application
In cPanel **Setup Node.js App**, click **Restart Application**.
Enable SSL under cPanel **SSL/TLS Status** (AutoSSL).

---

## Troubleshooting & Verification Checklist
1. **Health Verification**: Test `GET https://yourdomain.com/api/health` -> Should return `{"status":"ok"}`.
2. **Engine Metrics**: Test `GET https://yourdomain.com/api/v1/engine/status` -> Verify SQLite & Subsystems status.
3. **Log Files**:
   - Hetzner PM2: `pm2 logs 9xen-regulettee`
   - cPanel: Check `stderr.log` inside `/home/username/apps/9xen-regulettee/` or cPanel error logs.
