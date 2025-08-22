/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, SlashCommand } from "./types.js";

export const modeCommand: SlashCommand = {
  name: 'mode',
  description: 'Switch between different modes of Agents.',
  kind: CommandKind.EXTERNAL,
  subCommands: [
    {
      name: 'list',
      description: 'List all available modes.',
      kind: CommandKind.EXTERNAL,
    },
    {
      name: 'switch',
      description: 'Switch between different modes. Support: "brat", "normal", "focus".',
      kind: CommandKind.EXTERNAL,
    }
  ]
}