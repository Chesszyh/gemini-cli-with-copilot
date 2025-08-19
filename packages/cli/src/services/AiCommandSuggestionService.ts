/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shell environment context for command suggestions
 */
export interface ShellContext {
  shell: string;
  ohMyZshEnabled: boolean;
  pluginsEnabled: string[];
  workingDirectory: string;
  lastCommands: string[];
}

/**
 * Command suggestion response
 */
export interface CommandSuggestion {
  command: string;
  description: string;
  reason: string;
}

/**
 * Error suggestion response
 */
export interface ErrorSuggestion {
  problem: string;
  solution: string;
  preventiveMeasures: string[];
}

/**
 * Service for AI-powered command suggestions and error analysis
 * This is a simplified version that provides basic suggestions without AI integration
 * until the Gemini client API issues are resolved.
 */
export class AiCommandSuggestionService {
  constructor(geminiClient?: any) {
    // Store client for future use when API is fixed
  }

  /**
   * Get command suggestions based on partial input and context
   */
  async getCommandSuggestions(
    partialCommand: string,
    context: ShellContext,
  ): Promise<CommandSuggestion[]> {
    // For now, return basic suggestions
    return this.getBasicCommandSuggestions(partialCommand);
  }

  /**
   * Get error analysis and suggestions for failed commands
   */
  async getErrorSuggestions(
    command: string,
    errorOutput: string,
    context: ShellContext,
  ): Promise<ErrorSuggestion[]> {
    return this.getBasicErrorSuggestions(command, errorOutput);
  }

  /**
   * Fallback basic command suggestions
   */
  private getBasicCommandSuggestions(partialCommand: string): CommandSuggestion[] {
    const basicSuggestions: CommandSuggestion[] = [
      {
        command: `${partialCommand} --help`,
        description: 'Show help for this command',
        reason: 'Getting help is always useful',
      },
    ];

    // Add common completions based on partial command
    if (partialCommand.startsWith('git')) {
      basicSuggestions.push(
        {
          command: 'git status',
          description: 'Show repository status',
          reason: 'Common git workflow command',
        },
        {
          command: 'git log --oneline',
          description: 'Show commit history',
          reason: 'Useful for reviewing changes',
        },
      );
    } else if (partialCommand.startsWith('npm')) {
      basicSuggestions.push(
        {
          command: 'npm install',
          description: 'Install dependencies',
          reason: 'Common npm operation',
        },
        {
          command: 'npm run',
          description: 'Run npm script',
          reason: 'Execute package.json scripts',
        },
      );
    } else if (partialCommand.startsWith('ls')) {
      basicSuggestions.push(
        {
          command: 'ls -la',
          description: 'List files with details',
          reason: 'Show file permissions and hidden files',
        },
        {
          command: 'ls -lh',
          description: 'List files with human-readable sizes',
          reason: 'Easier to read file sizes',
        },
      );
    } else if (partialCommand.startsWith('cd')) {
      basicSuggestions.push(
        {
          command: 'cd ..',
          description: 'Go to parent directory',
          reason: 'Common navigation pattern',
        },
        {
          command: 'cd ~',
          description: 'Go to home directory',
          reason: 'Quick way to get home',
        },
      );
    }

    return basicSuggestions;
  }

  /**
   * Fallback basic error suggestions
   */
  private getBasicErrorSuggestions(command: string, errorOutput: string): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];

    if (errorOutput.includes('command not found') || errorOutput.includes('not found')) {
      suggestions.push({
        problem: 'Command not found',
        solution: 'Install the missing command or check spelling',
        preventiveMeasures: ['Use "which <command>" to verify installation', 'Check PATH environment variable'],
      });
    }

    if (errorOutput.includes('permission denied') || errorOutput.includes('Permission denied')) {
      suggestions.push({
        problem: 'Permission denied',
        solution: 'Run with sudo or change file permissions',
        preventiveMeasures: ['Check file ownership with "ls -la"', 'Use chmod to adjust permissions'],
      });
    }

    if (errorOutput.includes('No such file or directory')) {
      suggestions.push({
        problem: 'File or directory not found',
        solution: 'Check the file path and ensure it exists',
        preventiveMeasures: ['Use "ls" to list directory contents', 'Verify file spelling and case'],
      });
    }

    if (errorOutput.includes('syntax error') || errorOutput.includes('invalid syntax')) {
      suggestions.push({
        problem: 'Syntax error in command',
        solution: 'Check command syntax and fix any typos',
        preventiveMeasures: ['Use command --help for usage information', 'Check command documentation'],
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        problem: 'Command failed',
        solution: 'Check command syntax and try with --help flag',
        preventiveMeasures: ['Read command documentation', 'Check for typos', 'Verify required dependencies'],
      });
    }

    return suggestions;
  }
}
