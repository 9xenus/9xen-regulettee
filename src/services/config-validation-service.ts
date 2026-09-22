
export interface ValidationIssue {
  key: string;
  severity: 'CRITICAL' | 'WARNING';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  timestamp: string;
}

export const ConfigValidationService = {
  /**
   * Performs an integrity check on a set of configuration settings
   */
  validateConfigs(configs: any[]): ValidationResult {
    const issues: ValidationIssue[] = [];

    configs.forEach(config => {
      const { key, type, value } = config;

      // 1. Basic empty check
      if (!value || value.toString().trim() === '') {
        issues.push({
          key,
          severity: 'CRITICAL',
          message: `Configuration value for ${key} cannot be empty.`
        });
        return;
      }

      // 2. Type-specific validations
      switch (type.toLowerCase()) {
        case 'string':
        case 'address':
        case 'secret':
          if (value.length < 3) {
            issues.push({
              key,
              severity: 'WARNING',
              message: `${key} value seems too short for a ${type}.`
            });
          }
          if (type.toLowerCase() === 'secret' && !value.includes('*') && value.length < 16) {
            issues.push({
              key,
              severity: 'CRITICAL',
              message: `Security Risk: ${key} is unmasked and doesn't meet complexity requirements.`
            });
          }
          break;

        case 'integer':
        case 'integer (ms)':
        case 'integer (days)':
          if (isNaN(Number(value))) {
            issues.push({
              key,
              severity: 'CRITICAL',
              message: `${key} must be a valid integer.`
            });
          }
          break;

        case 'float':
          if (isNaN(parseFloat(value))) {
            issues.push({
              key,
              severity: 'CRITICAL',
              message: `${key} must be a valid float.`
            });
          }
          break;

        case 'boolean':
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value.toString().toLowerCase())) {
            issues.push({
              key,
              severity: 'WARNING',
              message: `${key} should be a boolean (TRUE/FALSE).`
            });
          }
          break;

        case 'enum':
          // We don't have the list of valid enums here, but we can check for common placeholder values
          if (value.toLowerCase().includes('select') || value.toLowerCase().includes('choose')) {
            issues.push({
              key,
              severity: 'CRITICAL',
              message: `Invalid selection for ${key}.`
            });
          }
          break;

        case 'cron':
          // Basic cron pattern check (simplified)
          const cronRegex = /^(\*|[0-5]?\d)(\s+(\*|[01]?\d|2[0-3])){4}/;
          if (!cronRegex.test(value)) {
            issues.push({
              key,
              severity: 'WARNING',
              message: `${key} does not follow standard cron syntax.`
            });
          }
          break;

        case 'array':
          try {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              issues.push({
                key,
                severity: 'CRITICAL',
                message: `${key} must be a valid JSON array.`
              });
            }
          } catch (e) {
            issues.push({
              key,
              severity: 'CRITICAL',
              message: `${key} failed JSON array parsing.`
            });
          }
          break;
      }

      // 3. URL checks for specific keys
      if (key.includes('URL') || key.includes('ENDPOINT') || key.includes('WEBHOOK')) {
        try {
          new URL(value);
        } catch (e) {
          issues.push({
            key,
            severity: 'CRITICAL',
            message: `${key} must be a valid URL (including protocol).`
          });
        }
      }
    });

    return {
      isValid: !issues.some(i => i.severity === 'CRITICAL'),
      issues,
      timestamp: new Date().toISOString()
    };
  }
};
