import admin from 'firebase-admin';
import contents from './contents.json';

const db = admin.firestore();

const initFirestore = async () => {
  const batch = db.batch();
  for (const subjectId in contents.subjects) {
    const subjectRef = db.collection('subjects').doc(subjectId);
    batch.set(subjectRef, contents.subjects[subjectId]);
  }

  for (const lessonId in contents.lessons) {
    const lessonRef = db.collection('lessons').doc(lessonId);
    const { createdAt, ...lesson } = contents.lessons[lessonId];
    batch.set(lessonRef, { ...lesson, createdAt: new admin.firestore.Timestamp(createdAt._seconds, createdAt._nanoseconds) });
  }

  for (const episodeId in contents.episodes) {
    const episodeRef = db.collection('episodes').doc(episodeId);
    batch.set(episodeRef, contents.episodes[episodeId]);
  }

  try {
    await batch.commit();
    console.log('Updated firestore conetents');
  } catch (error: any) {
    console.error(`Failed to Update firestore conetents`, error.message);
  }
};

export default initFirestore;
