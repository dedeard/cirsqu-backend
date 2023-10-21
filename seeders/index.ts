import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { cert } from 'firebase-admin/app';
dotenv.config();

admin.initializeApp({
  credential: cert({
    projectId: process.env.FBA_PROJECT_ID.toString(),
    clientEmail: process.env.FBA_CLIENT_EMAIL.toString(),
    privateKey: process.env.FBA_PRIVATE_KEY.toString(),
  }),
  storageBucket: process.env.FBA_STORAGE_BUCKET.toString(),
});

import initProducts from './products';
import initConfiguration from './portals';
import initContents from './contents';

const main = async () => {
  await initProducts();
  await initConfiguration();
  await initContents();
};

main().catch((error) => {
  console.error(error);
});
