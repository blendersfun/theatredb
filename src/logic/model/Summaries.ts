import { Tuple, DocumentType } from './Document'

export const PersonRoles = Tuple(
  'novelist',
  'playwright'
)
export type PersonRoleEnum = (typeof PersonRoles)[number]
export type PersonInRole = {
  person: PersonSummary,
  role: PersonRoleEnum
}

/**
 * All document types need a summary view defined here. These summary 
 * views will then be consumed in the detail views when sub-documents exist.
 */

export type PersonSummary = DocumentType & {
  name: string
}

export type OrganizationSummary = DocumentType & {
  name: string
}

export type ProductionSummary = DocumentType & {
  name: string,
  organization: OrganizationSummary
}

export type ScriptSummary = DocumentType & {
  name: string,
  authors: PersonInRole[]
}