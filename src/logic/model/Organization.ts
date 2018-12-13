import { Document } from './Document'
import { OrganizationSummary, ProductionSummary } from './Summaries'

export type OrganizationDetail = OrganizationSummary & {
  productions?: ProductionSummary[]
}

export class Organization extends Document<OrganizationSummary, OrganizationDetail> {
  
}
