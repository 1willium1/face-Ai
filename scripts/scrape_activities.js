import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const urlsFile = path.join(__dirname, '..', 'URLDR.Witcha.txt');
const rawText = fs.readFileSync(urlsFile, 'utf8');

// Parse all URLs from file
const rawUrls = rawText
  .split(/\s+/)
  .map(u => u.trim())
  .filter(u => u.length > 0 && u.startsWith('http'));

// Clean and deduplicate URLs
const uniqueUrls = Array.from(new Set(rawUrls));

console.log(`Found ${uniqueUrls.length} unique URLs to process.`);

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.status}`);
      return null;
    }
    const html = await res.text();
    return html;
  } catch (err) {
    console.error(`Error fetching ${url}: ${err.message}`);
    return null;
  }
}

function extractImages(html) {
  const images = [];
  
  const imgHrefRegex = /href=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|JPG|JPEG|PNG))["']/g;
  let match;
  while ((match = imgHrefRegex.exec(html)) !== null) {
    const imgUrl = match[1];
    if (imgUrl.includes('/uploads/') || imgUrl.includes('/gallery/')) {
      images.push(imgUrl);
    }
  }

  const imgSrcRegex = /src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|JPG|JPEG|PNG))["']/g;
  while ((match = imgSrcRegex.exec(html)) !== null) {
    const imgUrl = match[1];
    if ((imgUrl.includes('/uploads/') || imgUrl.includes('/gallery/')) && 
        !imgUrl.includes('logo') && !imgUrl.includes('avatar') && !imgUrl.includes('banner')) {
      images.push(imgUrl);
    }
  }

  return Array.from(new Set(images));
}

function extractTitle(html) {
  const h1Match = html.match(/<h1[^>]*class=["'][^"']*(?:entry-title|post-title|title)[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                  html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]+>/g, '').trim();
  }
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].replace(/[-|].*$/, '').replace(/<[^>]+>/g, '').trim();
  }
  return 'กิจกรรม มหาวิทยาลัยสวนดุสิต';
}

function extractDate(html, url) {
  const timeMatch = html.match(/<time[^>]*class=["'][^"']*entry-date[^"']*["'][^>]*>([\s\S]*?)<\/time>/i) ||
                    html.match(/class=["'][^"']*(?:post-date|entry-date|date)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div|p|time)>/i);
  if (timeMatch) {
    const dateText = timeMatch[1].replace(/<[^>]+>/g, '').trim();
    if (dateText.length > 3) return dateText;
  }

  const urlYearMatch = url.match(/\/home\/(\d{4})\//);
  if (urlYearMatch) {
    const yearAD = parseInt(urlYearMatch[1]);
    const yearBE = yearAD + 543;
    return `ปี พ.ศ. ${yearBE}`;
  }

  return 'ไม่ระบุวันที่';
}

function parseYearBE(url, dateStr) {
  const urlYearMatch = url.match(/\/home\/(\d{4})\//);
  if (urlYearMatch) {
    const yearAD = parseInt(urlYearMatch[1]);
    return yearAD + 543;
  }
  
  const beMatch = dateStr.match(/\b(25\d{2})\b/);
  if (beMatch) return parseInt(beMatch[1]);

  const adMatch = dateStr.match(/\b(20\d{2})\b/);
  if (adMatch) return parseInt(adMatch[1]) + 543;

  return 2567;
}

function extractContent(html) {
  const contentMatch = html.match(/<div[^>]*class=["'][^"']*(?:entry-content|post-content|content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (contentMatch) {
    let text = contentMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length > 300) text = text.substring(0, 300) + '...';
    return text;
  }
  return '';
}

async function main() {
  const grouped = new Map();

  for (const url of uniqueUrls) {
    const match = url.match(/\/home\/(\d{4})\/(\d+)\.html/);
    let key = url;
    if (match) {
      key = `${match[1]}-${match[2]}`;
    }

    if (!grouped.has(key)) {
      grouped.set(key, { mainUrl: url, urls: [] });
    }
    grouped.get(key).urls.push(url);
  }

  console.log(`Grouped into ${grouped.size} distinct activities.`);

  const activities = [];
  let index = 1;

  for (const [key, group] of grouped.entries()) {
    console.log(`[${index}/${grouped.size}] Scraping activity ${key}... (${group.urls.length} pages)`);
    index++;

    let title = '';
    let dateStr = '';
    let contextStr = '';
    let allImages = [];
    let yearBE = 2567;

    for (const url of group.urls) {
      const html = await fetchPage(url);
      if (!html) continue;

      if (!title) {
        title = extractTitle(html);
      }
      if (!dateStr) {
        dateStr = extractDate(html, url);
        yearBE = parseYearBE(url, dateStr);
      }
      if (!contextStr) {
        contextStr = extractContent(html);
      }

      const pageImages = extractImages(html);
      allImages.push(...pageImages);
    }

    allImages = Array.from(new Set(allImages));

    if (allImages.length === 0) {
      allImages.push('https://www.dusit.ac.th/home/wp-content/uploads/2020/08/1.jpg');
    }

    if (!title || title.includes('404') || title.includes('Page Not Found')) {
      title = `กิจกรรม มหาวิทยาลัยสวนดุสิต (${key})`;
    }

    if (!contextStr) {
      contextStr = `การเข้าร่วมกิจกรรมและการดำเนินงานของมหาวิทยาลัยสวนดุสิต (${dateStr})`;
    }

    activities.push({
      id: key,
      year: yearBE,
      images: allImages,
      date: dateStr,
      title: title,
      context: contextStr,
      what: title,
      where: 'มหาวิทยาลัยสวนดุสิต',
      how: 'เข้าร่วมกิจกรรมและดำเนินงานตามภารกิจของมหาวิทยาลัย',
      sourceUrls: group.urls
    });


    await new Promise(r => setTimeout(r, 50));
  }

  activities.sort((a, b) => b.year - a.year || b.id.localeCompare(a.id));

  console.log(`Scraped total ${activities.length} activities.`);

  // Write JSON Database file
  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'activities.json');
  fs.writeFileSync(jsonPath, JSON.stringify(activities, null, 2), 'utf8');
  console.log(`Successfully generated JSON database: ${jsonPath}`);

  // Write TypeScript Database file with Helper Query Functions
  const tsContent = `/**
 * Database of Dusit Activities and Events
 * Organized by Year (พ.ศ.), Category, Images, and Metadata
 */

export interface Activity {
  id: string;
  year: number; // ปี พ.ศ.
  date: string;
  title: string;
  context: string;
  what: string;
  where: string;
  how: string;
  images: string[];
  sourceUrls?: string[];
}

import activitiesData from './activities.json';

export const activities: Activity[] = activitiesData as Activity[];

/**
 * Helper Database Queries
 */

// ดึงปี พ.ศ. ทั้งหมดที่มีในระบบ (เรียงลำดับจากใหม่ไปเก่า)
export function getAvailableYears(): number[] {
  const years = activities.map(a => a.year).filter(Boolean);
  return Array.from(new Set(years)).sort((a, b) => b - a);
}

// กรองกิจกรรมตามปี พ.ศ.
export function getActivitiesByYear(year: number): Activity[] {
  return activities.filter(a => a.year === year);
}

// ค้นหากิจกรรมจากคีย์เวิร์ด
export function searchActivities(query: string, year?: number | 'all'): Activity[] {
  const q = query.trim().toLowerCase();
  return activities.filter(a => {
    const matchYear = !year || year === 'all' || a.year === year;
    const matchQuery = !q ||
      a.title.toLowerCase().includes(q) ||
      a.context.toLowerCase().includes(q) ||
      a.where.toLowerCase().includes(q) ||
      a.date.toLowerCase().includes(q);
    return matchYear && matchQuery;
  });
}
`;

  const tsPath = path.join(__dirname, '..', 'src', 'data', 'activities.ts');
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log(`Successfully generated TypeScript database: ${tsPath}`);
}

main().catch(err => {
  console.error('Fatal error scraping:', err);
});

