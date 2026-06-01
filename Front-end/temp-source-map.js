const fs = require('fs');
const sourceMap = JSON.parse(fs.readFileSync('.next/server/chunks/ssr/_0l_v7nr._.js.map', 'utf8'));
const line = 2;
const column = 6522;
const mappings = sourceMap.mappings;
for (let i = 0; i < mappings.length; i++) {
  const mapping = mappings[i];
  if (mapping.generatedLine === line && mapping.generatedColumn <= column && mapping.originalLine) {
    console.log(JSON.stringify({
      originalFile: mapping.source,
      originalLine: mapping.originalLine,
      originalColumn: mapping.originalColumn
    }, null, 2));
    break;
  }
}
