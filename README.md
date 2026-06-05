# AURA EXPRESS AFRICA LTD - Backend API

## Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials:
   - `DATABASE_URL` - Your Supabase connection string
   - `SMTP_*` - Email configuration (Gmail with App Password recommended)
   - `ADMIN_EMAIL` - Email to receive quote notifications

3. **Run database migrations**
   Execute `database/schema.sql` in Supabase SQL Editor

4. **Start server**
   ```bash
   npm run dev   # Development with auto-reload
   npm start     # Production
   ```

## API Endpoints

### Quotes
- `POST /api/quotes` - Submit quote request
- `GET /api/quotes` - List all quotes (admin)
- `GET /api/quotes/:id` - Get single quote
- `PATCH /api/quotes/:id` - Update quote status

### Contact
- `POST /api/contact` - Send contact message
- `GET /api/contact` - List all messages (admin)
- `PATCH /api/contact/:id` - Update message status

### Health
- `GET /api/health` - Server health check

## Email Setup (Gmail)
1. Enable 2-Step Verification on your Google account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use your Gmail as SMTP_USER and App Password as SMTP_PASS
