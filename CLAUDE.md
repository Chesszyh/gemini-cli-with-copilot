# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gemini CLI is an open-source AI agent providing Google Gemini model access directly from the terminal. It's built with TypeScript using a monorepo structure with a clean CLI/backend separation.

## Architecture

### Core Packages

- **`packages/cli/`** - The user-facing terminal UI built with React (Ink.js)
  - Handles input/output, theming, command processing
  - Provides interactive shell-like experience
  - Manages user authentication and settings

- **`packages/core/`** - The backend engine
  - Communicates with Gemini API
  - Manages tool execution and orchestration
  - Handles file system operations, shell commands, web search
  - Provides MCP (Model Context Protocol) server support

### Key Technologies
- **Node.js** ≥ 20.0.0
- **TypeScript** - Strict mode, ES modules
- **React** (via Ink) - Terminal UI components
- **Vitest** - Testing framework
- **ESLint** - Strict linting with TypeScript rules
- **esbuild** - Bundling

## Development Commands

### Essential Commands
```bash
make preflight    # Run full validation: format, lint, typecheck, test, build
npm run start     # Start interactive CLI in current directory
make debug        # Start CLI in Node.js debug mode with --inspect-brk
make build-all    # Build everything including sandbox and VS Code companion
```

### Testing
```bash
npm run test                    # Run all tests
npm run test:integration:all    # Run integration tests with all sandbox modes
npm run test:e2e               # Run end-to-end tests with verbose output
npm run lint:fix               # Fix linting issues
npm run typecheck              # Run TypeScript type checking
```

### Development Workflows
```bash
npm run dev                    # Quick start - no sandbox
make create-alias             # Create local 'gemini' shell alias
npx .                          # Run local development version
```

## File Structure

```
gemini-cli/
├── packages/
│   ├── cli/           # Terminal UI and user interface
│   │   ├── src/
│   │   │   ├── ui/    # React components for terminal
│   │   │   ├── commands/  # Slash commands and built-ins
│   │   │   └── services/  # Utility services
│   │
│   ├── core/          # Core engine and API interaction
│   │   ├── src/
│   │   │   ├── tools/     # File system, shell, search tools
│   │   │   ├── telemetry/ # Usage analytics
│   │   │   └── core/      # Gemini API client and main logic
│   │
│   └── vscode-ide-companion/  # VS Code extension
├── integration-tests/ # Integration test suite
├── scripts/          # Build and deployment scripts
└── bundle/           # Compiled CLI executable
```

## Testing Patterns

### Test Structure
- **Vitest** with TypeScript support
- Tests co-located with source files (`*.test.ts`)
- **Integration tests** in `integration-tests/` directory
- **Mocks** use `vi.mock()` for ESM module mocking
- **Hooks** testing with React Testing Library patterns

### Key Testing Conventions
- Use `vi.resetAllMocks()` in `beforeEach`
- Mock Node.js built-ins (`fs`, `os`, `process`) at module level
- Use `vi.hoisted()` for mock functions needed before initialization
- Follow functional testing patterns over class-based

## Code Style Guidelines

### TypeScript
- Strict mode enabled (no implicit any, strict null checks)
- Prefer plain objects over classes with TypeScript interfaces
- Use ES modules exclusively (no CommonJS require)
- Avoid `any` - use `unknown` when type unknown
- Use exhaustive switch statements with `checkExhaustive` helper

### React/Components
- Functional components with hooks only
- No class components or legacy lifecycle methods
- Keep components pure and side-effect-free during render
- Use React Compiler optimizations (no manual useMemo/useCallback)
- Follow one-way data flow with props/state

### Module Organization
- Use ES module `export`/`import` for public APIs
- Private/internal code remains unexported
- Clear module boundaries reduce coupling
- Utils grouped by functionality area

## Authentication Options

Gemini CLI supports three authentication methods:

1. **OAuth (Recommended)** - Personal Google account with free tier
2. **API Key** - Manual key management from Google AI Studio
3. **Vertex AI** - Enterprise Google Cloud integration

Configuration stored in `~/.gemini/settings.json`

## Build System

### Build Process
1. **Type checking** via `tsc --noEmit`
2. **Linting** with ESLint (strict rules)
3. **Bundling** with esbuild
4. **Packaging** for npm distribution

### Build Targets
- Main CLI: `bundle/gemini.js`
- Sandbox container: Docker/Podman with security configs
- VS Code extension: Separate compilation path

## Key Commands and Tools

### CLI Commands
- `/help` - Show all available commands
- `/mcp` - Manage MCP server connections
- `/memory` - Context file management
- `/theme` - Terminal theme switching
- `/quit` - Exit the CLI

### Built-in Tools
- **File operations** - read, write, edit, glob, grep
- **Shell execution** - Run system commands with confirmation
- **Web operations** - fetch pages, search with grounding
- **Memory operations** - save/recall conversation context
- **Git integration** - repository-aware operations

## Environment Setup

### Prerequisites
- Node.js ≥ 20.0.0
- TypeScript ≥ latest
- esbuild for bundling
- Docker/Podman for sandbox testing (optional)

### Quick Start for Development
```bash
git clone https://github.com/google-gemini/gemini-cli.git
cd gemini-cli
npm install
make preflight  # Validate everything works
```

## Configuration Files

- `~/.gemini/settings.json` - User preferences and API keys
- `.geminiignore` - Project-specific ignore patterns
- `GEMINI.md` - Project-specific context files
- `/etc/gemini/settings.json` (Linux) - System-wide configuration