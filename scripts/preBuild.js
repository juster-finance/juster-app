import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { getEnvVariable } from '../src/services/utils/env.js';

dotenv.config();

const createTonConnectManifest = () => {
    const manifestContent = {
        url: getEnvVariable('VITE_APP_BASE_URL'),
        name: getEnvVariable('VITE_APP_NAME'),
        iconUrl: `${getEnvVariable('VITE_APP_BASE_URL')}/logo.png`
    }
    
    fs.writeFileSync('public/tonconnect-manifest.json', JSON.stringify(manifestContent, null, 2));
}

createTonConnectManifest();
