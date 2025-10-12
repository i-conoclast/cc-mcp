# Input Prompt Template for MCP Claude Code

## Complex Problem Decomposition Template

Use this template when you want Claude to break down a complex problem and solve it through parallel MCP calls:

```
[Your main task description here]

If this problem is complex or can be broken down:
1. Decompose it into multiple independent sub-problems
2. Use mcp__claude-code-mcp__claude_code tool to delegate each sub-problem to separate Claude instances
3. Process sub-problems in parallel when possible
4. Integrate the results from all sub-problems into a final solution
```

## Short Version (Copy & Paste)

```
If complex, break this into sub-problems and solve each using mcp__claude-code-mcp__claude_code in parallel.
```

## Examples

### Example 1: Full-Stack Application

```
Build a user authentication system with frontend and backend.

If this problem is complex or can be broken down:
1. Decompose it into multiple independent sub-problems
2. Use mcp__claude-code-mcp__claude_code tool to delegate each sub-problem to separate Claude instances
3. Process sub-problems in parallel when possible
4. Integrate the results from all sub-problems into a final solution
```

### Example 2: Code Refactoring

```
Refactor the legacy codebase to follow clean architecture principles.

If complex, break this into sub-problems and solve each using mcp__claude-code-mcp__claude_code in parallel.
```

### Example 3: Data Analysis Pipeline

```
Build a data analysis pipeline for customer behavior analysis.

If this problem is complex or can be broken down:
1. Decompose it into multiple independent sub-problems
2. Use mcp__claude-code-mcp__claude_code tool to delegate each sub-problem to separate Claude instances
3. Process sub-problems in parallel when possible
4. Integrate the results from all sub-problems into a final solution
```

## Key Points

- **Decompose wisely**: Break down into independent, parallelizable sub-problems
- **Use MCP for each**: Each sub-problem gets its own Claude instance via `mcp__claude-code-mcp__claude_code`
- **Parallel processing**: Multiple Claude instances work simultaneously
- **Integration**: Combine results into a cohesive solution

## Korean Version (한글 버전)

```
[메인 작업 설명]

만약 이 문제가 복잡하거나 분해 가능하다면:
1. 여러 독립적인 하위 문제로 분해하세요
2. mcp__claude-code-mcp__claude_code 도구를 사용해 각 하위 문제를 별도의 Claude 인스턴스에 위임하세요
3. 가능한 경우 하위 문제를 병렬로 처리하세요
4. 모든 하위 문제의 결과를 최종 솔루션으로 통합하세요
```

## 간단한 버전 (복사해서 사용)

```
복잡하면 하위 문제로 나누고 각각 mcp__claude-code-mcp__claude_code로 병렬 처리하세요.
```
