# Claude Code MCP Server

## 목표

Claude Code 내에서 Claude Code CLI를 호출하는 MCP 서버를 구축

## 세부 요구사항

### 1. 클로드 코드를 호출하는 MCP 서버 구현

- 목적: 클로드 코드 세션에서 입력을 받아서 해당 입력을 MCP에 전달해서, MCP가 호출하는 또다른 클로드 코드에 최종적으로 전달되어 출력이 되고, 이것이 다시 가장 바깥의 클로드 코드 세션에 도달하도록 하는 것

- MCP 명세

  ```markdown
  {
    name: 'claude_code',
    description: 'Execute Claude Code CLI with a given prompt. Automatically uses sub-agent and creates a plan.',
    parameters: {
      prompt: string (required),
      workspace_dir: string (optional) // --add-dir로 전달됨
    }
  }
  ```

### 2. 해당 MCP를 사용하는 프롬프트 작성 (예시)

  1. Basic File Creation

```
Use mcp__claude-code-mcp__claude_code to create a simple HTTP client utility in src/utils/http_client.py with
  proper error handling and type hints.
```

    2. Feature Implementation with Testing

  ```
Use mcp__claude-code-mcp__claude_code to implement a user authentication service with JWT tokens in the
  auth-service directory. Include unit tests using pytest.
  ```

    3. Refactoring Task

```
 Use mcp__claude-code-mcp__claude_code to refactor the large database.py file in src/models/ by splitting it into
  separate modules for each model class, following the directory structure pattern.
```

### 3. MCP 내 고정 프롬프트를 이용하여 Sub-agent 및 Plan을 사용

```
최종 프롬프트 = 고정 프리픽스 + 사용자 프롬프트

고정 프리픽스:
"Use the Task tool to handle this request. Choose the most appropriate subagent_type based on the nature of the task (e.g., code-reviewer, debugger, data-scientist, test-writer, documenter, or general-purpose).
Create a detailed plan first, then execute it step by step.

User request: {USER_PROMPT}"
```

### 4. MCP를 재귀적으로 호출하는 기능

```markdown
최종 프롬프트 = 고정 프리픽스 + 사용자 프롬프트

고정 프리픽스:
"Use the Task tool to handle this request. Choose the most appropriate subagent_type based on the nature of the task (e.g., code-reviewer, debugger, data-scientist, test-writer, documenter, or general-purpose).
Create a detailed plan first, then execute it step by step.

**If the problem is complex or large, break it down into smaller sub-problems and use
the mcp__claude-code-mcp__claude_code tool recursively to delegate each sub-problem
to separate Claude instances. This allows parallel processing and better problem
decomposition.**

User request: {USER_PROMPT}"
```

```
사용자 프롬프트

Use mcp__claude-code-mcp__claude_code to {TASK DESCRIPTION}

 If this is a complex or large problem:
  1. Break it down into smaller sub-problems
  2. Use mcp__claude-code-mcp__claude_code recursively to solve each sub-problem (incrementing depth parameter)
  3. In the final response, provide a clear summary showing:
     - How the problem was decomposed at each depth level
     - What sub-tasks were created and delegated
     - How each depth level contributed to the solution
     - A tree structure or outline of the problem decomposition

  Format the decomposition summary like:
  [Depth 1] Main Problem: [description]
    ├─ [Depth 2] Sub-problem 1: [description] → [status/result]
    ├─ [Depth 2] Sub-problem 2: [description] → [status/result]
    │   ├─ [Depth 3] Sub-sub-problem 2.1: [description] → [status/result]
    │   └─ [Depth 3] Sub-sub-problem 2.2: [description] → [status/result]
    └─ [Depth 2] Sub-problem 3: [description] → [status/result]
```



