import algoliasearch from 'algoliasearch';
import contents from './contents.json';

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

const initAlgolia = async () => {
  const subjects = [];
  const lessons = [];

  for (const subjectId in contents.subjects) {
    const subject = contents.subjects[subjectId];
    const lessons: string[] = [];

    for (const lessonId in contents.lessons) {
      if (contents.lessons[lessonId].subjects.includes(subjectId)) {
        lessons.push(lessonId);
      }
    }

    subjects.push({
      subjectId,
      objectID: subject.slug,
      ...subject,
      lessonCount: lessons.length,
    });
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
      lessonId,
      objectID: lesson.slug,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      seconds: episodes.reduce((total, episode) => total + episode.seconds, 0),
      subjects: lesson.subjects.map((id) => {
        const subject = subjects.find((el) => el.subjectId === id);
        return { slug: subject.slug, name: subject.name };
      }),
      createdAt: lesson.createdAt._seconds,
      episodes: episodes,
    });
  }

  try {
    await client.initIndex('subjects').delete();

    const index = client.initIndex('subjects');
    await index.setSettings({
      customRanking: ['desc(lessonCount)'],
    });
    await index.saveObjects(subjects);
    console.log('Updated Algolia subjects index');
  } catch (error: any) {
    console.error(`Failed to update subjects Algolia index`, error.message);
  }

  try {
    await client.initIndex('lessons').delete();

    const index = client.initIndex('lessons');
    await index.setSettings({
      customRanking: ['desc(createdAt)'],
      attributesForFaceting: ['searchable(subjects.slug)'],
      searchableAttributes: ['lessonId', 'title', 'episodes.title', 'subjects.name', 'description'],
    });
    await index.saveObjects(lessons);
    console.log('Updated Algolia lessons index');
  } catch (error: any) {
    console.error(`Failed to update Algolia lessons index`, error.message);
  }
};

export default initAlgolia;
