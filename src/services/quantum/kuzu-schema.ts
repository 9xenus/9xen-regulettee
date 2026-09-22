/**
 * Quantum Cyber Attack Protection Engine - KuzuDB Schema Sketch
 * 
 * This schema defines the graph structure for managing cryptographic assets,
 * quantum vulnerabilities, and PQC (Post-Quantum Cryptography) requirements.
 * 
 * --- NODES ---
 * 
 * 1. CryptoAsset
 *    Properties: 
 *      - id: STRING (Primary Key)
 *      - type: STRING (e.g., 'TLS_CERT', 'EMAIL_PGP', 'CODE_SIGN')
 *      - algorithm: STRING (e.g., 'RSA', 'ECDSA', 'ML-KEM')
 *      - keySize: INT32
 *      - usage: STRING
 *      - expiry: DATE
 * 
 * 2. Service
 *    Properties:
 *      - id: STRING (Primary Key)
 *      - appName: STRING
 *      - endpointUrl: STRING
 * 
 * 3. QuantumRisk
 *    Properties:
 *      - id: STRING (Primary Key)
 *      - score: DOUBLE (0.0 to 100.0)
 *      - vulnerableAlgorithms: STRING[]
 * 
 * 4. Regulation
 *    Properties:
 *      - id: STRING (Primary Key)
 *      - name: STRING (e.g., 'NIS2', 'Data Act', 'AI Act')
 *      - description: STRING
 * 
 * 5. PQCRequirement
 *    Properties:
 *      - id: STRING (Primary Key)
 *      - targetAlgorithm: STRING (e.g., 'ML-DSA')
 *      - deadline: DATE
 *      - scope: STRING
 * 
 * --- EDGES ---
 * 
 * 1. USES (Service -> CryptoAsset)
 *    - Represents a service utilizing a specific cryptographic asset.
 * 
 * 2. AFFECTS (QuantumRisk -> Service)
 *    - Represents a service being exposed to a specific quantum vulnerability.
 * 
 * 3. REQUIRES (Regulation -> PQCRequirement)
 *    - Represents a regulatory mandate demanding a specific PQC migration.
 * 
 * 4. VIOLATES (QuantumRisk -> Regulation)
 *    - Represents a vulnerability that directly breaches a regulatory compliance rule.
 * 
 * --- EXAMPLE CYPHER QUERIES ---
 * 
 * Find all services using vulnerable RSA keys under 3072 bits:
 * MATCH (s:Service)-[:USES]->(c:CryptoAsset)
 * WHERE c.algorithm = 'RSA' AND c.keySize < 3072
 * RETURN s.appName, c.algorithm, c.expiry;
 * 
 * Find all NIS2 violations due to quantum risks:
 * MATCH (r:QuantumRisk)-[:VIOLATES]->(reg:Regulation {name: 'NIS2'})
 * MATCH (r)-[:AFFECTS]->(s:Service)
 * RETURN s.appName, r.score, r.vulnerableAlgorithms;
 */

export const createQuantumSchema = `
    CREATE NODE TABLE CryptoAsset (id STRING, type STRING, algorithm STRING, keySize INT32, usage STRING, expiry DATE, PRIMARY KEY (id));
    CREATE NODE TABLE Service (id STRING, appName STRING, endpointUrl STRING, PRIMARY KEY (id));
    CREATE NODE TABLE QuantumRisk (id STRING, score DOUBLE, vulnerableAlgorithms STRING[], PRIMARY KEY (id));
    CREATE NODE TABLE Regulation (id STRING, name STRING, description STRING, PRIMARY KEY (id));
    CREATE NODE TABLE PQCRequirement (id STRING, targetAlgorithm STRING, deadline DATE, scope STRING, PRIMARY KEY (id));

    CREATE REL TABLE USES (FROM Service TO CryptoAsset);
    CREATE REL TABLE AFFECTS (FROM QuantumRisk TO Service);
    CREATE REL TABLE REQUIRES (FROM Regulation TO PQCRequirement);
    CREATE REL TABLE VIOLATES (FROM QuantumRisk TO Regulation);
`;
