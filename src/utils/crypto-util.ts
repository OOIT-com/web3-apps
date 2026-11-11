export async function createSha256Hash(file: File | Uint8Array): Promise<string> {
  const data: BufferSource = file instanceof File ? await file.arrayBuffer() : file;
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
