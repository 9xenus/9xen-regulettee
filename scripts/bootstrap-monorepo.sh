#!/bin/bash
echo "Bootstrapping Multi-Sector AI Platform Monorepo..."

mkdir -p packages/core/src/{ai,middleware,interfaces}
mkdir -p packages/sectors/{finance,export,insurance,health,retail,legal,govt,edu-hr,agri}/src

# Initialize Core package
cd packages/core
npm init -y
npm pkg set name="@platform/core" version="1.0.0" main="dist/index.js"
cd ../../

# Initialize Export Sector package
cd packages/sectors/export
npm init -y
npm pkg set name="@platform/sector-export" version="1.0.0" main="dist/index.js"
npm pkg set dependencies.@platform/core="workspace:*"
cd ../../../

echo "Monorepo structure created successfully!"
