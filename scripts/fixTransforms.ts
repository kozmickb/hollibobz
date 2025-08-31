#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const TRANSFORM_REGEX = /transform:\s*\[\s*\{([^}]+)\}\s*\]/g;
const MULTI_PROP_REGEX = /\{([^}]+)\}/g;

function fixTransformInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let newContent = content;

  // Find all transform arrays
  const transformMatches = content.match(TRANSFORM_REGEX);
  if (!transformMatches) return false;

  for (const match of transformMatches) {
    // Check if this transform has multiple properties in a single object
    const innerMatch = match.match(MULTI_PROP_REGEX);
    if (!innerMatch) continue;

    const innerContent = innerMatch[0].slice(1, -1).trim(); // Remove { }

    // Check if there are multiple properties (comma-separated)
    const properties = innerContent.split(',').map(p => p.trim());
    if (properties.length <= 1) continue;

    // Check if any property has a colon (indicating it's a key-value pair)
    const hasMultipleProps = properties.some(prop => prop.includes(':'));
    if (!hasMultipleProps) continue;

    // This is an invalid transform - split it
    const splitProps = properties.map(prop => {
      const [key, ...valueParts] = prop.split(':');
      const value = valueParts.join(':').trim();
      return `{ ${key.trim()}: ${value} }`;
    });

    const newTransform = `transform: [${splitProps.join(', ')}]`;
    newContent = newContent.replace(match, newTransform);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Fixed transforms in: ${filePath}`);
    return true;
  }

  return false;
}

async function main() {
  const patterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    'app/**/*.{ts,tsx,js,jsx}'
  ];

  let fixedCount = 0;

  for (const pattern of patterns) {
    try {
      const files = await glob(pattern, { ignore: ['node_modules/**'] });

      for (const file of files) {
        if (fixTransformInFile(file)) {
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`Error processing pattern ${pattern}:`, error);
    }
  }

  console.log(`\nTransform fix complete! Fixed ${fixedCount} files.`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { fixTransformInFile };
