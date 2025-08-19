/**
 * @license
 * Copyright 2025 Chesszyh
 * SPDX-License-Identifier: Apache-2.0
 */

import { Box, Text } from 'ink';
import { ShellEnvironmentInfo } from '../../services/EnhancedShellSession.js';

interface ShellViewProps {
  output: string;
  environmentInfo?: ShellEnvironmentInfo;
  isEnhanced: boolean;
}

export function ShellView({
  output,
  environmentInfo,
  isEnhanced,
}: ShellViewProps) {
  return (
    <Box flexDirection="column" flexGrow={1}>
      {isEnhanced && environmentInfo && (
        <Box marginBottom={1}>
          <Text color="cyan">
            Enhanced Shell: {environmentInfo.shell}
            {environmentInfo.ohMyZshEnabled && (
              <Text color="green"> (Oh My Zsh enabled)</Text>
            )}
          </Text>
          {environmentInfo.pluginsEnabled.length > 0 && (
            <Text color="yellow">
              {` • Plugins: ${environmentInfo.pluginsEnabled.join(', ')}`}
            </Text>
          )}
        </Box>
      )}
      <Box flexDirection="column" flexGrow={1}>
        <Text>{output}</Text>
      </Box>
    </Box>
  );
}
