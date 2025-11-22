# CORAH Dashboard

A production-ready AI calling & booking control panel built with Next.js.

## Features

- **Dual Role System**: Admin (full CRUD) and User (read-only) access
- **Google Sheets Integration**: Manage call and lead data
- **Google Calendar Integration**: Schedule and manage appointments
- **Real-time Analytics**: Charts and metrics for calls, leads, and appointments
- **Premium UI**: Minimal, clean design with Framer Motion animations

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- Google APIs (Sheets & Calendar)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add your CORAH logo**:
   - Place `corah-logo.png` in the `/public` directory

3. **Configure environment variables**:
   - All environment variables are already set in `.env.local`
   - Passwords:
     - Admin: `admin123`
     - User: `user123`

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Navigate to `http://localhost:3000`
   - Choose Admin or User view
   - Enter the password

## Project Structure

```
corah/
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── user/           # User dashboard pages
│   ├── api/            # API routes
│   └── page.tsx        # Landing page with password gate
├── components/
│   ├── ui/             # shadcn/ui components
│   └── dashboard/      # Dashboard layout
├── lib/
│   ├── googleClient.ts # Google OAuth client
│   ├── sheets.ts       # Google Sheets helpers
│   ├── calendar.ts     # Google Calendar helpers
│   └── utils.ts        # Utility functions
└── public/
    └── corah-logo.png  # Your logo (add this)
```

## Pages

### Admin Dashboard
- **Overview**: Metrics, charts, and upcoming events
- **Data**: CRUD operations for calls/leads + embedded Google Sheet
- **Appointments**: Calendar with full CRUD + embedded Google Calendar
- **Business Info**: Edit company information

### User Dashboard
- **Overview**: Read-only metrics and charts
- **Data**: Read-only table + published Google Sheet
- **Appointments**: Read-only calendar + embedded Google Calendar
- **Business Info**: Read-only company information

## Color Scheme

- Background: `#F8F6F2` (cream)
- Primary: `#000000` (black)
- Secondary: `#2A2A2A` (charcoal)
- Borders: `rgba(0,0,0,0.05)`

## Build

```bash
npm run build
npm start
```

## License

Private - CORAH Dashboard
