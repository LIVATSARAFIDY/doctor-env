# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"env-doctor" is a TypeScript CLI tool for synchronizing and validating `.env` files across teams. It compares environment files, fixes missing variables, and identifies unused variables in the source code.

## Code Architecture and Structure

The project uses a modular structure:

1.  **CLI Entry Point** (`src/index.ts`): Defines the CLI using `commander`. It implements the `compare`, `fix`, and `scan-unused-vars` commands. Note that `scan-unused-vars` logic is currently embedded within the command definition in `index.ts`.
2.  **Environment Parser** (`src/envParser.ts`): A utility to parse `.env` files into `Set<string>` of variable keys.
3.  **Action Handlers** (`src/action.ts`): Core logic for set comparison (`compareSets`) and appending missing variables (`fixContent`).

### Core Commands
- `compare`: Identifies variables present in a reference file but missing in a target file.
- `fix`: Appends missing variables from a reference file to a target file.
- `scan-unused-vars`: Regex-scans source code to find defined environment variables that are never referenced.

## Common Development Commands

### Development & Build
```bash
npm run dev        # Run the CLI tool using tsx
npm run build      # Compile TypeScript to dist/ (using tsc)
```

### Running the CLI (Development)
To run commands during development, use `npm run dev -- [command] [options]`:
```bash
# Compare .env against .env.example
npm run dev -- compare -t .env -r .env.example

# Fix .env using .env.example as reference
npm run dev -- fix -t .env -r .env.example

# Scan for unused variables in .ts files
npm run dev -- scan-unused-vars --extensions .ts
```

### Running the CLI (Production/Compiled)
```bash
node dist/index.js [command] [options]
# Or after npm link:
env-doctor [command] [options]
```

## Project Structure
```
src/
├── index.ts          # CLI entry point and command definitions
├── envParser.ts      # .env file parsing logic
├── action.ts         # Logic for compare and fix actions
└── *.d.ts            # TypeScript declaration files
dist/                 # Compiled JavaScript output
```

## Key Dependencies
- `commander`: CLI framework
- `picocolors` & `chalk`: Terminal styling
- `tsx`: TypeScript execution for development

## Testing
No automated tests are currently configured. Testing is performed manually by creating sample `.env` files and running the commands listed above.
