type Options = {
  timeout?: number;
  maxSize?: number;
};

export default async function urlToBuffer(url: URL, options: Options = {}) {
  const got = await import('got');
  return new Promise<Buffer>(async (resolve, reject) => {
    let size = 0;
    const data: Uint8Array[] = [];
    const { timeout = 5000, maxSize = 2 * 1024 * 1024 } = options;

    const req = got.stream(url, { timeout });
    req.on('data', (chunk) => {
      size += chunk.length;
      data.push(chunk);
      if (size > maxSize) {
        req.destroy(new Error('Content Too Large'));
      }
    });
    req.on('end', () => resolve(Buffer.concat(data)));
    req.on('error', reject);
  });
}
