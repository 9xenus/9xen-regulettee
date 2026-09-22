const fs = require('fs');
const https = require('https');

const targetFile = 'packages/nre-packs/worldCountriesData.ts';
const content = fs.readFileSync(targetFile, 'utf8');

// Extract existing country codes
const existingCodes = [...content.matchAll(/countryCode:\s*'([A-Z]{2})'/g)].map(m => m[1]);
console.log(`Found ${existingCodes.length} existing countries.`);

https.get('https://restcountries.com/v3.1/all', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const countries = JSON.parse(data);
    let newEntries = '';
    let addedCount = 0;
    
    countries.forEach(c => {
      const code = c.cca2;
      if (!existingCodes.includes(code)) {
        let region = 'europe';
        if (c.region === 'Asia') region = 'asia';
        if (c.region === 'Africa') region = 'africa';
        if (c.region === 'Americas') region = 'americas';
        if (c.region === 'Oceania') region = 'asia'; // Mapping Oceania to Asia for now based on 'asia | middle_east | africa | americas | europe'
        
        // Handle Middle East logic roughly
        const middleEast = ['AE','SA','QA','BH','EG','KW','OM','JO','LB','TR','IQ','IL','YE','SY','IR'];
        if (middleEast.includes(code)) region = 'middle_east';

        let currency = 'USD';
        if (c.currencies) {
            currency = Object.keys(c.currencies)[0] || 'USD';
        }
        
        let language = 'en';
        if (c.languages) {
            language = Object.keys(c.languages)[0] || 'en';
        }

        newEntries += `  {
    countryCode: '${code}',
    countryName: '${c.name.common.replace(/'/g, "\\'")}',
    regionCode: '${region}',
    currencyCode: '${currency}',
    primaryLanguage: '${language}',
    languages: ['${language}'],
    legalSystem: 'mixed',
    scannerLegalGate: 'standard',
    dataResidencyRequired: false,
    regulators: []
  },\n`;
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
        const insertIndex = content.lastIndexOf('];');
        if (insertIndex !== -1) {
            const newContent = content.slice(0, insertIndex) + newEntries + content.slice(insertIndex);
            fs.writeFileSync(targetFile, newContent);
            console.log(`Added ${addedCount} new countries.`);
        }
    }
  });
}).on('error', err => {
  console.log('Error:', err.message);
});
