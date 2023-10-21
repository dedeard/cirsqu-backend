import initSubjects from './subjects';
import initLessons from './lessons';

const initContents = async () => {
  await initSubjects();
  await initLessons();
};

export default initContents;
