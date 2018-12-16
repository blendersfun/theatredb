import { Document } from './Document'
import { ProductionSummary, ScriptSummary } from './Summaries'
import { Organization } from './Organization'
import { Script } from './Script'

export type ProductionDetail = ProductionSummary & {
  script?: ScriptSummary,
  isProfessional?: boolean,
  schedule?: {
    openingDate?: Date, // In UTC, 7pm local time is used by convention.
    closingDate?: Date    // In UTC, 7pm local time is used by convention.
  },
  location?: {
    city?: string,
    state?: string
  }
}

export class Production extends Document<ProductionSummary, ProductionDetail> {
  static collection = 'productions'
  identity(): any {
    return {
      'name': this.document.name,
      'organization.name': this.document.organization.name
    }
  }
  async preSave(): Promise<void> {
    await new Organization(this.document.organization).upsert()
    if (this.document.script) {
      await new Script(this.document.script).upsert()
    }
  }
}
