import algoliasearch from 'algoliasearch';
import admin from 'firebase-admin';
import lessonsData from './lessons-data';

const lessonCollection = admin.firestore().collection('lessons');
const episodeCollection = admin.firestore().collection('episodes');
const subjectCollection = admin.firestore().collection('subjects');

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

function getRandomInt(min, max) {
  const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`Generated random integer: ${randomInt}`);
  return randomInt;
}

const fetchSubjects = async () => {
  const subjectsSnapshot = await subjectCollection.get();
  const subjects = {};
  subjectsSnapshot.docs.forEach((subject) => {
    subjects[subject.data().slug] = subject.data().name;
  });
  console.log('Fetched subjects');
  return subjects;
};

const calculateTotalSeconds = (episodes) => {
  const totalSeconds = episodes.reduce((total, episode) => total + episode.seconds, 0);
  return totalSeconds;
};

const updateLesson = async (data) => {
  const snapshot = await lessonCollection.where('slug', '==', data.slug).get();

  if (snapshot.empty) {
    const lessonRef = await lessonCollection.add(data);
    console.log('Added a new lesson:', data.slug);
    return lessonRef.id;
  } else {
    const result = snapshot.docs[0];
    await result.ref.update(data);
    console.log('Updated an existing lesson:', data.slug);
    return result.id;
  }
};

const initEpisodes = async (lessonId, episodes, premiumRange) => {
  for (let i = 0; i < episodes.length; i++) {
    const episodeData = {
      lessonId,
      videoId: episodes[i].id,
      title: episodes[i].title,
      seconds: episodes[i].seconds,
      description: episodes[i].description,
      premium: i > premiumRange,
      downloadUrl: `https://www.youtube.com/watch?v=${episodes[i].id}`,
    };
    await episodeCollection.add(episodeData);
    console.log('Added an episode for lesson:', episodeData.title);
  }
};

const updateAlgoliaIndex = async (lessons, subjects) => {
  const data = lessons.map((item) => ({
    objectID: item.slug,
    title: item.title,
    slug: item.slug,
    description: item.description,
    seconds: calculateTotalSeconds(item.episodes),
    subjects: item.subjects.map((slug) => subjects[slug]),
    createdAt: item.createdAt,
    episodes: item.episodes.map((el) => el.title),
  }));

  const index = client.initIndex('lessons');
  await index.replaceAllObjects(data);
  console.log('Updated Algolia index');
};

const initLessons = async () => {
  try {
    const subjects = await fetchSubjects();

    for (const item of lessonsData) {
      const totalSeconds = calculateTotalSeconds(item.episodes);
      const lessonData = {
        title: item.title,
        slug: item.slug,
        description: item.description,
        seconds: totalSeconds,
        subjects: item.subjects.map((slug) => subjects[slug]),
        createdAt: admin.firestore.Timestamp.fromDate(new Date(item.createdAt * 1000)),
      };

      const premiumRange = getRandomInt(0, item.episodes.length - 1);
      const lessonId = await updateLesson(lessonData);
      await initEpisodes(lessonId, item.episodes, premiumRange);
    }

    const lessonsSnapshot = await lessonCollection.select('slug').get();
    const xlessons = {};
    lessonsSnapshot.docs.forEach((lesson) => {
      xlessons[lesson.data().slug] = lesson.id;
    });

    await updateAlgoliaIndex(lessonsData, subjects);
    console.log('Initialization completed successfully.');
  } catch (error) {
    console.error('Failed to init lessons', error.message);
  }
};

export default initLessons;
