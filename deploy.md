# SimpleDelivery — Production Deployment Guide

เอกสารนี้ครอบคลุมการติดตั้งแบบ Clean ตั้งแต่ต้นบน Ubuntu สำหรับใช้งาน Production จริง  
ไม่มี demo data — ร้านค้าสมัครเองผ่านหน้า `/merchant/register`

---

## สารบัญ

1. [ข้อกำหนดเบื้องต้น](#1-ข้อกำหนดเบื้องต้น)
2. [เตรียม Server (OS)](#2-เตรียม-server-os)
3. [Security Hardening](#3-security-hardening)
4. [ติดตั้ง Runtime และ Services](#4-ติดตั้ง-runtime-และ-services)
5. [ตั้งค่า MySQL](#5-ตั้งค่า-mysql)
6. [Clone โค้ดจาก GitHub](#6-clone-โค้ดจาก-github)
7. [Build และ Deploy แอป](#7-build-และ-deploy-แอป)
8. [ตั้งค่า PM2 (Process Manager)](#8-ตั้งค่า-pm2-process-manager)
9. [ตั้งค่า Nginx (Reverse Proxy)](#9-ตั้งค่า-nginx-reverse-proxy)
10. [SSL/TLS ด้วย Let's Encrypt](#10-ssltls-ด้วย-lets-encrypt)
11. [ตั้งค่า Firewall](#11-ตั้งค่า-firewall)
12. [ตรวจสอบและ Maintenance](#12-ตรวจสอบและ-maintenance)

---

## 1. ข้อกำหนดเบื้องต้น

| รายการ | รายละเอียด |
|--------|-----------|
| OS | Ubuntu 22.04 LTS หรือ 24.04 LTS |
| RAM | ขั้นต่ำ 1 GB (แนะนำ 2 GB+) |
| Disk | ขั้นต่ำ 20 GB |
| CPU | 1 vCPU ขึ้นไป |
| Domain | ชี้ A record มาที่ IP ของ server แล้ว |
| GitHub | URL repository ของโปรเจกต์นี้ |

---

## 2. เตรียม Server (OS)

### 2.1 อัปเดต OS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
```

### 2.2 ตั้ง Timezone

```bash
sudo timedatectl set-timezone Asia/Bangkok
timedatectl status
```

### 2.3 ตั้ง Hostname

```bash
sudo hostnamectl set-hostname simpledelivery
```

### 2.4 สร้าง User สำหรับรัน App (ห้ามรันด้วย root)

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

สลับมาใช้ user `deploy` สำหรับขั้นตอนที่เหลือทั้งหมด:

```bash
su - deploy
```

---

## 3. Security Hardening

### 3.1 SSH Key Authentication (ทำบน local machine ก่อน)

```bash
# สร้าง key บน local machine
ssh-keygen -t ed25519 -C "deploy@simpledelivery"

# คัดลอก public key ไปที่ server
ssh-copy-id deploy@YOUR_SERVER_IP
```

### 3.2 Harden SSH Config

```bash
sudo nano /etc/ssh/sshd_config
```

แก้ไขหรือเพิ่มค่าต่อไปนี้:

```
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
AllowTcpForwarding no
```

```bash
sudo systemctl restart ssh
```

> **ทดสอบ** เปิด terminal ใหม่และ SSH เข้าก่อนปิด session เดิมเสมอ

### 3.3 ติดตั้ง Fail2Ban

```bash
sudo apt install fail2ban -y

sudo tee /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = ssh
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3.4 ติดตั้ง Unattended Security Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 4. ติดตั้ง Runtime และ Services

### 4.1 ติดตั้ง Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # ควรแสดง v20.x.x
npm -v
```

### 4.2 ติดตั้ง PM2

```bash
sudo npm install -g pm2
```

### 4.3 ติดตั้ง Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.4 ติดตั้ง MySQL 8

```bash
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo systemctl start mysql
```

---

## 5. ตั้งค่า MySQL

### 5.1 Secure MySQL

```bash
sudo mysql_secure_installation
```

ตอบคำถาม:
- Validate password: **Y** → เลือก level 1 (MEDIUM)
- Remove anonymous users: **Y**
- Disallow root login remotely: **Y**
- Remove test database: **Y**
- Reload privilege tables: **Y**

### 5.2 สร้าง Database และ User

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE simple_delivery
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'sdapp'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';

GRANT ALL PRIVILEGES ON simple_delivery.* TO 'sdapp'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

> แทน `STRONG_PASSWORD_HERE` ด้วย password ที่แข็งแกร่ง (ใช้ตัวพิมพ์ใหญ่/เล็ก/ตัวเลข/สัญลักษณ์ อย่างน้อย 16 ตัวอักษร)

---

## 6. Clone โค้ดจาก GitHub

### 6.1 ติดตั้ง Git และ Clone

```bash
sudo apt install git -y

sudo mkdir -p /var/www/simpledelivery
sudo chown deploy:deploy /var/www/simpledelivery

git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/simpledelivery
cd /var/www/simpledelivery
```

> แทน URL ด้วย GitHub repository จริงของโปรเจกต์

### 6.2 สร้างไฟล์ `.env`

```bash
cp .env.example .env
nano .env
```

กรอกค่าจริงทั้งหมด:

```env
DATABASE_URL="mysql://sdapp:STRONG_PASSWORD_HERE@localhost:3306/simple_delivery"

# สร้าง secret ด้วยคำสั่ง: openssl rand -hex 32
JWT_SECRET="PASTE_64_CHAR_HEX_STRING_HERE"

# ใส่ domain จริง (ต้องมี https:// ถ้ามี SSL แล้ว)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

สร้าง JWT_SECRET:

```bash
openssl rand -hex 32
```

### 6.3 ป้องกันไฟล์ `.env`

```bash
chmod 600 .env
```

---

## 7. Build และ Deploy แอป

### 7.1 ติดตั้ง Dependencies

```bash
npm ci --omit=dev
```

> ใช้ `npm ci` แทน `npm install` เพื่อให้ได้ version ตรงกับ `package-lock.json`

### 7.2 Generate Prisma Client

```bash
npx prisma generate
```

### 7.3 Run Database Migrations (ไม่ Seed)

```bash
npx prisma migrate deploy
```

> คำสั่งนี้รัน migration ที่มีอยู่แล้วเท่านั้น **ไม่** รัน seed ดังนั้นไม่มี demo data

### 7.4 สร้าง Upload Directories

```bash
mkdir -p public/uploads/menus
mkdir -p public/uploads/slips
mkdir -p public/uploads/shops
chmod -R 755 public/uploads
```

### 7.5 Build Next.js

```bash
npm run build
```

การ build สำเร็จจะแสดง output ของ Route และ Bundle size

---

## 8. ตั้งค่า PM2 (Process Manager)

### 8.1 สร้าง PM2 Config

```bash
nano /var/www/simpledelivery/ecosystem.config.js
```

```js
module.exports = {
  apps: [
    {
      name: "simpledelivery",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/simpledelivery",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/pm2/simpledelivery-error.log",
      out_file: "/var/log/pm2/simpledelivery-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "512M",
    },
  ],
};
```

```bash
sudo mkdir -p /var/log/pm2
sudo chown deploy:deploy /var/log/pm2
```

### 8.2 เริ่มต้น App ด้วย PM2

```bash
pm2 start ecosystem.config.js
pm2 save
```

### 8.3 ตั้ง PM2 ให้ Start อัตโนมัติเมื่อ Reboot

```bash
pm2 startup
# คัดลอกคำสั่งที่แสดงออกมา แล้วรัน (เป็น sudo command)
pm2 save
```

### 8.4 ตรวจสอบสถานะ

```bash
pm2 status
pm2 logs simpledelivery --lines 50
```

---

## 9. ตั้งค่า Nginx (Reverse Proxy)

### 9.1 สร้าง Nginx Config

```bash
sudo nano /etc/nginx/sites-available/simpledelivery
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect www to non-www
    if ($host = www.yourdomain.com) {
        return 301 https://yourdomain.com$request_uri;
    }

    # ขนาดสูงสุดสำหรับอัปโหลดสลิปและรูปเมนู
    client_max_body_size 10M;

    location / {
        proxy_pass          http://127.0.0.1:3000;
        proxy_http_version  1.1;
        proxy_set_header    Upgrade          $http_upgrade;
        proxy_set_header    Connection       'upgrade';
        proxy_set_header    Host             $host;
        proxy_set_header    X-Real-IP        $remote_addr;
        proxy_set_header    X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;
        proxy_cache_bypass  $http_upgrade;
    }

    # Serve upload files โดยตรงผ่าน Nginx (ประสิทธิภาพดีกว่า)
    location /uploads/ {
        alias /var/www/simpledelivery/public/uploads/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Block access to sensitive files
    location ~ /\.(env|git|gitignore) {
        deny all;
        return 404;
    }
}
```

### 9.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/simpledelivery /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t        # ทดสอบ config
sudo systemctl reload nginx
```

---

## 10. SSL/TLS ด้วย Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com \
  --non-interactive --agree-tos -m admin@yourdomain.com
```

Certbot จะแก้ไข Nginx config ให้อัตโนมัติ รวม redirect HTTP → HTTPS

### ตรวจสอบ Auto-Renewal

```bash
sudo certbot renew --dry-run
```

Certificate จะต่ออายุอัตโนมัติทุก 60 วันผ่าน systemd timer

### อัปเดต `.env` ให้ใช้ HTTPS

```bash
nano /var/www/simpledelivery/.env
# แก้ NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

Rebuild:

```bash
cd /var/www/simpledelivery
npm run build
pm2 restart simpledelivery
```

---

## 11. ตั้งค่า Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

sudo ufw enable
sudo ufw status verbose
```

ผลลัพธ์ที่ถูกต้อง:

```
Status: active
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

> Port 3000 (Next.js) **ปิด** จากภายนอก เข้าได้เฉพาะผ่าน Nginx เท่านั้น

---

## 12. ตรวจสอบและ Maintenance

### ตรวจสอบหลัง Deploy

```bash
# สถานะ process
pm2 status

# Log แบบ realtime
pm2 logs simpledelivery

# ทดสอบ HTTP response
curl -I https://yourdomain.com
```

### Update โค้ดเมื่อมีการ Push ใหม่

```bash
cd /var/www/simpledelivery

git pull origin main

npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy

npm run build

pm2 restart simpledelivery
pm2 save
```

### Backup Database

```bash
# สำรองข้อมูล
mysqldump -u sdapp -p simple_delivery | gzip > ~/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# ตั้ง cron backup ทุกวันเวลาตี 2
crontab -e
# เพิ่มบรรทัด:
0 2 * * * mysqldump -u sdapp -pSTRONG_PASSWORD_HERE simple_delivery | gzip > ~/backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Log Files

| Service | Path |
|---------|------|
| Next.js stdout | `/var/log/pm2/simpledelivery-out.log` |
| Next.js stderr | `/var/log/pm2/simpledelivery-error.log` |
| Nginx access | `/var/log/nginx/access.log` |
| Nginx error | `/var/log/nginx/error.log` |
| MySQL | `/var/log/mysql/error.log` |

### Health Check Checklist

- [ ] `https://yourdomain.com` เปิดได้ และ HTTPS ใช้งานได้
- [ ] หน้า `/merchant/register` สมัครบัญชีร้านใหม่ได้
- [ ] Login ที่ `/merchant/login` เข้าได้
- [ ] อัปโหลดรูปเมนูได้ และรูปแสดงในหน้าร้าน
- [ ] ลูกค้าสั่งอาหารและอัปโหลดสลิปได้
- [ ] ร้านค้าตรวจสอบและเปลี่ยนสถานะออเดอร์ได้
- [ ] `pm2 status` แสดง `online` ไม่มี `errored`
- [ ] Firewall: Port 3000 เข้าจากภายนอกไม่ได้

---

## สรุปขั้นตอนแบบย่อ

```
OS Update → สร้าง User → SSH Hardening → Fail2Ban
→ ติดตั้ง Node.js / Nginx / MySQL
→ สร้าง DB + User
→ Clone GitHub → .env → npm ci → prisma migrate deploy → npm build
→ PM2 start → Nginx config → Certbot SSL → UFW Firewall
```
