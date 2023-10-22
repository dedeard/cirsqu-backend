import initAlgolia from './algolia';
import initFirestore from './firestore';

const initContents = async () => {
  await initFirestore();
  await initAlgolia();
};

export default initContents;
