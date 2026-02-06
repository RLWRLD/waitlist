# Supabase Setup Guide — RLDX Waitlist

## Overview

- **Target**: Global audience (waitlist for RLDX early access)
- **Data approach**: Key columns + JSONB for full form data
- **Security**: Insert-only public access via RLS (Row Level Security)
- **Frontend**: Vanilla JS, Supabase REST API (no SDK needed)

---

## Step 1: Create Supabase Account & Project

1. Go to https://supabase.com and sign up (GitHub login available)
2. Click **"New Project"**
3. Configure:
   - **Project name**: `rlwrld-waitlist`
   - **Database password**: Set and save securely (you won't see this again)
   - **Region**: Choose based on your primary audience
     - Global: `US East (N. Virginia)` — good default for worldwide latency
     - If mainly Asia: `Northeast Asia (Seoul)` or `Southeast Asia (Singapore)`
4. Wait for project to finish provisioning (~2 minutes)

---

## Step 2: Create the Waitlist Table

Go to **SQL Editor** in the Supabase dashboard and run:

```sql
-- 1. Create the waitlist table
create table public.waitlist (
  id bigint primary key generated always as identity,
  created_at timestamptz default now(),
  email text not null,
  full_name text,
  organization text,
  country text,
  social_profile text,
  form_data jsonb
);

-- 2. Add comment for clarity
comment on table public.waitlist is 'RLDX Early Access waitlist submissions';

-- 3. Prevent duplicate emails
create unique index waitlist_email_unique on public.waitlist (email);

-- 4. Add index on created_at for sorting
create index waitlist_created_at_idx on public.waitlist (created_at desc);
```

### Column Reference

| Column | Type | Description |
|---|---|---|
| `id` | bigint (auto) | Primary key |
| `created_at` | timestamptz | Submission timestamp (auto) |
| `email` | text, unique | Registrant email (dedup key) |
| `full_name` | text | Full name |
| `organization` | text | Company / university |
| `country` | text | Country code (US, KR, JP, etc.) |
| `social_profile` | text, nullable | X or LinkedIn URL |
| `form_data` | jsonb | **All form responses as JSON** |

### What goes into `form_data`

The JSONB column stores the entire form submission including all nested/conditional fields:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "organization": "MIT",
  "country": "US",
  "socialProfile": "https://x.com/janedoe",
  "affiliation": "academic",
  "academicRole": "professor",
  "communities": ["lerobot", "ros"],
  "robotAccess": "own",
  "robotType": ["single_arm", "dexterous_hand"],
  "robotBrand": ["franka", "ur"],
  "simAccess": "rtx4080_plus",
  "useCase": ["benchmark", "finetune"],
  "applications": ["bin_picking", "assembly", "tool_use"],
  "shareWilling": "yes",
  "shareType": ["content", "testimonial"],
  "eventAttendance": "us_inperson",
  "referralSource": "social"
}
```

Conditional fields only appear when relevant (e.g., `academicRole` only exists when `affiliation` = `"academic"`).

---

## Step 3: Security — Row Level Security (RLS)

Run in SQL Editor:

```sql
-- 1. Enable RLS on the table
alter table public.waitlist enable row level security;

-- 2. Allow anyone to INSERT (submit the form)
create policy "Allow public insert"
  on public.waitlist
  for insert
  with check (true);

-- 3. NO select/update/delete policies = blocked for anon users
-- Data can only be viewed via Supabase Dashboard or service_role key
```

### Security Notes

| Action | Public (anon key) | Dashboard / service_role |
|---|---|---|
| INSERT | Allowed | Allowed |
| SELECT | **Blocked** | Allowed |
| UPDATE | **Blocked** | Allowed |
| DELETE | **Blocked** | Allowed |

- The `anon` key is safe to expose in frontend HTML — it can only insert
- Never expose the `service_role` key in frontend code
- All data viewing/export should be done via Supabase Dashboard (Table Editor)

---

## Step 4: Get API Credentials

1. Go to **Project Settings** > **API**
2. Copy these two values:

| Key | Where to find | Example |
|---|---|---|
| **Project URL** | Under "Project URL" | `https://abcdefg.supabase.co` |
| **anon public key** | Under "Project API keys" > `anon` `public` | `eyJhbGciOiJIUzI1...` |

---

## Step 5: Frontend Integration Code

Replace the existing `form.addEventListener('submit', ...)` block in `waitlist.html` with:

```javascript
// ============================================
// Supabase Configuration
// ============================================
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';   // ← Replace
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';               // ← Replace

// ============================================
// Form Validation
// ============================================
function validateForm() {
    const missing = [];

    // Text / email fields
    if (!document.getElementById('fullName').value.trim()) missing.push('Full Name');
    if (!document.getElementById('email').value.trim()) missing.push('Email');
    if (!document.getElementById('organization').value.trim()) missing.push('Organization');
    if (!document.getElementById('country').value) missing.push('Country');

    // Radio button groups (required)
    if (!document.querySelector('input[name="affiliation"]:checked')) missing.push('Organization Type');
    if (!document.querySelector('input[name="robotAccess"]:checked')) missing.push('Robot Access');
    if (!document.querySelector('input[name="simAccess"]:checked')) missing.push('Simulation Environment');
    if (!document.querySelector('input[name="shareWilling"]:checked')) missing.push('Share Experience');
    if (!document.querySelector('input[name="eventAttendance"]:checked')) missing.push('Event Attendance');
    if (!document.querySelector('input[name="referralSource"]:checked')) missing.push('How did you hear about RLDX');

    // Checkbox groups (at least 1 required)
    if (!document.querySelector('input[name="useCase"]:checked')) missing.push('What do you want to do with RLDX');
    if (!document.querySelector('input[name="applications"]:checked')) missing.push('Tasks you are interested in');

    return missing;
}

// ============================================
// Form Submission Handler
// ============================================
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate
    const missingFields = validateForm();
    if (missingFields.length > 0) {
        alert('Please fill in the following required fields:\n\n• ' + missingFields.join('\n• '));
        return;
    }

    // Disable button to prevent double submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Collect all form data
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    });

    try {
        // Send to Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                email: data.email,
                full_name: data.fullName,
                organization: data.organization,
                country: data.country,
                social_profile: data.socialProfile || null,
                form_data: data
            })
        });

        if (response.ok) {
            // Success
            form.style.display = 'none';
            successMessage.classList.add('visible');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (response.status === 409) {
            // Duplicate email
            alert('This email is already on the waitlist!');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Submission failed:', error);
        alert('Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});
```

---

## Step 6: Querying Data (Dashboard & SQL)

### View all submissions
```sql
select * from waitlist order by created_at desc;
```

### Filter by country
```sql
select * from waitlist where country = 'US';
```

### Filter by affiliation type (inside JSONB)
```sql
select * from waitlist
where form_data->>'affiliation' = 'academic';
```

### Filter by specific robot brand (JSONB array contains)
```sql
select * from waitlist
where form_data->'robotBrand' ? 'franka';
```

### Count by country
```sql
select country, count(*) from waitlist
group by country order by count desc;
```

### Export
- Go to **Table Editor** > **waitlist** > click **Export** (CSV)
- Or use the SQL results download button

---

## Step 7: Domain & Deployment (When Ready)

### Hosting Options
Since this is a single HTML file + assets:
- **GitHub Pages**: Free, easy, supports custom domains
- **Vercel**: Free tier, auto-deploy from GitHub
- **Netlify**: Free tier, drag-and-drop deploy
- **Cloudflare Pages**: Free, global CDN

### Custom Domain Setup
1. Purchase/configure your domain (e.g., `rldx.rlwrld.ai` or `waitlist.rlwrld.ai`)
2. Point DNS to your hosting provider
3. In Supabase Dashboard:
   - Go to **Authentication** > **URL Configuration**
   - Add your domain to **Site URL** and **Redirect URLs**
   - This prevents CORS issues in production

### CORS Notes
- Supabase allows requests from any origin by default for REST API
- If you experience CORS issues, check Supabase Dashboard > API Settings
- For production, consider restricting allowed origins

---

## Checklist

- [ ] Supabase account created
- [ ] Project created (note region choice)
- [ ] Waitlist table created (Step 2 SQL)
- [ ] RLS policies applied (Step 3 SQL)
- [ ] API credentials copied (Project URL + anon key)
- [ ] `waitlist.html` updated with Supabase code (Step 5)
- [ ] Local test: submit form and verify data appears in Supabase Table Editor
- [ ] Domain connected (when ready)
- [ ] Final test on production domain
