#!/usr/bin/env node

/**
 * RLDX Waitlist — Supabase Daily Backup
 *
 * Fetches all waitlist data from Supabase and saves to
 * sync/backups/YYYY-MM-DD/waitlist.json
 *
 * After backup, auto-commits and pushes to git.
 *
 * Usage: node backup-supabase.js
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ============================================
// Configuration
// ============================================
const configPath = path.join(__dirname, 'sync-config.json');
if (!fs.existsSync(configPath)) {
  console.error('Missing sync-config.json. Copy sync-config.example.json and fill in your keys.');
  process.exit(1);
}
const CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================
// Helpers
// ============================================

/** Get today's date in KST (YYYY-MM-DD) */
function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

/** Run a git command in project root */
function git(cmd) {
  return execSync(`git ${cmd}`, { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
}

// ============================================
// Supabase — Fetch all waitlist rows
// ============================================

async function fetchSupabaseRows() {
  const res = await fetch(
    `${CONFIG.supabase.url}/rest/v1/waitlist?select=*&order=created_at.asc`,
    {
      headers: {
        'apikey': CONFIG.supabase.serviceRoleKey,
        'Authorization': `Bearer ${CONFIG.supabase.serviceRoleKey}`,
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ============================================
// Backup
// ============================================

async function backup() {
  const dateStr = getTodayKST();
  console.log(`Supabase Backup — ${dateStr}`);
  console.log('='.repeat(40));

  // Fetch data
  console.log('\nFetching Supabase rows...');
  const rows = await fetchSupabaseRows();
  console.log(`  Found ${rows.length} total submissions.`);

  // Save to backup directory
  const backupDir = path.join(__dirname, 'backups', dateStr);
  fs.mkdirSync(backupDir, { recursive: true });

  const backupData = {
    meta: {
      date: dateStr,
      timestamp: new Date().toISOString(),
      totalRows: rows.length,
    },
    rows,
  };

  const backupPath = path.join(backupDir, 'waitlist.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`  Saved to ${path.relative(PROJECT_ROOT, backupPath)}`);

  return { dateStr, totalRows: rows.length, backupPath };
}

// ============================================
// Git commit & push
// ============================================

function commitAndPush({ dateStr, totalRows }) {
  console.log('\nGit commit & push...');

  // Stage backup files
  git('add sync/backups/');

  // Check if there are staged changes
  const diff = git('diff --cached --name-only');
  if (!diff) {
    console.log('  No changes to commit. Skipping.');
    return;
  }

  // Commit
  const msg = `backup: ${dateStr} waitlist data (${totalRows} rows)`;
  git(`commit -m "${msg}"`);
  console.log(`  Committed: ${msg}`);

  // Push
  git('push');
  console.log('  Pushed to remote.');
}

// ============================================
// Main
// ============================================

async function main() {
  const result = await backup();
  commitAndPush(result);
  console.log('\nDone!');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
