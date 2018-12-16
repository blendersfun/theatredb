import { Document } from './Document'
import { OrganizationSummary, ProductionSummary } from './Summaries'

export type OrganizationDetail = OrganizationSummary & {
  productions?: ProductionSummary[]
}

export class Organization extends Document<OrganizationSummary, OrganizationDetail> {
  static collection = 'organizations'
  identity(): any {
    return { name: this.document.name }
  }
}
