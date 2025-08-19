/**
 * @license
 * Copyright 2025 Chesszyh
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { CommandSuggestion } from '../../services/EnhancedShellSession.js';

interface SmartCommandInputProps {
  value: string;
  onSubmit: (command: string) => void;
  getCommandSuggestion: (partialCommand: string) => Promise<CommandSuggestion[]>;
  highlightCommand: (command: string) => string;
  isActive: boolean;
}

export function SmartCommandInput({
  value,
  onSubmit,
  getCommandSuggestion,
  highlightCommand,
  isActive,
}: SmartCommandInputProps) {
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Debounced suggestion fetching
  useEffect(() => {
    if (!value.trim() || !isActive) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const newSuggestions = await getCommandSuggestion(value);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        setSelectedSuggestionIndex(0);
      } catch (error) {
        console.warn('Failed to get command suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value, getCommandSuggestion, isActive]);

  // const handleSubmit = useCallback((command: string) => {
  //   setSuggestions([]);
  //   setShowSuggestions(false);
  //   onSubmit(command);
  // }, [onSubmit]); // TODO: Integrate with key handlers

  // Apply syntax highlighting to the command
  const highlightedCommand = highlightCommand(value);

  return (
    <Box flexDirection="column">
      {/* Command input with syntax highlighting */}
      <Box>
        <Text color="green">$ </Text>
        <Text>{highlightedCommand}</Text>
      </Box>
      
      {/* AI-powered suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray">AI Suggestions:</Text>
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <Box key={index} marginLeft={2}>
              <Text 
                color={index === selectedSuggestionIndex ? 'yellow' : 'gray'}
                bold={index === selectedSuggestionIndex}
              >
                {suggestion.command}
              </Text>
              <Text color="gray"> - {suggestion.description}</Text>
              {suggestion.reason && (
                <Text color="blue"> ({suggestion.reason})</Text>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
