import { driver } from '../db/graph/client';
import { GraphSchema } from '../db/graph/schema';
import { GraphValidator } from '../db/graph/validate';

export class DigitalTwinIngestionService {
  static async ingestInstitutionModel(tenantId: string, model: any) {
    // Validate identifiers
    const sanitizedTenantId = GraphValidator.sanitizeIdentifier(tenantId);
    
    const session = driver.session();
    try {
      await session.executeWrite(tx =>
        tx.run(
          `
          MERGE (i:${GraphValidator.validateNodeLabel(GraphSchema.NodeLabels.INSTITUTION)} {id: $tenantId})
          SET i.name = $name
          
          // Ingest Processes
          UNWIND $processes AS process
          MERGE (p:${GraphValidator.validateNodeLabel(GraphSchema.NodeLabels.PROCESS)} {id: process.id, tenantId: $tenantId})
          SET p.name = process.name
          MERGE (i)-[:${GraphValidator.validateRelationshipType(GraphSchema.Relationships.OPERATES_IN)}]->(p)
          
          // Ingest Systems
          UNWIND $systems AS system
          MERGE (s:${GraphValidator.validateNodeLabel(GraphSchema.NodeLabels.SYSTEM)} {id: system.id, tenantId: $tenantId})
          SET s.name = system.name
          MERGE (p)-[:${GraphValidator.validateRelationshipType(GraphSchema.Relationships.USES)}]->(s)
          `,
          {
            tenantId: sanitizedTenantId,
            name: model.name,
            processes: model.processes,
            systems: model.systems
          }
        )
      );
      console.log(`[DIGITAL_TWIN] Ingested model for tenant: ${tenantId}`);
    } finally {
      await session.close();
    }
  }
}
