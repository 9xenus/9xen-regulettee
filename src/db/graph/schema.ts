export const GraphSchema = {
  NodeLabels: {
    REGULATION: 'Regulation',
    CONTROL: 'Control',
    PROCESS: 'Process',
    SYSTEM: 'System',
    DATA: 'Data',
    INSTITUTION: 'Institution'
  },
  Relationships: {
    COVERS: 'COVERS', // Regulation -> Control
    IMPLEMENTS: 'IMPLEMENTS', // Control -> Process
    USES: 'USES', // Process -> System
    TRANSFORMS: 'TRANSFORMS', // System -> Data
    OPERATES_IN: 'OPERATES_IN' // Institution -> Process/System
  },
  Constraints: [
    'CREATE CONSTRAINT IF NOT EXISTS FOR (i:Institution) REQUIRE i.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (r:Regulation) REQUIRE r.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (c:Control) REQUIRE c.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (p:Process) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (s:System) REQUIRE s.id IS UNIQUE',
    'CREATE CONSTRAINT IF NOT EXISTS FOR (d:Data) REQUIRE d.id IS UNIQUE'
  ],
  Indices: [
    'CREATE INDEX IF NOT EXISTS FOR (r:Regulation) ON (r.name)',
    'CREATE INDEX IF NOT EXISTS FOR (s:System) ON (s.name)'
  ]
};
