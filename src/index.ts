#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { CLAUDE_CLI_TIMEOUT, FIXED_PROMPT_PREFIX, TOOL_CONFIG } from './config.js';

interface ClaudeCliOptions {
  prompt: string;
}

async function executeClaudeCli(options: ClaudeCliOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    // Prepend fixed prompt prefix to user's prompt
    const fullPrompt = FIXED_PROMPT_PREFIX + options.prompt;

    const args = [
      '-p',
      fullPrompt,
      '--dangerously-skip-permissions', // Always skip permissions
    ];

    console.error(`[MCP] Executing Claude CLI with prompt: ${options.prompt.substring(0, 100)}...`);
    console.error(`[MCP] Full command: claude ${args.join(' ')}`);
    console.error(`[MCP] Started at: ${new Date().toISOString()}`);


    const claude = spawn('claude', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NO_COLOR: '1' }
    });

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout;

    claude.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      // Show actual stdout content for visibility
      console.error(`[MCP] STDOUT: ${chunk}`);
    });

    claude.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      // Pass through stderr so we can see Claude's activity
      console.error(`[CLAUDE] ${chunk}`);
    });

    claude.on('close', (code) => {
      clearTimeout(timeoutId);
      const duration = Date.now();
      console.error(`[MCP] Claude CLI completed with exit code: ${code}`);
      console.error(`[MCP] Total output size: ${stdout.length} bytes`);

      if (code === 0) {
        console.error(`[MCP] Success - returning result`);
        resolve(stdout);
      } else {
        console.error(`[MCP] Error - exit code ${code}`);
        reject(new Error(`Claude CLI exited with code ${code}. Stderr: ${stderr}`));
      }
    });

    claude.on('error', (error) => {
      clearTimeout(timeoutId);
      console.error(`[MCP] Spawn error: ${error.message}`);
      reject(new Error(`Failed to spawn claude CLI: ${error.message}`));
    });

    // Set timeout
    timeoutId = setTimeout(() => {
      console.error(`[MCP] Timeout reached (${CLAUDE_CLI_TIMEOUT}ms) - killing process`);
      claude.kill('SIGTERM');
      reject(new Error(`Claude CLI execution timed out after ${CLAUDE_CLI_TIMEOUT}ms`));
    }, CLAUDE_CLI_TIMEOUT);
  });
}

async function main() {
  const server = new Server(
    {
      name: 'claude-code-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [TOOL_CONFIG],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === TOOL_CONFIG.name) {
      const { prompt } = request.params.arguments as {
        prompt: string;
      };

      if (!prompt) {
        throw new Error('Prompt is required');
      }

      try {
        const result = await executeClaudeCli({
          prompt,
        });

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error executing Claude CLI: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    } else {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (won't interfere with stdio protocol)
  console.error('Claude Code MCP Server running on stdio');
  console.error('Ready to receive requests...');

  // Keep the process alive
  process.stdin.resume();

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.error('SIGTERM received, shutting down...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.error('SIGINT received, shutting down...');
    process.exit(0);
  });

  // Prevent the process from exiting
  setInterval(() => {
    // Keep alive - do nothing
  }, 1000 * 60 * 60); // Check every hour
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});