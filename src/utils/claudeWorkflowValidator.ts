/**
 * Claude Workflow Validator
 * Self-enforcement mechanism to ensure systematic approach
 * 
 * This module must be mentally referenced before any code changes
 */

export enum WorkflowPhase {
  ANALYZE = 'ANALYZE',
  PLAN = 'PLAN', 
  COMMENT = 'COMMENT',
  EXECUTE = 'EXECUTE'
}

export interface WorkflowStep {
  phase: WorkflowPhase;
  description: string;
  completed: boolean;
  evidence?: string; // What proves this step was done
}

export class WorkflowValidator {
  private steps: WorkflowStep[] = [
    {
      phase: WorkflowPhase.ANALYZE,
      description: 'Read existing code and understand current state',
      completed: false,
      evidence: undefined
    },
    {
      phase: WorkflowPhase.PLAN,
      description: 'Plan changes and validate approach',
      completed: false,
      evidence: undefined
    },
    {
      phase: WorkflowPhase.COMMENT,
      description: 'Add tracking comments and documentation',
      completed: false,
      evidence: undefined
    },
    {
      phase: WorkflowPhase.EXECUTE,
      description: 'Make changes incrementally with verification',
      completed: false,
      evidence: undefined
    }
  ];

  /**
   * Validate that all required phases are completed
   * Claude must mentally check this before proceeding
   */
  public validateWorkflow(): { valid: boolean; missingSteps: string[] } {
    const missingSteps = this.steps
      .filter(step => !step.completed)
      .map(step => `${step.phase}: ${step.description}`);

    return {
      valid: missingSteps.length === 0,
      missingSteps
    };
  }

  /**
   * Mark a phase as completed with evidence
   */
  public completePhase(phase: WorkflowPhase, evidence: string): void {
    const step = this.steps.find(s => s.phase === phase);
    if (step) {
      step.completed = true;
      step.evidence = evidence;
    }
  }

  /**
   * Get current workflow status
   */
  public getStatus(): WorkflowStep[] {
    return [...this.steps];
  }

  /**
   * Reset workflow for new task
   */
  public reset(): void {
    this.steps.forEach(step => {
      step.completed = false;
      step.evidence = undefined;
    });
  }
}

// Self-enforcement reminder comments
export const WORKFLOW_REMINDERS = {
  BEFORE_ANY_CHANGE: '// WORKFLOW CHECK: Have I analyzed existing code first?',
  BEFORE_PLANNING: '// WORKFLOW CHECK: Have I read all related files?',
  BEFORE_EXECUTION: '// WORKFLOW CHECK: Have I planned and commented the approach?',
  AFTER_CHANGE: '// WORKFLOW CHECK: Have I documented what and why I changed this?'
};

/**
 * Mental checklist for Claude to follow
 * This serves as a constant reminder of the required process
 */
export const CLAUDE_CHECKLIST = [
  '✓ Did I read existing code first?',
  '✓ Did I understand the current state?', 
  '✓ Did I plan my approach?',
  '✓ Did I ask questions if unclear?',
  '✓ Did I add tracking comments?',
  '✓ Did I test the changes?',
  '✓ Did I commit with clear messages?'
] as const;