# Claude Workflow Protocol - Mandatory Process

## CRITICAL: This protocol MUST be followed for every task

### Phase 1: ANALYZE FIRST (Required)
```
1. Read existing code/files related to the task
2. Use Grep/Glob to find all related components
3. Check current state vs desired state
4. Identify dependencies and conflicts
```

### Phase 2: PLAN AND VALIDATE (Required)
```
1. Write clear analysis of what needs to be done
2. List all files that will be modified
3. Check for conflicts with existing implementations
4. Ask clarifying questions if unclear
```

### Phase 3: COMMENT AND DOCUMENT (Required)
```
1. Add tracking comments to all modified code
2. Document the reasoning for changes
3. Reference this protocol in commit messages
4. Update this file if protocol needs changes
```

### Phase 4: EXECUTE SYSTEMATICALLY (Required)
```
1. Make changes incrementally
2. Test/verify each change
3. Commit with descriptive messages
4. Confirm results match expectations
```

## VIOLATION CONSEQUENCES
- If I skip analysis: STOP and start over
- If I don't read existing code: INVALID approach
- If I make assumptions: ASK QUESTIONS first
- If I don't comment changes: INCOMPLETE work

## ENFORCEMENT MECHANISM
This file serves as my "constitution" - I must reference it before any significant code changes.

## LAST UPDATED
Date: 2025-01-21
Reason: Establish mandatory systematic approach to prevent hallucination and maintain code quality