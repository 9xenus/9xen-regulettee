import fs from 'fs';
import path from 'path';

export const checkComplianceLibraries = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = packageJson.dependencies || {};
    
    // Define required libraries
    const requiredLibraries = [
      'json-rules-engine',
      'jspdf',
      'jspdf-autotable'
    ];

    const results = requiredLibraries.map(lib => ({
      name: lib,
      installed: !!dependencies[lib],
      version: dependencies[lib] || null
    }));

    return results;
  } catch (error) {
    console.error('Error reading package.json for compliance check:', error);
    return [];
  }
};
