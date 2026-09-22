export const SovereignDataGraphSchema = `
  // Nodes
  CREATE NODE TABLE CloudProvider (
    id STRING,
    name STRING,
    region STRING,
    jurisdiction STRING,
    compliance_certifications STRING[],
    PRIMARY KEY (id)
  );

  CREATE NODE TABLE DataFlow (
    id STRING,
    source_region STRING,
    destination_region STRING,
    data_classification STRING,
    encryption_status STRING,
    PRIMARY KEY (id)
  );

  CREATE NODE TABLE KeyManager (
    id STRING,
    type STRING, // e.g., 'HSM', 'KMS'
    provider STRING,
    location STRING,
    rotation_policy STRING,
    PRIMARY KEY (id)
  );

  CREATE NODE TABLE Evidence (
    id STRING,
    evidence_type STRING, // e.g., 'AuditLog', 'Attestation'
    timestamp TIMESTAMP,
    hash STRING,
    verification_status STRING,
    PRIMARY KEY (id)
  );

  // Relationships (Edges)
  CREATE REL TABLE HOSTS (FROM CloudProvider TO DataFlow, since DATE);
  CREATE REL TABLE SECURES (FROM KeyManager TO DataFlow, key_algorithm STRING);
  CREATE REL TABLE ATTESTS_TO (FROM Evidence TO DataFlow);
  CREATE REL TABLE ATTESTS_TO_KM (FROM Evidence TO KeyManager);
`;
