# env-doctor

A CLI tool to synchronize and validate `.env` files in a project.

## Installation

```bash
npm install -g env-doctor
```

Or run it directly with `npx`:

```bash
npx env-doctor --help
```

## Commands

### `compare`

Compare two environment files and reports:

* Missing variables
* Extra variables
* Different values
* Matching variables

```bash
env-doctor compare -t .env -r .env.example
```

### `fix`

Adds missing variables from a reference `.env` file.

By default, only the variable names are added:

```bash
env-doctor fix -t .env -r .env.example
```

Use `--reference-value` to copy the values from the reference file:

```bash
env-doctor fix -t .env -r .env.example --reference-value
```

Preview changes without modifying the file:

```bash
env-doctor fix -t .env -r .env.example --dry-run
```

### `scan-unused-vars`

Scans your source files to find environment variables that are defined but never used.

```bash
env-doctor scan-unused-vars \
  --src ./src \
  --env .env \
  --extensions ts,js
```

Automatically remove unused variables:

```bash
env-doctor scan-unused-vars \
  --src ./src \
  --env .env \
  --extensions ts,js \
  --fix
```

Preview the removal without modifying the `.env` file:

```bash
env-doctor scan-unused-vars \
  --src ./src \
  --env .env \
  --extensions ts,js \
  --fix \
  --dry-run
```

JSON output is also available:

```bash
env-doctor scan-unused-vars \
  --src ./src \
  --env .env \
  --extensions ts,js \
  --json
```

## Why env-doctor?

Environment files can easily become inconsistent as a project evolves.

`env-doctor` helps detect:

* Variables missing from an environment file
* Variables that should not be there
* Different values between environments
* Unused environment variables
* Incomplete source scans

It is designed to be simple, scriptable, and usable from the command line.

## Development

Clone the repository and install dependencies:

```bash
npm install
```

Run the CLI in development:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

## License

MIT
