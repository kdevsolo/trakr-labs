export function sanitizeFileName(name: string): string {
  const baseName = name.split(/[/\\]/).pop() ?? 'upload';
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}
