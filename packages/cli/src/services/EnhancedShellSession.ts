/**
 * @license
 * Copyright 2025 Chesszyh
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pty from 'node-pty';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { type IPty } from 'node-pty';
import { GeminiClient } from '@google/gemini-cli-core';
import { 
  AiCommandSuggestionService, 
  type CommandSuggestion, 
  type ShellContext,
  type ErrorSuggestion
} from './AiCommandSuggestionService.js';

export type { CommandSuggestion, ErrorSuggestion } from './AiCommandSuggestionService.js';

export interface ShellEnhancement {
  syntaxHighlighting: boolean;
  autosuggestions: boolean;
  aiSuggestions: boolean;
}

export interface ShellEnvironmentInfo {
  shell: string;
  shellRc: string;
  ohMyZshEnabled: boolean;
  pluginsEnabled: string[];
}

export interface EnhancedShellSession {
  readonly pid: number;
  readonly environmentInfo: ShellEnvironmentInfo;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
  getCommandSuggestion(partialCommand: string): Promise<CommandSuggestion[]>;
  getErrorSuggestions(
    failedCommand: string,
    errorOutput: string,
    exitCode: number,
  ): Promise<ErrorSuggestion[]>;
  highlightCommand(command: string): string;
  addCommandToHistory(command: string): void;
}

export interface EnhancedShellSessionOptions {
  onData: (data: string) => void;
  onExit: (exitCode: number, signal?: number) => void;
  onError: (error: Error) => void;
  cwd: string;
  cols?: number;
  rows?: number;
  enhancement: ShellEnhancement;
  geminiClient?: GeminiClient;
}

/**
 * Detects the user's shell environment and available plugins
 */
function detectShellEnvironment(): ShellEnvironmentInfo {
  const shell = process.env['SHELL'] || '/bin/bash';
  const homeDir = os.homedir();
  
  let shellRc = '';
  let ohMyZshEnabled = false;
  let pluginsEnabled: string[] = [];

  if (shell.includes('zsh')) {
    shellRc = path.join(homeDir, '.zshrc');
    
    // Check if oh-my-zsh is installed
    const ohMyZshDir = path.join(homeDir, '.oh-my-zsh');
    ohMyZshEnabled = fs.existsSync(ohMyZshDir);
    
    // Try to read .zshrc to detect plugins
    if (fs.existsSync(shellRc)) {
      try {
        const zshrcContent = fs.readFileSync(shellRc, 'utf8');
        
        // Extract plugins from oh-my-zsh configuration
        const pluginsMatch = zshrcContent.match(/plugins=\(([\s\S]*?)\)/);
        if (pluginsMatch) {
          pluginsEnabled = pluginsMatch[1]
            .split(/\s+/)
            .map(p => p.trim())
            .filter(p => p && !p.startsWith('#'));
        }
        
        // Check for manually installed plugins
        if (zshrcContent.includes('zsh-syntax-highlighting')) {
          pluginsEnabled.push('zsh-syntax-highlighting');
        }
        if (zshrcContent.includes('zsh-autosuggestions')) {
          pluginsEnabled.push('zsh-autosuggestions');
        }
      } catch (error) {
        console.warn('Failed to read .zshrc:', error);
      }
    }
  } else if (shell.includes('bash')) {
    shellRc = path.join(homeDir, '.bashrc');
  }

  return {
    shell,
    shellRc,
    ohMyZshEnabled,
    pluginsEnabled,
  };
}

/**
 * Creates an enhanced shell session with environment inheritance and plugins
 */
export function createEnhancedShellSession(
  options: EnhancedShellSessionOptions,
): EnhancedShellSession {
  const environmentInfo = detectShellEnvironment();
  
  let ptyProcess: IPty;
  let aiSuggestionService: AiCommandSuggestionService | null = null;
  let commandHistory: string[] = [];
  
  // Initialize AI suggestion service if available
  if (options.enhancement.aiSuggestions && options.geminiClient) {
    aiSuggestionService = new AiCommandSuggestionService(options.geminiClient);
  }
  
  // Prepare environment variables
  const env = { ...process.env };
  
  // Ensure shell enhancement features are available
  if (options.enhancement.syntaxHighlighting && environmentInfo.shell.includes('zsh')) {
    // Add zsh-syntax-highlighting to FPATH if available
    const highlightingPath = path.join(os.homedir(), '.oh-my-zsh/plugins/zsh-syntax-highlighting');
    if (fs.existsSync(highlightingPath)) {
      env['FPATH'] = `${highlightingPath}:${env['FPATH'] || ''}`;
    }
  }

  try {
    ptyProcess = pty.spawn(environmentInfo.shell, [], {
      name: 'xterm-256color',
      cols: options.cols ?? 80,
      rows: options.rows ?? 30,
      cwd: options.cwd,
      env: env as { [key: string]: string },
    });
  } catch (e) {
    options.onError(e as Error);
    return createFallbackSession(environmentInfo);
  }

  // Initialize shell with proper configuration
  if (environmentInfo.shell.includes('zsh') && fs.existsSync(environmentInfo.shellRc)) {
    // Load user's .zshrc but with some optimizations for our use case
    ptyProcess.write(`source "${environmentInfo.shellRc}"\n`);
    
    // Enable syntax highlighting if available and requested
    if (options.enhancement.syntaxHighlighting) {
      if (environmentInfo.pluginsEnabled.includes('zsh-syntax-highlighting')) {
        ptyProcess.write('# zsh-syntax-highlighting already enabled\n');
      } else {
        // Try to load it manually
        ptyProcess.write(`
# Try to enable syntax highlighting
for dir in /usr/share/zsh-syntax-highlighting ~/.oh-my-zsh/plugins/zsh-syntax-highlighting; do
  if [[ -f "$dir/zsh-syntax-highlighting.zsh" ]]; then
    source "$dir/zsh-syntax-highlighting.zsh"
    break
  fi
done
`);
      }
    }
    
    // Enable autosuggestions if available and requested
    if (options.enhancement.autosuggestions) {
      if (environmentInfo.pluginsEnabled.includes('zsh-autosuggestions')) {
        ptyProcess.write('# zsh-autosuggestions already enabled\n');
      } else {
        // Try to load it manually
        ptyProcess.write(`
# Try to enable autosuggestions
for dir in /usr/share/zsh-autosuggestions ~/.oh-my-zsh/plugins/zsh-autosuggestions; do
  if [[ -f "$dir/zsh-autosuggestions.zsh" ]]; then
    source "$dir/zsh-autosuggestions.zsh"
    break
  fi
done
`);
      }
    }
  }

  ptyProcess.onData((data) => {
    options.onData(data);
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    options.onExit(exitCode, signal);
  });

  // Enhanced shell session implementation
  return {
    pid: ptyProcess.pid,
    environmentInfo,
    
    write: (data: string) => ptyProcess.write(data),
    
    resize: (cols: number, rows: number) => ptyProcess.resize(cols, rows),
    
    kill: () => ptyProcess.kill(),
    
    getCommandSuggestion: async (partialCommand: string): Promise<CommandSuggestion[]> => {
      if (!options.enhancement.aiSuggestions || !aiSuggestionService) {
        return getBasicCommandSuggestions(partialCommand);
      }
      
      const context: ShellContext = {
        shell: environmentInfo.shell,
        ohMyZshEnabled: environmentInfo.ohMyZshEnabled,
        pluginsEnabled: environmentInfo.pluginsEnabled,
        workingDirectory: options.cwd,
        lastCommands: commandHistory,
      };
      
      try {
        return await aiSuggestionService.getCommandSuggestions(partialCommand, context);
      } catch (error) {
        console.warn('AI suggestion failed, falling back to basic suggestions:', error);
        return getBasicCommandSuggestions(partialCommand);
      }
    },
    
    getErrorSuggestions: async (
      failedCommand: string,
      errorOutput: string,
      exitCode: number,
    ): Promise<ErrorSuggestion[]> => {
      if (!options.enhancement.aiSuggestions || !aiSuggestionService) {
        return [];
      }
      
      const context: ShellContext = {
        shell: environmentInfo.shell,
        ohMyZshEnabled: environmentInfo.ohMyZshEnabled,
        pluginsEnabled: environmentInfo.pluginsEnabled,
        workingDirectory: options.cwd,
        lastCommands: commandHistory,
      };
      
      return aiSuggestionService.getErrorSuggestions(
        failedCommand,
        errorOutput,
        context,
      );
    },
    
    highlightCommand: (command: string): string => {
      if (!options.enhancement.syntaxHighlighting) {
        return command;
      }
      
      // Basic command highlighting (this would be enhanced with actual zsh highlighting)
      return highlightBasicSyntax(command);
    },
    
    addCommandToHistory: (command: string): void => {
      commandHistory.push(command);
      if (commandHistory.length > 50) {
        commandHistory = commandHistory.slice(-50);
      }
      // Command history is automatically used by AI service through context
    },
  };
}

/**
 * Creates a fallback session when PTY creation fails
 */
function createFallbackSession(environmentInfo: ShellEnvironmentInfo): EnhancedShellSession {
  return {
    pid: -1,
    environmentInfo,
    write: () => {},
    resize: () => {},
    kill: () => {},
    getCommandSuggestion: async (partialCommand: string) => getBasicCommandSuggestions(partialCommand),
    getErrorSuggestions: async (failedCommand: string, errorOutput: string, exitCode: number): Promise<ErrorSuggestion[]> => [],
    highlightCommand: (command: string) => command,
    addCommandToHistory: () => {},
  };
}

/**
 * Provides basic command suggestions based on common patterns
 */
function getBasicCommandSuggestions(partialCommand: string): CommandSuggestion[] {
  const suggestions: CommandSuggestion[] = [];
  
  // Common command patterns
  const commandPatterns = {
    'git ': [
      { command: 'git status', description: 'Show working tree status', reason: 'Most commonly used git command' },
      { command: 'git add .', description: 'Add all changes to staging', reason: 'Prepare changes for commit' },
      { command: 'git commit -m ""', description: 'Commit with message', reason: 'Save changes to repository' },
      { command: 'git push', description: 'Push commits to remote', reason: 'Share changes with team' },
      { command: 'git pull', description: 'Pull changes from remote', reason: 'Get latest changes' },
    ],
    'npm ': [
      { command: 'npm install', description: 'Install dependencies', reason: 'Set up project dependencies' },
      { command: 'npm start', description: 'Start the application', reason: 'Run development server' },
      { command: 'npm test', description: 'Run tests', reason: 'Verify code quality' },
      { command: 'npm run build', description: 'Build the project', reason: 'Prepare for production' },
    ],
    'conda ': [
      { command: 'conda create -n myenv python=3.9', description: 'Create new environment', reason: 'Isolate project dependencies' },
      { command: 'conda activate', description: 'Activate environment', reason: 'Switch to project environment' },
      { command: 'conda list', description: 'List installed packages', reason: 'Check environment contents' },
      { command: 'conda deactivate', description: 'Deactivate current environment', reason: 'Return to base environment' },
    ],
    'docker ': [
      { command: 'docker ps', description: 'List running containers', reason: 'Check container status' },
      { command: 'docker build -t name .', description: 'Build image from Dockerfile', reason: 'Create container image' },
      { command: 'docker run -it image', description: 'Run container interactively', reason: 'Start new container' },
    ],
  };
  
  for (const [prefix, completions] of Object.entries(commandPatterns)) {
    if (partialCommand.startsWith(prefix)) {
      const remaining = partialCommand.slice(prefix.length);
      suggestions.push(
        ...completions
          .filter(comp => comp.command.toLowerCase().includes(remaining.toLowerCase()))
          .slice(0, 3)
      );
      break;
    }
  }
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Provides basic syntax highlighting for commands
 */
function highlightBasicSyntax(command: string): string {
  // This is a basic implementation - in a real scenario, we'd use zsh's highlighting
  const keywords = ['if', 'then', 'else', 'fi', 'for', 'while', 'do', 'done', 'function'];
  const commands = ['ls', 'cd', 'git', 'npm', 'conda', 'docker', 'cat', 'grep', 'find'];
  
  let highlighted = command;
  
  // Highlight keywords in yellow
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    highlighted = highlighted.replace(regex, `\x1b[33m${keyword}\x1b[0m`);
  });
  
  // Highlight common commands in green
  commands.forEach(cmd => {
    const regex = new RegExp(`\\b${cmd}\\b`, 'g');
    highlighted = highlighted.replace(regex, `\x1b[32m${cmd}\x1b[0m`);
  });
  
  // Highlight strings in cyan
  highlighted = highlighted.replace(/(["'])(.*?)\1/g, '\x1b[36m$1$2$1\x1b[0m');
  
  return highlighted;
}
