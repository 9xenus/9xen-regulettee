export interface ModelSpecification {
  id: string;
  name: string;
  modelId?: string;
  version?: string;
  featuresRequired?: string[];
  xaiSupported?: boolean;
  accuracyTarget?: number;
}

export interface SectorPack {
  id?: string;
  name: string;
  description?: string;
  framework?: string;
  modules?: { id: string; name: string; type: string }[];
  schema?: any;
  registerRoutes: (app: any) => any;
  registerModels?: () => ModelSpecification[];
}
