import fs from 'fs';
import path from 'path';
import https from 'https';

const MODELS_DIR = path.join(__dirname, '../../models');
const BASE_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';

const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2'
];

const downloadFile = (filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(MODELS_DIR, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(BASE_URL + filename, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
};

const setup = async () => {
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  console.log('Downloading FaceAPI models...');
  for (const file of files) {
    if (!fs.existsSync(path.join(MODELS_DIR, file))) {
      await downloadFile(file);
    } else {
      console.log(`${file} already exists.`);
    }
  }
  console.log('Models ready!');
};

setup().catch(console.error);
