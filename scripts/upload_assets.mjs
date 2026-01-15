// ============================================
// RAGEQUIT - Supabase Asset Upload (Node.js)
// ============================================
// Purpose: Upload all assets from 04_CDN_ASSETS to Supabase Storage
// Using: @supabase/supabase-js (already installed)

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vgtyecaegcjhewkuusal.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_hE6WpnhFsNVLxSJRoCXbEA_QMPIiG8p';
const bucketName = 'ragequit-assets';
const sourceDir = path.join(__dirname, '..', '..', '04_CDN_ASSETS');

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('=== RAGEQUIT ASSET UPLOAD ===');
console.log(`Source: ${sourceDir}`);
console.log(`Target: ${bucketName} @ ${supabaseUrl}\n`);

// Get all files recursively
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (!file.endsWith('.ps1') && !file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Get all files
const files = getAllFiles(sourceDir);
const totalSize = files.reduce((sum, f) => sum + fs.statSync(f).size, 0) / (1024 * 1024);

console.log(`Files to upload: ${files.length}`);
console.log(`Total size: ${totalSize.toFixed(2)} MB\n`);

// Upload counters
let uploaded = 0;
let failed = 0;
let skipped = 0;

// Upload files
for (const file of files) {
    // Calculate relative path (lowercase)
    const relativePath = path.relative(sourceDir, file).replace(/\\/g, '/').toLowerCase();

    // Progress
    const percent = ((uploaded + skipped + failed) / files.length * 100).toFixed(1);
    process.stdout.write(`\rUploading: ${uploaded + skipped + failed}/${files.length} (${percent}%)        `);

    try {
        // Read file
        const fileBuffer = fs.readFileSync(file);

        // Determine content type
        const ext = path.extname(file).toLowerCase();
        const contentType = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.fbx': 'application/octet-stream',
            '.glb': 'model/gltf-binary',
            '.gltf': 'model/gltf+json',
            '.ogg': 'audio/ogg',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.tga': 'image/x-tga'
        }[ext] || 'application/octet-stream';

        // Upload to Supabase
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(relativePath, fileBuffer, {
                contentType,
                upsert: true // Overwrite if exists
            });

        if (error) {
            if (error.message.includes('already exists')) {
                skipped++;
            } else {
                failed++;
                console.error(`\n❌ FAILED: ${relativePath} - ${error.message}`);
            }
        } else {
            uploaded++;
            if (uploaded % 25 === 0) {
                console.log(`\n✅ Uploaded ${uploaded} files...`);
            }
        }

    } catch (err) {
        failed++;
        console.error(`\n❌ ERROR: ${relativePath} - ${err.message}`);
    }
}

// Summary
console.log('\n\n=== UPLOAD COMPLETE ===');
console.log(`✅ Uploaded: ${uploaded} files`);
console.log(`⏭️  Skipped: ${skipped} files (already exist)`);
console.log(`❌ Failed: ${failed} files`);
console.log(`\nCDN Base URL:`);
console.log(`${supabaseUrl}/storage/v1/object/public/${bucketName}/`);

// Sample URLs
if (uploaded > 0) {
    console.log('\n📝 Sample CDN URLs (test these):');
    const samples = files.slice(0, 5);
    samples.forEach(sample => {
        const samplePath = path.relative(sourceDir, sample).replace(/\\/g, '/').toLowerCase();
        console.log(`${supabaseUrl}/storage/v1/object/public/${bucketName}/${samplePath}`);
    });
}

process.exit(failed > 0 ? 1 : 0);
