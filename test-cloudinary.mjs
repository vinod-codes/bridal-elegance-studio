import { v2 as cloudinary } from 'cloudinary';

const names = ['vinod', 'vinod-codes', 'uniquejewel'];

async function run() {
    for (let name of names) {
        cloudinary.config({
            cloud_name: name,
            api_key: '317193338441531',
            api_secret: 'ed9ps4nRrJP9T3C8sT-8jvCk838'
        });
        try {
            const result = await cloudinary.api.ping();
            console.log("Ping successful with:", name);
            process.exit(0);
        } catch (err) {
            console.log(`Failed with ${name}`);
        }
    }
}
run();