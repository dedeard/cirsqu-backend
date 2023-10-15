import dotenv from 'dotenv';
dotenv.config();

import initProducts from './products';
import initConfiguration from './portals';

const main = async () => {
  await initProducts();
  await initConfiguration();
};

main().catch((error) => {
  console.error(error);
});
