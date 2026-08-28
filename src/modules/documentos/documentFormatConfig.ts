export type DocumentFormatCategory = 'PHOTOGRAPH' | 'DOCUMENT'

export interface DocumentFormatConfig {
  accept: string
  allowedExtensions: readonly string[]
  allowedMimeTypes: readonly string[]
  readableFormats: string
}

export const DOCUMENT_FORMAT_CONFIG: Record<DocumentFormatCategory, DocumentFormatConfig> = {
  PHOTOGRAPH: {
    accept: '.jpg,.jpeg,.png,image/jpeg,image/png',
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    readableFormats: 'JPG o PNG',
  },
  DOCUMENT: {
    accept: '.pdf,application/pdf',
    allowedExtensions: ['pdf'],
    allowedMimeTypes: ['application/pdf'],
    readableFormats: 'PDF',
  },
}

// Clasificación temporal hasta que el contrato del checklist la suministre.
export const getDocumentRequirementCategory = (requirementCode: string): DocumentFormatCategory =>
  requirementCode === 'ANX-4' ? 'PHOTOGRAPH' : 'DOCUMENT'

export const getDocumentFormatConfig = (
  category: DocumentFormatCategory,
): DocumentFormatConfig => DOCUMENT_FORMAT_CONFIG[category]

const getNormalizedExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex + 1).trim().toLowerCase() : ''
}

export const isFileAllowedForCategory = (
  file: File,
  category: DocumentFormatCategory,
): boolean => {
  const config = getDocumentFormatConfig(category)
  const extensionIsAllowed = config.allowedExtensions.includes(getNormalizedExtension(file.name))
  const normalizedMimeType = file.type.trim().toLowerCase()

  return (
    extensionIsAllowed &&
    (normalizedMimeType === '' || config.allowedMimeTypes.includes(normalizedMimeType))
  )
}

export const getInvalidFileMessage = (category: DocumentFormatCategory): string =>
  `Este campo solo permite archivos ${getDocumentFormatConfig(category).readableFormats}`
