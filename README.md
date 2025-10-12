# Claude Code MCP Server

A Model Context Protocol (MCP) server that wraps Claude Code CLI, allowing Claude instances to delegate tasks to other Claude instances with automatic sub-agent selection and planning.

## Overview

This MCP server provides a `claude_code` tool that:
- Executes Claude Code CLI with intelligent sub-agent selection
- Automatically creates detailed plans before execution
- Supports workspace directory specification
- Provides comprehensive logging of all activities

## Features

- **Automatic Sub-agent Selection**: Claude intelligently chooses the appropriate sub-agent (code-reviewer, debugger, data-scientist, test-writer, documenter, or general-purpose) based on task nature
- **Plan-First Execution**: Always creates a detailed plan before executing tasks
- **Recursive Problem Decomposition**: Automatically breaks down complex problems into smaller sub-tasks and delegates them to separate Claude instances for parallel processing
- **Workspace Support**: Optional workspace directory specification for file operations
- **Comprehensive Logging**: All activities logged with `[MCP]` and `[CLAUDE]` prefixes
- **Keep-Alive Design**: Server runs continuously without timing out

## Installation

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Usage

### Running the Server

Start the MCP server:
```bash
npm run start > mcp-server.log 2>&1 &
```

Check server status:
```bash
ps aux | grep "tsx src/index.ts" | grep -v grep
```

View logs:
```bash
tail -f mcp-server.log
```

### Using with Claude Code

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "claude-code-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/cc-mcp/dist/index.js"]
    }
  }
}
```

Then use in Claude Code:
```bash
claude --mcp-config ./claude_mcp_config.json
```

## MCP Tool Specification

### Tool: `mcp__claude-code-mcp__claude_code`

**Description**: Execute Claude Code CLI with automatic sub-agent selection and planning.

**Parameters:**
- `prompt` (string, required): The task or request to delegate
- `workspace_dir` (string, optional): Workspace directory path for file operations

**How it works:**
Every request is automatically prefixed with:
```
Use the Task tool to handle this request. Choose the most appropriate subagent_type
based on the nature of the task (e.g., code-reviewer, debugger, data-scientist,
test-writer, documenter, or general-purpose).
Create a detailed plan first, then execute it step by step.

If the problem is complex or large, break it down into smaller sub-problems and use
the mcp__claude-code-mcp__claude_code tool recursively to delegate each sub-problem
to separate Claude instances. This allows parallel processing and better problem
decomposition.

User request: {your_prompt}
```

**Examples:**

1. Simple task:
```
Use mcp__claude-code-mcp__claude_code with prompt "Create a Python function to reverse a string"
```

2. With workspace:
```
Use mcp__claude-code-mcp__claude_code with:
- prompt: "Refactor the authentication module"
- workspace_dir: "/Users/sora/projects/my-app"
```

## Logging

All activities are logged to stderr with prefixes:

- **`[MCP]`**: MCP server activities
  - Request start/completion
  - Command execution details
  - Timeouts and errors

- **`[CLAUDE]`**: Secondary Claude instance activities
  - Tool usage (Read, Edit, Bash, etc.)
  - Progress updates
  - Debug information

**View logs:**
```bash
# All logs
tail -f mcp-server.log

# Claude activities only
grep "\[CLAUDE\]" mcp-server.log

# MCP server logs only
grep "\[MCP\]" mcp-server.log
```

## Architecture

```
Primary Claude Code Instance
    ↓
MCP Protocol (stdio)
    ↓
cc-mcp Server
    ├─ Automatic prefix injection
    ├─ Sub-agent selection instruction
    └─ Planning requirement
    ↓
Claude Code CLI (--dangerously-skip-permissions --add-dir)
    ↓
Secondary Claude Instance
    ├─ Chooses appropriate sub-agent
    ├─ Creates detailed plan
    ├─ If complex: Recursively calls mcp__claude-code-mcp__claude_code
    │   └─ Spawns additional Claude instances for sub-tasks
    └─ Executes step by step
    ↓
Response back through MCP
```

## Configuration

### Server Defaults
- **Timeout**: 600000ms (10 minutes)
- **Permissions**: Always skipped (`--dangerously-skip-permissions`)
- **Environment**: `NO_COLOR=1`

### File Structure
```
cc-mcp/
├── src/
│   └── index.ts           # Main MCP server
├── test/
│   └── test-direct.ts     # Direct CLI test
├── dist/                  # Built files
├── docs/
│   └── 요구사항명세서.md  # Requirements (Korean)
├── claude_mcp_config.json # MCP configuration
├── mcp-server.log         # Server logs
├── package.json
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode (auto-reload)
npm run dev
```

## Server Management

**Start:**
```bash
npm run start > mcp-server.log 2>&1 &
```

**Stop:**
```bash
pkill -f "tsx src/index.ts"
```

**Restart:**
```bash
pkill -f "tsx src/index.ts" && sleep 1 && npm run start > mcp-server.log 2>&1 &
```

**Check if running:**
```bash
ps aux | grep "tsx src/index.ts" | grep -v grep
```

## Requirements

- Node.js 18+
- Claude Code CLI installed and available in PATH
- TypeScript 5.0+
- Valid Claude API key (for Claude Code CLI)

## License

ISC