# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript CLI tool called "env-doctor" that helps teams synchronize and validate .env files. The tool provides commands to compare environment files, automatically fix missing variables, and detect unused environment variables in source code.

## Code Architecture and Structure

The project follows a modular architecture with these main components:

1. **CLI Entry Point** (`src/index.ts`): Uses Commander.js to define and handle CLI commands
2. **Environment Parser** (`src/envParser.ts`): Parses .env files and extracts variable keys into Sets
3. **Action Handlers** (`src/action.ts`): Contains logic for comparing environments and fixing missing variables
4. **Command Implementations**: Each CLI command has its own action handler that processes the relevant files

The tool is structured around three main commands:
- `compare`: Compares two .env files and shows missing variables
- `fix`: Automatically adds missing variables from a reference file to a target file
- `scan-unused-vars`: Detects environment variables defined but never used in source code

## Common Development Commands

### Development
```bash
npm run dev        # Run the CLI tool in development mode using tsx
npm run build      # Compile TypeScript to JavaScript in dist/ directory
```

### Building
```bash
npm run build      # Compiles TypeScript code to JavaScript in the dist/ directory
```

### Running the CLI
```bash
node dist/index.js [command] [options]    # Run the compiled CLI tool
# Or after npm link:
env-doctor [command] [options]            # Run the CLI tool directly
```

## Project Structure
```
src/
├── index.ts          # CLI entry point with command definitions
├── envParser.ts      # Environment file parsing logic
├── action.ts         # Core functionality for comparing and fixing env files
├── *.d.ts            # TypeScript declaration files
dist/                 # Compiled JavaScript output
package.json          # Project configuration and dependencies
tsconfig.json         # TypeScript configuration
```

## Key Dependencies
- commander: CLI command framework
- picocolors: Terminal string styling
- chalk: Additional terminal coloring (alternative to picocolors)
- tsx: TypeScript execution for development
- typescript: TypeScript compiler

## Development Workflow
1. Make changes in the `src/` directory
2. Test changes with `npm run dev`
3. Build with `npm run build` when ready to distribute
4. The compiled output goes to `dist/` directory

## Testing
Currently, there are no automated tests configured in the project. Testing is done manually by running the CLI commands with various .env file scenarios.