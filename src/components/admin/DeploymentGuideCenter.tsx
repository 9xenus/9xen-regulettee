import React, { useState } from 'react';
import { Server, Terminal, Copy, Check, ShieldCheck, Globe, Cpu, BookOpen, Layers, ExternalLink, HardDrive, AlertTriangle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const DeploymentGuideCenter: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'hetzner' | 'cpanel' | 'docker'>('hetzner');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    showToast('Deployment command copied to clipboard', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const hetznerSteps = [
    {
      title: '1. Update Server & Firewall Setup',
      desc: 'Provision Ubuntu 24.04/22.04 LTS on Hetzner Cloud and open essential ingress ports.',
      code: `ssh root@<YOUR_HETZNER_IP>
apt update && apt upgrade -y
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable`
    },
    {
      title: '2. Install Node.js 20 LTS, PM2 & Nginx',
      desc: 'Install NodeSource Node.js 20 runtime, PM2 process cluster manager, and Nginx web server.',
      code: `curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs build-essential git nginx certbot python3-certbot-nginx
npm install -g pm2`
    },
    {
      title: '3. Clone Codebase & Build Engine',
      desc: 'Clone repository to /var/www/, create production .env file, install dependencies, and build dist/ bundles.',
      code: `cd /var/www
git clone <YOUR_GIT_REPOSITORY_URL> 9xen-regulettee
cd 9xen-regulettee
npm install
npm run build`
    },
    {
      title: '4. Start Process Cluster with PM2',
      desc: 'Create PM2 ecosystem.config.cjs configuration and configure automatic systemd startup.',
      code: `cat << 'EOF' > ecosystem.config.cjs
module.exports = {
  apps: [{
    name: "9xen-regulettee",
    script: "dist/server.cjs",
    instances: "max",
    exec_mode: "cluster",
    env: { NODE_ENV: "production", PORT: 3000 }
  }]
};
EOF

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup`
    },
    {
      title: '5. Configure Nginx Reverse Proxy & SSL',
      desc: 'Setup Nginx reverse proxy to port 3000 and issue Let\'s Encrypt SSL certificate.',
      code: `cat << 'EOF' > /etc/nginx/sites-available/9xen-regulettee
server {
    server_name regulettee.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/9xen-regulettee /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d regulettee.yourdomain.com`
    }
  ];

  const cpanelSteps = [
    {
      title: '1. Create Application in cPanel UI',
      desc: 'In cPanel, open "Setup Node.js App" -> Click "Create Application". Select Node.js 20.x, Mode: Production, App Root: apps/9xen-regulettee, Startup File: app.js.',
      code: `# Configured via cPanel UI "Setup Node.js App"`
    },
    {
      title: '2. Upload Codebase & Setup app.js Wrapper',
      desc: 'Ensure root contains app.js wrapper for Phusion Passenger loader.',
      code: `// app.js
require('./dist/server.cjs');`
    },
    {
      title: '3. Set Environment Variables in cPanel',
      desc: 'In cPanel Node.js app environment variables settings, add:',
      code: `NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_key_here
VITE_IDLE_TIMEOUT_MINUTES=15`
    },
    {
      title: '4. Activate Node Virtual Environment & Build',
      desc: 'Run cPanel virtual environment command in cPanel Terminal to install packages and compile.',
      code: `source /home/username/nodevenv/apps/9xen-regulettee/20/bin/activate
cd /home/username/apps/9xen-regulettee
npm install
npm run build`
    },
    {
      title: '5. Phusion Passenger .htaccess Routing',
      desc: 'Ensure domain root .htaccess contains CloudLinux/Passenger configuration block:',
      code: `# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/username/apps/9xen-regulettee"
PassengerBaseURI "/"
PassengerNodejs "/home/username/nodevenv/apps/9xen-regulettee/20/bin/node"
PassengerAppType node
PassengerStartupFile app.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END`
    }
  ];

  const dockerSteps = [
    {
      title: '1. Multi-Stage Dockerfile',
      desc: 'Build lightweight standalone container for Cloud Run, Hetzner Docker or AWS ECS.',
      code: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`
    },
    {
      title: '2. Docker Compose Deployment',
      desc: 'Run with docker-compose on Hetzner or any Linux VPS.',
      code: `version: '3.8'
services:
  regulettee:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: always`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Hetzner Cloud & cPanel Deployment Center
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Production Verified
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Step-by-step guides, PM2 cluster scripts, and Phusion Passenger configurations for hosting 9Xen Regulettee.
              </p>
            </div>
          </div>

          {/* Tab Switchers */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('hetzner')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'hetzner'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Hetzner Cloud VPS
            </button>
            <button
              onClick={() => setActiveTab('cpanel')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cpanel'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              cPanel Node.js App
            </button>
            <button
              onClick={() => setActiveTab('docker')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'docker'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Docker Container
            </button>
          </div>
        </div>
      </div>

      {/* Guide Content Steps */}
      <div className="space-y-4">
        {(activeTab === 'hetzner' ? hetznerSteps : activeTab === 'cpanel' ? cpanelSteps : dockerSteps).map((step, idx) => (
          <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
              </div>
              <button
                onClick={() => copyToClipboard(step.code, `${activeTab}-${idx}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border border-slate-700 shrink-0"
              >
                {copiedIndex === `${activeTab}-${idx}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800/90 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed scrollbar-thin">
              {step.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
