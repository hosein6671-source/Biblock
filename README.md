# 🚀 Biblock - ربات فروش V2Ray خودکار

سیستم کامل و خودکار برای فروش سرویس V2Ray از طریق ربات تلگرام با پشتیبانی 3x-ui و NowPayments

## 📋 مشخصات پروژه

- **Backend API:** NestJS + PostgreSQL
- **Telegram Bot:** Python (aiogram)
- **پرداخت:** NowPayments (USDT, BTC, TRX)
- **پنل V2Ray:** 3x-ui
- **استقرار:** Docker + docker-compose

## 🏗️ ساختار پروژه

```
Biblock/
├── backend/                 # NestJS API
├── telegram-bot/            # Python Bot
├── database/                # Migrations & Scripts
├── docker-compose.yml       # Docker Setup
├── .env.example            # Environment Variables
└── docs/                    # Documentation
```

## 🚀 شروع سریع

### نیازمندی‌ها
- Docker & Docker Compose
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+

### نصب و اجرا

```bash
# 1. Clone Repository
git clone https://github.com/hosein6671-source/Biblock.git
cd Biblock

# 2. Setup Environment
cp .env.example .env
# ویرایش .env با اطلاعات خود

# 3. Start Services
docker-compose up -d

# 4. Database Migration
docker-compose exec backend npm run migrate
```

## 🔑 متغیرهای محیطی

تمام متغیرها در فایل `.env.example` موجود است.

## 📚 مستندات

- [Backend API Docs](./docs/API.md)
- [Telegram Bot Guide](./docs/BOT.md)
- [NowPayments Integration](./docs/PAYMENTS.md)
- [3x-ui Integration](./docs/X3UI.md)
- [Database Schema](./docs/DATABASE.md)

## 🎯 ویژگی‌ها

✅ فروش خودکار و بدون نیاز به اپراتور
✅ پرداخت کریپتویی (USDT, BTC, TRX)
✅ سرویس‌دهی فوری بعد از پرداخت
✅ مدیریت اشتراک‌ها و تمدید خودکار
✅ پنل ادمین داخل تلگرام
✅ آمار مفصل برای ادمین
✅ سیستم لاگ کامل
✅ امنیت بالا (JWT, Rate Limit)
