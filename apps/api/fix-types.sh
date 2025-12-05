#!/bin/bash

# Fix TypeScript imports in route files
for file in src/routes/*.ts; do
  if [ -f "$file" ]; then
    echo "Fixing $file"
    
    # Add proper imports if Router is used
    if grep -q "Router" "$file" && ! grep -q "Request, Response, NextFunction" "$file"; then
      sed -i '' 's/import { Router } from "express";/import { Router, Request, Response, NextFunction } from "express";/' "$file"
    fi
    
    # Fix function parameters
    sed -i '' 's/async (req, res, next) =>/async (req: Request, res: Response, next: NextFunction) =>/g' "$file"
    sed -i '' 's/async (req, res) =>/async (req: Request, res: Response) =>/g' "$file"
    sed -i '' 's/(req, res, next) =>/(req: Request, res: Response, next: NextFunction) =>/g' "$file"
    sed -i '' 's/(req, res) =>/(req: Request, res: Response) =>/g' "$file"
  fi
done

echo "TypeScript fixes applied!"