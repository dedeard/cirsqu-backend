import admin from 'firebase-admin';
import subjects from './subjects-data';

const collection = admin.firestore().collection('subjects');

const initSubjects = async () => {
  for (const item of subjects) {
    try {
      const snapshot = await collection.where('slug', '==', item.slug).get();
      if (snapshot.empty) {
        await collection.add({ ...item });
        console.log(`Created subject: ${item.name}`);
      } else {
        for (const result of snapshot.docs) {
          await result.ref.update({ ...item });
          console.log(`updated subject: ${item.name}`);
        }
      }
    } catch (error: any) {
      console.error(`Failed to init subject: ${item.name}`);
    }
  }
};

export default initSubjects;
