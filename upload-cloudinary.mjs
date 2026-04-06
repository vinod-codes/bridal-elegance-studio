import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
    cloud_name: 'dwog6t2uq',
    api_key: '317193338441531',
    api_secret: 'ed9ps4nRrJP9T3C8sT-8jvCk838'
});

const publicDir = 'c:\\Users\\vinod\\Downloads\\Demos\\bridal-elegance-studio\\public';
const files = fs.readdirSync(publicDir);

const mappings = {};

async function uploadFiles() {
    for (const file of files) {
        if (file.endsWith('.mp4') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const filePath = path.join(publicDir, file);
            const isVideo = file.endsWith('.mp4');
            console.log(`Uploading ${file}...`);
            try {
                const result = await cloudinary.uploader.upload(filePath, {
                    resource_type: isVideo ? "video" : "image",
                    use_filename: true,
                    unique_filename: false
                });
                mappings[file] = result.secure_url;
                console.log(`Uploaded: ${result.secure_url}`);
            } catch (err) {
                console.error(`Error uploading ${file}:`, err);
            }
        }
    }
    fs.writeFileSync('cloudinary-mapping.json', JSON.stringify(mappings, null, 2));
    console.log("Mapping saved to cloudinary-mapping.json");
}

uploadFiles();
