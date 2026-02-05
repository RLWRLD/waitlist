# RLWRLD Homepage Mock-up

A complete website mock-up for RLWRLD built with the RLDX-web design system (dark theme, mint color palette, Inter font).

## 🎨 Design System

- **Colors**:
  - Primary: #50EACE (mint)
  - Background: #0a0a0a (dark)
  - Text: #e8e8e8
- **Typography**: Inter font family
- **Style**: Minimalist, Figure.ai-inspired conciseness
- **Layout**: Responsive (desktop, tablet, mobile)

## 📁 Project Structure

```
RLWRLD-homepage/
├── index.html                    # Homepage
├── about-us.html                 # About Us page
├── business.html                 # Business page
├── lab.html                      # Lab Index page
├── careers.html                  # Careers page
├── contact.html                  # Contact Form page
├── news.html                     # News Index page
├── news/                         # Individual news pages
│   ├── 15m-seed-funding.html
│   ├── aws-gaia-accelerator.html
│   └── honda-partnership.html
├── lab/                          # Individual lab content pages
│   └── research.html             # Published papers list
├── css/
│   └── styles.css                # Global styles (based on RLDX-web)
├── js/
│   └── script.js                 # Common JavaScript
├── assets/
│   ├── logos/                    # Logo files (to be added)
│   └── images/                   # Images (to be added)
└── README.md                     # This file
```

## 📄 Pages

### Homepage (`index.html`)
- Hero Section: "We Build Foundation Models for Real-World Robotics"
- RLDX Preview (links to existing RLDX product page)
- News Preview (latest 3 news cards)
- Business Preview (partners)
- LAB Preview
- Careers Preview
- Contact CTA
- Footer

### About Us (`about-us.html`)
- How We're Different (Software-First, Real-World Data, Five-Finger Mastery)
- Our Team (Leadership, Research)
- Milestones (Seed Funding, AWS, Partnerships, Technical Breakthroughs)

### Business (`business.html`)
- How We Work (RX, PoC, LaaS)
- Industries (Manufacturing, Logistics, Services)
- Our Partners (BMW, KDDI, LG, etc.)

### Lab (`lab.html`)
- Category filter (All, Research, Whitepaper, Blog, Podcast)
- Content cards
- Link to `/lab/research` (published papers)

### Careers (`careers.html`)
- Open Roles (Research, Engineering, Product, Operations)
- Why RLWRLD (Real Deployment, Team, Location)
- CTA to external job platform

### Contact (`contact.html`)
- Contact form with fields:
  - First Name, Last Name, Email, Phone
  - Job Title, Company
  - Inquiry Type dropdown (Customer, Partnership, Investor, Media, General)
  - Message textarea

### News (`news.html`)
- Category filter (Investment, Partnership, Awards, etc.)
- News cards grid
- Individual news pages:
  - `/news/15m-seed-funding.html`
  - `/news/aws-gaia-accelerator.html`
  - `/news/honda-partnership.html`

### Lab Research (`lab/research.html`)
- Published papers organized by year
- Paper details: title, conference, date, description, link

## 🎨 Components

### CSS Components
- Card components (news cards, lab content cards)
- Category filters (tabs)
- CTA buttons (primary, secondary, large)
- Contact form (inputs, selects, textarea)
- Callout boxes (gradient background)
- Insight boxes (secondary background)
- Partner logos section
- Breadcrumb navigation
- Progress bar
- Sticky header
- Footer

### JavaScript Features
- Reading progress bar
- Smooth scroll navigation
- Category filter functionality (Lab, News pages)

## 🚀 Usage

1. **Open the homepage**:
   ```
   open index.html
   ```

2. **Navigate between pages** using the header navigation

3. **Note**:
   - Image placeholders are shown as black boxes (no actual images included)
   - Logo assets should be added to `assets/logos/`
   - Form submissions are not functional (no backend)
   - External links point to actual RLWRLD resources

## 📝 Content Source

All content is based on `/Users/jacey/Library/Mobile Documents/iCloud~md~obsidian/Documents/junhob/0.RLWRLD/1_strategy/Homepage_ideation.md`

## 🔗 Related Projects

- **RLDX Product Page**: `/Users/jacey/workspace.cloud/RLDX-web/` (separate project)
- Link from homepage RLDX Preview: `https://rldx.rlwrld.ai` (or update to actual URL)

## 🎯 Design Philosophy

- **Conciseness**: Figure.ai-style minimalism
- **Dark theme**: Professional, modern aesthetic
- **Responsive**: Works on all screen sizes
- **Accessibility**: Focus states, reduced motion support
- **Performance**: Lightweight, fast loading

---

## 🗄️ Waitlist Backend (Supabase)

The waitlist form (`/rlwrld/waitlist.html`) stores submissions in Supabase.

### Setup Instructions

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Name: `rlwrld-waitlist`
   - Region: `Northeast Asia (Seoul)`
   - Set a database password and save it

3. **Create Waitlist Table**
   - Go to SQL Editor
   - Run this query:
   ```sql
   create table waitlist (
     id bigint primary key generated always as identity,
     created_at timestamptz default now(),
     email text not null,
     full_name text,
     organization text,
     country text,
     social_profile text,
     form_data jsonb
   );

   -- Prevent duplicate emails
   create unique index waitlist_email_unique on waitlist(email);

   -- Allow public inserts
   alter table waitlist enable row level security;

   create policy "Anyone can insert" on waitlist
     for insert with check (true);
   ```

4. **Get API Credentials**
   - Go to Project Settings > API
   - Copy `Project URL` and `anon public` key
   - Update these values in `waitlist.html`:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

5. **View Submissions**
   - Go to Table Editor > waitlist
   - Export as CSV if needed

---

**Created**: 2025-10-31
**Design System**: Based on RLDX-web
**Framework**: Vanilla HTML/CSS/JS (no dependencies)
