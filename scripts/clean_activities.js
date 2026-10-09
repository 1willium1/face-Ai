import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonFile = path.join(__dirname, '..', 'src', 'data', 'activities.json');
const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// Filter out placeholder activities (failed fetches)
const realActivities = data.filter(a => {
  // Placeholder pattern: "กิจกรรม มหาวิทยาลัยสวนดุสิต (2026-2075364)"
  if (a.title && a.title.match(/^กิจกรรม มหาวิทยาลัยสวนดุสิต \(/)) {
    return false;
  }
  return true;
});

// Clean images: remove logos, banners, sidebar images, thumbs, and keep only gallery/upload images
const junkPatterns = [
  /cropped-sdu-newlogo/,
  /new_head2016/,
  /ธงชาติไทย/,
  /eng\.jpg/,
  /chaina\.jpg/,
  /Anantasorn/,
  /SDU-ALUMNI/,
  /credit-bank/,
  /Good-University/,
  /03-36x32/,
  /email-36x/,
  /hotline\.png/,
  /ร้องเรียน/,
  /download-4-36x/,
  /report-36x/,
  /low-36x/,
  /FAQ-icon/,
  /ปปท/,
  /ปปช/,
  /covid-19/,
  /ITA-sidebar/,
  /KM-SDU/,
  /qa\.png/,
  /thumbs\/thumbs_/,
  /เล่ม-Good/,
  /-36x\d+\./,
  /-32x32\./,
  /-24x36\./,
  /-180x180\./,
  /-192x192\./,
  /wp-content\/uploads\/2020\/08\/1\.jpg/,  // default fallback image
];

const cleanedActivities = realActivities.map(a => {
  const cleanImages = (a.images || []).filter(img => {
    return !junkPatterns.some(pattern => pattern.test(img));
  });
  return { ...a, images: cleanImages };
});

console.log(`Original: ${data.length} activities`);
console.log(`After removing placeholders: ${realActivities.length} activities`);
console.log(`Sample cleaned activity:`);
const sample = cleanedActivities.find(a => a.images.length > 3);
if (sample) {
  console.log(`  Title: ${sample.title}`);
  console.log(`  Images: ${sample.images.length}`);
  console.log(`  First 3 images:`, sample.images.slice(0, 3));
}

// Write cleaned JSON
const cleanJsonFile = path.join(__dirname, '..', 'src', 'data', 'activities.json');
fs.writeFileSync(cleanJsonFile, JSON.stringify(cleanedActivities, null, 2), 'utf8');

// Write cleaned TypeScript
const tsFile = path.join(__dirname, '..', 'src', 'data', 'activities.ts');
const tsContent = `export interface Activity {
  id: string;
  images: string[];
  date: string;
  year: number; // พ.ศ.
  title: string;
  context: string;
  what: string;
  where: string;
  how: string;
  sourceUrls?: string[];
}

export const activities: Activity[] = ${JSON.stringify(cleanedActivities, null, 2)};
`;
fs.writeFileSync(tsFile, tsContent, 'utf8');

console.log(`\nSaved ${cleanedActivities.length} cleaned activities to activities.json and activities.ts`);

// Show year distribution
const yearCounts = {};
cleanedActivities.forEach(a => {
  yearCounts[a.year] = (yearCounts[a.year] || 0) + 1;
});
console.log('\nYear distribution:');
Object.entries(yearCounts).sort(([a], [b]) => Number(b) - Number(a)).forEach(([year, count]) => {
  console.log(`  พ.ศ. ${year}: ${count} activities`);
});
