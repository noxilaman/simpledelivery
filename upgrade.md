# SimpleDelivery — Upgrade & Redeploy Guide

เอกสารนี้อธิบายขั้นตอนการ redeploy แอปบน Production Server หลังจาก push code ใหม่ขึ้น GitHub

---

## สารบัญ

1. [Upgrade ปกติ (โค้ดเปลี่ยน ไม่มี Migration)](#1-upgrade-ปกติ-โค้ดเปลี่ยน-ไม่มี-migration)
2. [Upgrade พร้อม Database Migration](#2-upgrade-พร้อม-database-migration)
3. [Upgrade พร้อม Dependency เปลี่ยน](#3-upgrade-พร้อม-dependency-เปลี่ยน)
4. [Rollback](#4-rollback)
5. [ตรวจสอบหลัง Upgrade](#5-ตรวจสอบหลัง-upgrade)
6. [Upgrade Script อัตโนมัติ](#6-upgrade-script-อัตโนมัติ)

---

## 1. Upgrade ปกติ (โค้ดเปลี่ยน ไม่มี Migration)

ใช้เมื่อแก้ไข UI, logic, หรือ API route แต่ไม่มีการเปลี่ยน `prisma/schema.prisma`

```bash
cd /var/www/simpledelivery

# 1. ดึงโค้ดล่าสุด
git pull origin main

# 2. Build ใหม่
npm run build

# 3. Restart app (zero-downtime reload)
pm2 restart simpledelivery

# 4. ตรวจสอบสถานะ
pm2 status
pm2 logs simpledelivery --lines 20
```

---

## 2. Upgrade พร้อม Database Migration

ใช้เมื่อไฟล์ `prisma/schema.prisma` หรือ `prisma/migrations/` มีการเปลี่ยนแปลง

> **สำรองข้อมูลก่อนเสมอ** ก่อนรัน migration

```bash
cd /var/www/simpledelivery

# 1. สำรองฐานข้อมูลก่อน
mysqldump -u sdapp -p simple_delivery | gzip > ~/backups/pre_upgrade_$(date +%Y%m%d_%H%M%S).sql.gz

# 2. ดึงโค้ดล่าสุด
git pull origin main

# 3. ติดตั้ง dependency (กรณีมีเพิ่ม)
npm ci --omit=dev

# 4. Generate Prisma Client ใหม่
npx prisma generate

# 5. รัน Migration
npx prisma migrate deploy

# 6. Build ใหม่
npm run build

# 7. Restart app
pm2 restart simpledelivery

# 8. ตรวจสอบสถานะ
pm2 status
pm2 logs simpledelivery --lines 20
```

---

## 3. Upgrade พร้อม Dependency เปลี่ยน

ใช้เมื่อ `package.json` หรือ `package-lock.json` มีการเปลี่ยนแปลง (เพิ่ม/ลบ/อัปเดต package)

```bash
cd /var/www/simpledelivery

# 1. ดึงโค้ดล่าสุด
git pull origin main

# 2. ติดตั้ง dependency ใหม่ตาม lock file
npm ci --omit=dev

# 3. Generate Prisma Client (ถ้ามี migration ให้รัน migrate deploy ด้วย)
npx prisma generate

# 4. Build ใหม่
npm run build

# 5. Restart app
pm2 restart simpledelivery

# 6. ตรวจสอบสถานะ
pm2 status
pm2 logs simpledelivery --lines 20
```

---

## 4. Rollback

### 4.1 Rollback โค้ด

```bash
cd /var/www/simpledelivery

# ดู commit ก่อนหน้า
git log --oneline -10

# ย้อนกลับไป commit ที่ต้องการ (แทน COMMIT_HASH ด้วย hash จริง)
git checkout COMMIT_HASH

# Build และ restart
npm run build
pm2 restart simpledelivery
```

กลับมาที่ branch หลักเมื่อพร้อม:

```bash
git checkout main
```

### 4.2 Rollback Database จาก Backup

```bash
# หยุด app ชั่วคราว
pm2 stop simpledelivery

# Restore จากไฟล์ backup (แทนชื่อไฟล์ให้ถูกต้อง)
gunzip < ~/backups/pre_upgrade_YYYYMMDD_HHMMSS.sql.gz | mysql -u sdapp -p simple_delivery

# เริ่ม app อีกครั้ง
pm2 start simpledelivery
pm2 logs simpledelivery --lines 20
```

---

## 5. ตรวจสอบหลัง Upgrade

```bash
# สถานะ process
pm2 status

# Log realtime (กด Ctrl+C เพื่อออก)
pm2 logs simpledelivery

# ทดสอบ HTTP response
curl -I https://yourdomain.com

# ตรวจสอบ migration ที่รันแล้ว
npx prisma migrate status
```

**Checklist หลัง Upgrade:**
- [ ] `pm2 status` แสดง `online`
- [ ] เปิด `https://yourdomain.com` ได้ปกติ
- [ ] Login เข้า merchant dashboard ได้
- [ ] ฟีเจอร์ที่แก้ไขทำงานถูกต้อง

---

## 6. Upgrade Script อัตโนมัติ

สร้าง script สำหรับ upgrade ทั่วไป (ไม่มี migration):

```bash
nano ~/upgrade.sh
```

```bash
#!/bin/bash
set -e

APP_DIR="/var/www/simpledelivery"
LOG="$HOME/upgrade_$(date +%Y%m%d_%H%M%S).log"

echo "=== Upgrade started: $(date) ===" | tee -a "$LOG"

cd "$APP_DIR"

echo "[1/4] git pull..." | tee -a "$LOG"
git pull origin main 2>&1 | tee -a "$LOG"

echo "[2/4] npm ci..." | tee -a "$LOG"
npm ci --omit=dev 2>&1 | tee -a "$LOG"

echo "[3/4] prisma generate + migrate..." | tee -a "$LOG"
npx prisma generate 2>&1 | tee -a "$LOG"
npx prisma migrate deploy 2>&1 | tee -a "$LOG"

echo "[4/4] build + restart..." | tee -a "$LOG"
npm run build 2>&1 | tee -a "$LOG"
pm2 restart simpledelivery 2>&1 | tee -a "$LOG"

echo "=== Upgrade done: $(date) ===" | tee -a "$LOG"
pm2 status
```

```bash
chmod +x ~/upgrade.sh
```

รัน upgrade:

```bash
~/upgrade.sh
```

Log จะถูกบันทึกไว้ที่ `~/upgrade_YYYYMMDD_HHMMSS.log` ทุกครั้ง

---

## ตารางสรุปว่าใช้ขั้นตอนไหน

| สิ่งที่เปลี่ยน | ขั้นตอนที่ใช้ |
|--------------|-------------|
| UI / Component / Style | [ข้อ 1](#1-upgrade-ปกติ-โค้ดเปลี่ยน-ไม่มี-migration) |
| API Route / Business Logic | [ข้อ 1](#1-upgrade-ปกติ-โค้ดเปลี่ยน-ไม่มี-migration) |
| `prisma/schema.prisma` หรือ migration ใหม่ | [ข้อ 2](#2-upgrade-พร้อม-database-migration) |
| `package.json` / `package-lock.json` | [ข้อ 3](#3-upgrade-พร้อม-dependency-เปลี่ยน) |
| ทุกอย่าง (ไม่แน่ใจ) | [ข้อ 2](#2-upgrade-พร้อม-database-migration) ครอบคลุมทุกกรณี |
