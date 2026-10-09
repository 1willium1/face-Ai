/**
 * crawl_events.js — ดึงโพสต์หมวด "ภาพกิจกรรม" (events, category id 4)
 * จาก WordPress REST API ของ dusit.ac.th ทั้งหมด
 *
 * วิธีใช้:
 *   node scripts/crawl_events.js                  // เก็บ URL โพสต์ทั้งหมด + ขูดรูป 200 โพสต์ล่าสุด
 *   node scripts/crawl_events.js --max-posts 500   // ขูดรูป 500 โพสต์ล่าสุด
 *   node scripts/crawl_events.js --skip 200 --max-posts 300  // ดึงต่อ: ข้าม 200 แรก ขูด 300 ถัดไป (รวมกับของเดิม)
 *   node scripts/crawl_events.js --urls-only       // เก็บแค่รายการ URL โพสต์ (เร็ว, ~296 requests)
 *   node scripts/crawl_events.js --all             // ขูดรูปทุกโพสต์ (29k+, นานมาก)
 *
 * ผลลัพธ์:
 *   URLDR.events.txt               — URL โพสต์ทั้งหมดในหมวด events
 *   src/data/activities_events.json — กิจกรรมใหม่ (แยกไฟล์ ไม่แตะ activities.json ชุด frozen วิจัย)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const API = 'https://www.dusit.ac.th/home/wp-json/wp/v2/posts';
const CATEGORY_ID = 4; // ภาพกิจกรรม
const PER_PAGE = 100;
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' };

const args = process.argv.slice(2);
const urlsOnly = args.includes('--urls-only');
const scrapeAll = args.includes('--all');
let maxPosts = 200;
let skipPosts = 0;
const mp = args.find(a => a.startsWith('--max-posts'));
if (mp) {
  const v = parseInt(mp.split('=')[1] || args[args.indexOf(mp) + 1], 10);
  if (!isNaN(v) && v > 0) maxPosts = v;
}
const sk = args.find(a => a.startsWith('--skip'));
if (sk) {
  const v = parseInt(sk.split('=')[1] || args[args.indexOf(sk) + 1], 10);
  if (!isNaN(v) && v > 0) skipPosts = v;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const total = parseInt(res.headers.get('X-WP-Total') || '0', 10);
  const pages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
  return { data: await res.json(), total, pages };
}

async function fetchPageHtml(url) {
  try {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// regex เดียวกับ scrape_activities.js
function extractImages(html) {
  const images = [];
  const hrefRe = /href=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|JPG|JPEG|PNG))["']/g;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    if (m[1].includes('/uploads/') || m[1].includes('/gallery/')) images.push(m[1]);
  }
  const srcRe = /src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|JPG|JPEG|PNG))["']/g;
  while ((m = srcRe.exec(html)) !== null) {
    if ((m[1].includes('/uploads/') || m[1].includes('/gallery/')) &&
        !m[1].includes('logo') && !m[1].includes('avatar') && !m[1].includes('banner')) images.push(m[1]);
  }
  return Array.from(new Set(images));
}

function stripTags(s) {
  return (s || '').replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  // 1. เก็บรายการโพสต์ทั้งหมดผ่าน REST API (เร็ว: 296 requests ได้ 29k โพสต์)
  console.log('[1/3] Collecting post URLs from WP REST API...');
  const first = await fetchJson(`${API}?categories=${CATEGORY_ID}&per_page=${PER_PAGE}&page=1&_fields=id,date,link,title`);
  console.log(`Total posts: ${first.total}, pages: ${first.pages}`);
  let posts = [...first.data];
  for (let p = 2; p <= first.pages; p++) {
    const r = await fetchJson(`${API}?categories=${CATEGORY_ID}&per_page=${PER_PAGE}&page=${p}&_fields=id,date,link,title`);
    posts.push(...r.data);
    if (p % 30 === 0) console.log(`  ...page ${p}/${first.pages} (${posts.length} posts)`);
  }
  // ใหม่สุดก่อน
  posts.sort((a, b) => b.date.localeCompare(a.date));
  const urlsPath = path.join(ROOT, 'URLDR.events.txt');
  fs.writeFileSync(urlsPath, posts.map(p => p.link).join('\n'), 'utf8');
  console.log(`Saved ${posts.length} post URLs -> ${urlsPath}`);

  if (urlsOnly) return;

  // 2. ขูดรูปจากโพสต์ล่าสุด N โพสต์ (ข้าม skipPosts ตัวแรกถ้าระบุ = ดึงต่อรอบก่อน)
  const targets = scrapeAll ? posts : posts.slice(skipPosts, skipPosts + maxPosts);
  console.log(`[2/3] Scraping images from ${targets.length} posts (skip=${scrapeAll ? 0 : skipPosts})...`);
  const activities = [];
  let i = 0;
  for (const p of targets) {
    i++;
    const html = await fetchPageHtml(p.link);
    if (!html) continue;
    const imgs = extractImages(html);
    if (imgs.length === 0) continue;
    const urlYear = (p.link.match(/\/home\/(\d{4})\//) || [])[1];
    const yearBE = urlYear ? parseInt(urlYear, 10) + 543 : 2567;
    activities.push({
      id: `evt-${p.id}`,
      year: yearBE,
      images: imgs,
      date: p.date ? p.date.slice(0, 10) : 'ไม่ระบุวันที่',
      title: stripTags(p.title?.rendered) || 'กิจกรรม มหาวิทยาลัยสวนดุสิต',
      context: '',
      what: stripTags(p.title?.rendered) || '',
      where: 'มหาวิทยาลัยสวนดุสิต',
      how: '',
      sourceUrls: [p.link],
    });
    if (i % 25 === 0) console.log(`  ...${i}/${targets.length} posts, ${activities.length} with images`);
    await new Promise(r => setTimeout(r, 50));
  }

  // 3. เขียนไฟล์แยก (ไม่แตะ activities.json ชุด frozen) — รวมกับของเดิม กันซ้ำด้วย id
  const outPath = path.join(ROOT, 'src', 'data', 'activities_events.json');
  let merged = activities;
  try {
    if (fs.existsSync(outPath)) {
      const old = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      const seen = new Set(activities.map(a => a.id));
      merged = [...activities];
      for (const a of old) {
        if (!seen.has(a.id)) { merged.push(a); seen.add(a.id); }
      }
      console.log(`Merged with existing file: ${old.length} old + ${activities.length} new = ${merged.length} total`);
    }
  } catch (e) {
    console.warn('Could not merge existing file, overwriting:', e.message);
  }
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
  const imgTotal = merged.reduce((s, a) => s + a.images.length, 0);
  console.log(`[3/3] Saved ${merged.length} activities, ${imgTotal} images -> ${outPath}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
