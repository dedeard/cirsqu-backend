import algoliasearch from 'algoliasearch';
import contents from './contents.json';

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

const initAlgolia = async () => {
  const subjects = [];
  const lessons = [];

  for (const subjectId in contents.subjects) {
    subjects.push({ objectID: subjectId, ...contents.subjects[subjectId] });
  }

  for (const lessonId in contents.lessons) {
    const lesson = contents.lessons[lessonId];
    const episodes = [];

    for (const episodeId in contents.episodes) {
      const episode = contents.episodes[episodeId];

      if (episode.lessonId === lessonId) {
        episodes.push({
          episodeId: episodeId,
          title: episode.title,
          seconds: episode.seconds,
          index: episode.index,
          premium: episode.premium,
        });
      }
    }

    lessons.push({
      objectID: lessonId,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      seconds: episodes.reduce((total, episode) => total + episode.seconds, 0),
      subjects: lesson.subjects.map((id) => {
        const subject = subjects.find((el) => el.objectID === id);
        return { slug: subject.slug, name: subject.name };
      }),
      createdAt: lesson.createdAt._seconds,
      episodes: episodes,
    });
  }

  try {
    await client.initIndex('lessons').delete();

    const index = client.initIndex('lessons');
    await index.setSettings({
      customRanking: ['asc(createdAt)'],
      attributesForFaceting: ['searchable(subjects.slug)'],
    });
    await index.saveObjects(lessons);
    console.log('Updated Algolia index');
  } catch (error: any) {
    console.error(`Failed to update Algolia index`, error.message);
  }
};

export default initAlgolia;
