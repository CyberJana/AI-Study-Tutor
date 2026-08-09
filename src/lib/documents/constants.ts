export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024;

export const SUPPORTED_DOCUMENT_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
} as const;

export type SupportedMimeType = keyof typeof SUPPORTED_DOCUMENT_TYPES;

export function isSupportedDocumentType(mimeType: string, fileName: string): mimeType is SupportedMimeType {
  const extensions = SUPPORTED_DOCUMENT_TYPES[mimeType as SupportedMimeType];
  return Boolean(extensions?.some((extension) => fileName.toLowerCase().endsWith(extension)));
}
