import { GraphSchema } from './schema';

/**
 * Strict boundary validation for Neo4j Graph operations.
 * Prevents Cypher injection by enforcing allow-lists for dynamic labels and relationship types.
 */

const ALLOWED_LABELS = Object.values(GraphSchema.NodeLabels);
const ALLOWED_RELATIONSHIPS = Object.values(GraphSchema.Relationships);

export class GraphValidator {
  static validateNodeLabel(label: string): string {
    if (!ALLOWED_LABELS.includes(label)) {
      throw new Error(`[SECURITY_VIOLATION] Illegal Node Label attempted: ${label}`);
    }
    return label;
  }

  static validateRelationshipType(type: string): string {
    if (!ALLOWED_RELATIONSHIPS.includes(type)) {
      throw new Error(`[SECURITY_VIOLATION] Illegal Relationship Type attempted: ${type}`);
    }
    return type;
  }

  static sanitizeIdentifier(id: string): string {
    // Basic regex check to prevent alphanumeric evasion
    if (!/^[a-zA-Z0-9_\-:]+$/.test(id)) {
      throw new Error(`[SECURITY_VIOLATION] Illegal characters in identifier: ${id}`);
    }
    return id;
  }
}
