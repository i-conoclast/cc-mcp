// MCP Server Configuration

export const CLAUDE_CLI_TIMEOUT = 36000000; // 10 hours

export const FIXED_PROMPT_PREFIX = `Use the Task tool to handle this request. 
Choose the most appropriate subagent_type based on the nature of the task 
(e.g., code-reviewer, debugger, data-scientist, test-writer, documenter, or general-purpose).
Create a detailed plan first, then execute it step by step.
User request: `;

export const TOOL_CONFIG = {
  name: 'claude_code',
  description: 'Delegate a task to another Claude instance for execution',
  inputSchema: {
    type: 'object' as const,
    properties: {
      prompt: {
        type: 'string' as const,
        description: 'The task or request to delegate to Claude Code CLI',
      },
    },
    required: ['prompt'],
  },
};
