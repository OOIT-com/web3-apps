export type EncryptionType = 'no-encryption' | 'use-public-key-store-v2' | 'new-key-pair';

export function isFile(value: unknown): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'lastModified' in value &&
    typeof value.lastModified === 'number' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'size' in value &&
    typeof value.size === 'number' &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

export type Tag = {
  name: string;
  value: string;
};
