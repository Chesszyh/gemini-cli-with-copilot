/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SpawnOptions } from 'node:child_process';
import { spawn } from 'node:child_process';

/**
 * Checks if a query string potentially represents an '@' command.
 * It triggers if the query starts with '@' or contains '@' preceded by whitespace
 * and followed by a non-whitespace character.
 *
 * @param query The input query string.
 * @returns True if the query looks like an '@' command, false otherwise.
 */
export const isAtCommand = (query: string): boolean =>
  // Check if starts with @ OR has a space, then @
  query.startsWith('@') || /\s@/.test(query);

/**
 * Checks if a query string potentially represents an '/' command.
 * It triggers if the query starts with '/' but excludes code comments like '//' and '/*'.
 *
 * @param query The input query string.
 * @returns True if the query looks like an '/' command, false otherwise.
 */
export const isSlashCommand = (query: string): boolean => {
  if (!query.startsWith('/')) {
    return false;
  }

  // Exclude line comments that start with '//'
  if (query.startsWith('//')) {
    return false;
  }

  // Exclude block comments that start with '/*'
  if (query.startsWith('/*')) {
    return false;
  }

  return true;
};

/**
 * Checks if a query string potentially represents an '#' command.
 * @param text The input query string.
 * @returns True if the query looks like a '#' command, false otherwise.
 */
export const isHashCommand = (text: string): boolean => text.startsWith('#');

// Copies a string snippet to the clipboard for different platforms
export const copyToClipboard = async (text: string): Promise<void> => {
  const run = (cmd: string, args: string[], options?: SpawnOptions) =>
    new Promise<void>((resolve, reject) => {
      const child = options ? spawn(cmd, args, options) : spawn(cmd, args);
      let stderr = '';
      if (child.stderr) {
        child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
      }
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) return resolve();
        const errorMsg = stderr.trim();
        reject(
          new Error(
            `'${cmd}' exited with code ${code}${errorMsg ? `: ${errorMsg}` : ''}`,
          ),
        );
      });
      if (child.stdin) {
        child.stdin.on('error', reject);
        child.stdin.write(text);
        child.stdin.end();
      } else {
        reject(new Error('Child process has no stdin stream to write to.'));
      }
    });

  // Configure stdio for Linux clipboard commands.
  // - stdin: 'pipe' to write the text that needs to be copied.
  // - stdout: 'inherit' since we don't need to capture the command's output on success.
  // - stderr: 'pipe' to capture error messages (e.g., "command not found") for better error handling.
  const linuxOptions: SpawnOptions = { stdio: ['pipe', 'inherit', 'pipe'] };

  switch (process.platform) {
    case 'win32':
      return run('clip', []);
    case 'darwin':
      return run('pbcopy', []);
    case 'linux':
      try {
        // Prioritize Wayland-native clipboard utility
        await run('wl-copy', [], linuxOptions);
      } catch (waylandError) {
        // Fallback to X11 utilities if wl-copy fails
        try {
          await run('xclip', ['-selection', 'clipboard'], linuxOptions);
        } catch (primaryError) {
          try {
            // If xclip fails for any reason, try xsel as a fallback.
            await run('xsel', ['--clipboard', '--input'], linuxOptions);
          } catch (fallbackError) {
            const wlCopyNotFound =
              waylandError instanceof Error &&
              (waylandError as NodeJS.ErrnoException).code === 'ENOENT';
            const xclipNotFound =
              primaryError instanceof Error &&
              (primaryError as NodeJS.ErrnoException).code === 'ENOENT';
            const xselNotFound =
              fallbackError instanceof Error &&
              (fallbackError as NodeJS.ErrnoException).code === 'ENOENT';

            if (wlCopyNotFound && xclipNotFound && xselNotFound) {
              throw new Error(
                'For Linux, please ensure wl-copy (for Wayland) or xclip/xsel (for X11) is installed.',
              );
            }

            // Combine error messages for better debugging
            const errorMessages = [
              waylandError instanceof Error ? waylandError.message : String(waylandError),
              primaryError instanceof Error ? primaryError.message : String(primaryError),
              fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
            ].join('; ');

            throw new Error(
              `All copy commands failed. Errors: ${errorMessages}`,
            );
          }
        }
      }
      return;
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
};

export const getUrlOpenCommand = (): string => {
  // --- Determine the OS-specific command to open URLs ---
  let openCmd: string;
  switch (process.platform) {
    case 'darwin':
      openCmd = 'open';
      break;
    case 'win32':
      openCmd = 'start';
      break;
    case 'linux':
      openCmd = 'xdg-open';
      break;
    default:
      // Default to xdg-open, which appears to be supported for the less popular operating systems.
      openCmd = 'xdg-open';
      console.warn(
        `Unknown platform: ${process.platform}. Attempting to open URLs with: ${openCmd}.`,
      );
      break;
  }
  return openCmd;
};
