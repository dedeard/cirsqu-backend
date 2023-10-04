import axios from 'axios';

type Options = {
  timeout?: number;
  maxSize?: number; // In bytes
};

export default async function urlToBuffer(url: URL, options: Options = {}) {
  const { timeout = 5000, maxSize = 2 * 1024 * 1024 } = options;

  const response = await axios.get(url.href, {
    responseType: 'arraybuffer',
    maxContentLength: maxSize,
    timeout,
  });

  return Buffer.from(response.data);
}
