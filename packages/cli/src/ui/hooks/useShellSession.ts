/**
 * @license
 * Copyright 2025 Chesszyh
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  createShellSession,
  type ShellSession,
  type ShellSessionOptions,
} from '../../services/ShellSession.js';
import {
  createEnhancedShellSession,
  type EnhancedShellSession,
  type EnhancedShellSessionOptions,
  type ShellEnvironmentInfo,
  type CommandSuggestion,
} from '../../services/EnhancedShellSession.js';
import { Config, GeminiClient } from '@google/gemini-cli-core';
import { LoadedSettings } from '../../config/settings.js';

export interface ShellSessionState {
  isActive: boolean;
  output: string;
  pid: number | null;
  environmentInfo?: ShellEnvironmentInfo;
  isEnhanced: boolean;
}

export interface UseShellSessionReturn extends ShellSessionState {
  startSession: () => void;
  endSession: () => void;
  sendInput: (data: string) => void;
  clearOutput: () => void;
  getCommandSuggestion: (partialCommand: string) => Promise<CommandSuggestion[]>;
  highlightCommand: (command: string) => string;
}

export interface UseShellSessionOptions {
  config: Config;
  settings: LoadedSettings;
  geminiClient?: GeminiClient;
}

export function useShellSession(options: UseShellSessionOptions): UseShellSessionReturn {
  const [state, setState] = useState<ShellSessionState>({
    isActive: false,
    output: '',
    pid: null,
    isEnhanced: false,
  });
  const sessionRef = useRef<ShellSession | EnhancedShellSession | null>(null);
  const { config, settings, geminiClient } = options;

  const isEnhancementEnabled = settings.merged.shellEnhancementEnabled ?? true;

  const handleData = useCallback((data: string) => {
    setState((prevState) => ({
      ...prevState,
      output: prevState.output + data,
    }));
  }, []);

  const handleExit = useCallback(() => {
    setState({ 
      isActive: false, 
      output: '', 
      pid: null, 
      isEnhanced: false 
    });
    sessionRef.current = null;
  }, []);

  const handleError = useCallback((error: Error) => {
    const errorMessage = `\r\n\x1b[31mShell session error: ${error.message}\x1b[0m\r\n`;
    setState((prevState) => ({
      ...prevState,
      output: prevState.output + errorMessage,
    }));
    // The session might already be dead, but try to kill it just in case.
    sessionRef.current?.kill();
    sessionRef.current = null;
    // Deactivate the session on error
    setState((prevState) => ({ 
      ...prevState, 
      isActive: false, 
      pid: null,
      isEnhanced: false
    }));
  }, []);

  const startSession = useCallback(() => {
    if (sessionRef.current) {
      return;
    }

    const baseOptions = {
      onData: handleData,
      onExit: handleExit,
      onError: handleError,
      cwd: config.getTargetDir(),
      // TODO: Make cols/rows dynamic based on terminal size
      cols: process.stdout.columns,
      rows: process.stdout.rows,
    };

    if (isEnhancementEnabled) {
      // Use enhanced shell session
      const enhancedOptions: EnhancedShellSessionOptions = {
        ...baseOptions,
        enhancement: {
          syntaxHighlighting: settings.merged.shellSyntaxHighlighting ?? true,
          autosuggestions: settings.merged.shellAutosuggestions ?? true,
          aiSuggestions: settings.merged.shellAiSuggestions ?? true,
        },
        geminiClient,
      };

      const newSession = createEnhancedShellSession(enhancedOptions);
      sessionRef.current = newSession;

      setState({
        isActive: true,
        output: '',
        pid: newSession.pid,
        environmentInfo: newSession.environmentInfo,
        isEnhanced: true,
      });
    } else {
      // Use basic shell session (fallback)
      const basicOptions: ShellSessionOptions = baseOptions;
      const newSession = createShellSession(basicOptions);
      sessionRef.current = newSession;

      setState({
        isActive: true,
        output: '',
        pid: newSession.pid,
        isEnhanced: false,
      });
    }
  }, [
    config,
    handleData,
    handleExit,
    handleError,
    isEnhancementEnabled,
    settings.merged.shellSyntaxHighlighting,
    settings.merged.shellAutosuggestions,
    settings.merged.shellAiSuggestions,
    geminiClient,
  ]);

  const endSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.kill();
      sessionRef.current = null;
    }
    setState({ 
      isActive: false, 
      output: '', 
      pid: null, 
      isEnhanced: false 
    });
  }, []);

  const sendInput = useCallback((data: string) => {
    if (sessionRef.current) {
      sessionRef.current.write(data);
    }
  }, []);

  const clearOutput = useCallback(() => {
    // This is a UI-only clear, it doesn't send a "clear" command to the shell
    setState((prevState) => ({ ...prevState, output: '' }));
  }, []);

  const getCommandSuggestion = useCallback(async (partialCommand: string): Promise<CommandSuggestion[]> => {
    if (sessionRef.current && 'getCommandSuggestion' in sessionRef.current) {
      return sessionRef.current.getCommandSuggestion(partialCommand);
    }
    return [];
  }, []);

  const highlightCommand = useCallback((command: string): string => {
    if (sessionRef.current && 'highlightCommand' in sessionRef.current) {
      return sessionRef.current.highlightCommand(command);
    }
    return command;
  }, []);

  // Ensure the shell process is killed on unmount
  useEffect(() => {
    return () => {
      sessionRef.current?.kill();
    };
  }, []);

  return {
    ...state,
    startSession,
    endSession,
    sendInput,
    clearOutput,
    getCommandSuggestion,
    highlightCommand,
  };
}
