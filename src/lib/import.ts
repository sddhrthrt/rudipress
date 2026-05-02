// Import zines from Google Drive
// This runs at build time in Astro's frontmatter
import 'dotenv/config';
import { GoogleAuth } from 'google-auth-library';
import { drive } from '@googleapis/drive';
import pkg from '@googleapis/sheets';
const { sheets } = pkg;
import fs from 'fs';
import path from 'path';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// Handle both \n literals (from .env) and actual newlines (from Cloudflare Pages env vars)
const rawKey = process.env.GOOGLE_PRIVATE_KEY;
if (!rawKey) {
  throw new Error('GOOGLE_PRIVATE_KEY is not set');
}

console.log('   Node.js version:', process.version);
console.log('   Key length:', rawKey.length);
console.log('   Has actual newlines:', rawKey.includes('\n'));
console.log('   Full key:\n', rawKey);

// Convert \n literals to actual newlines if present
const GOOGLE_PRIVATE_KEY = rawKey.includes('\\n') 
  ? rawKey.replace(/\\n/g, '\n') 
  : rawKey;
const FOLDER_ID = '13Pl43Fk20SO_J1al84v90xVAZyAC0E9R';

const ZINES_DIR = './src/assets/zines';
const DATA_FILE = './src/data/zines.csv';

export async function downloadZinesFromDrive() {
  console.log('📥 Downloading zines from Google Drive...');

  // Use GoogleAuth - handles auth more robustly
  // Try passing key as 'key' property instead of 'private_key'
  const auth = new GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
    projectId: GOOGLE_PROJECT_ID,
  });

  const client = await auth.getClient();

  const driveClient = drive({ version: 'v3', auth: client });
  const sheetsClient = sheets({ version: 'v4', auth: client });

  // 1. Find and read the spreadsheet
  console.log('📄 Finding spreadsheet...');
  const filesResponse = await driveClient.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
    fields: 'files(id, name)',
  });

  if (!filesResponse.data.files?.length) {
    throw new Error('No spreadsheet found in Drive folder');
  }

  const spreadsheetId = filesResponse.data.files[0].id;
  console.log('   Found:', filesResponse.data.files[0].name);

  // 2. Read the spreadsheet data
  console.log('📊 Reading spreadsheet data...');
  const sheetResponse = await sheetsClient.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:Z',
  });

  const rows = sheetResponse.data.values;
  if (!rows || rows.length < 2) {
    throw new Error('Spreadsheet is empty or has no data');
  }

  // First row is headers
  const headers = rows[0];
  const dataRows = rows.slice(1);

  console.log(`   Found ${dataRows.length} zines`);

  // 3. Get list of image files in Drive folder
  console.log('🖼️ Listing image files in Drive...');
  const imageResponse = await driveClient.files.list({
    q: `'${FOLDER_ID}' in parents and mimeType contains 'image/'`,
    fields: 'files(id, name)',
  });

  const imageFiles = imageResponse.data.files || [];
  console.log(`   Found ${imageFiles.length} images`);

  // 4. Create local directories if needed
  if (!fs.existsSync(ZINES_DIR)) {
    fs.mkdirSync(ZINES_DIR, { recursive: true });
  }
  if (!fs.existsSync('./src/data')) {
    fs.mkdirSync('./src/data', { recursive: true });
  }

  // 5. Sanity check - verify we have data
  if (dataRows.length === 0) {
    throw new Error('❌ No zine data found in spreadsheet! Build aborted.');
  }

  console.log(`   ✓ Spreadsheet has ${dataRows.length} zines`);

  // 6. Download images and save CSV
  console.log('⬇️ Downloading images...');
  
  const csvLines = [headers.join(',')];
  let downloadedCount = 0;
  let missingImages = 0;

  for (const row of dataRows) {
    if (!row[0]) continue; // Skip empty rows

    // Map row to object based on headers
    const zine: Record<string, string> = {};
    headers.forEach((header, i) => {
      zine[header] = row[i] || '';
    });

    const { title, imageFilename, author, description, uploadDate } = zine;

    // Find matching image in Drive
    // Try different extensions since imageFilename in CSV doesn't have extension
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    let matchedFile = null;
    
    for (const ext of extensions) {
      const searchName = (imageFilename || '') + ext;
      matchedFile = imageFiles.find(f => f.name === searchName);
      if (matchedFile) break;
    }

    if (matchedFile) {
      // Download the image
      const imagePath = path.join(ZINES_DIR, matchedFile.name);
      const imageResponse = await driveClient.files.get({
        fileId: matchedFile.id,
        alt: 'media',
      }, { responseType: 'stream' });

      await new Promise((resolve, reject) => {
        (imageResponse.data as any)
          .pipe(fs.createWriteStream(imagePath))
          .on('finish', resolve)
          .on('error', reject);
      });

      console.log(`   Downloaded: ${matchedFile.name}`);
      downloadedCount++;
    } else {
      console.log(`   ⚠️ Image not found for: ${imageFilename}`);
      missingImages++;
    }

    // Add row to CSV (use filename with extension if downloaded)
    const csvRow = [
      title || '',
      matchedFile ? matchedFile.name.replace(/\.[^.]+$/, '') : imageFilename || '',
      author || '',
      description || '',
      uploadDate || ''
    ];
    csvLines.push(csvRow.join(','));
  }

  // 7. Final sanity check - ensure all images were downloaded
  if (missingImages > 0) {
    throw new Error(`❌ ${missingImages} image(s) not found in Drive! Build aborted.`);
  }

  if (downloadedCount !== dataRows.length) {
    throw new Error(`❌ Expected ${dataRows.length} images but only downloaded ${downloadedCount}! Build aborted.`);
  }

  // 8. Save CSV locally
  console.log('💾 Saving CSV...');
  fs.writeFileSync(DATA_FILE, csvLines.join('\n'));

  console.log(`\n✅ Done! Downloaded ${downloadedCount} images and saved CSV.`);
  console.log(`   Images: ${ZINES_DIR}`);
  console.log(`   CSV: ${DATA_FILE}`);
}

// Run if called directly (for testing)
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadZinesFromDrive()
    .then(() => console.log('\n✅ Import complete!'))
    .catch(err => {
      console.error('\n❌ Import failed:', err.message);
      process.exit(1);
    });
}