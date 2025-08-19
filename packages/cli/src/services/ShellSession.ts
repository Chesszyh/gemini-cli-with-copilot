/**
 * @license
 * Copyright 2025 Chesszyh
 * SPDX-License-Identifier: Apache-2.0
*/

import * as pty from 'node-pty';
import os from 'node:os';
import { type IPty } from 'node-pty';

export interface ShellSession {
  readonly pid: number;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
}

export interface ShellSessionOptions {
  onData: (data: string) => void;
  onExit: (exitCode: number, signal?: number) => void;
  onError: (error: Error) => void;
  cwd: string;
  cols?: number;
  rows?: number;
}

export function createShellSession(options: ShellSessionOptions): ShellSession {
  const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env['SHELL'] || 'bash';

  let ptyProcess: IPty;

  try {
    ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: options.cols ?? 80,
      rows: options.rows ?? 30,
      cwd: options.cwd,
      env: process.env as { [key: string]: string },
    });
  } catch (e) {
    options.onError(e as Error);
    // Return a dummy object to prevent crashes on the caller side
    return {
      pid: -1,
      write: () => {},
      resize: () => {},
      kill: () => {},
    };
  }

  ptyProcess.onData((data) => {
    options.onData(data);
  });

  ptyProcess.onExit(({ exitCode, signal }) => {
    options.onExit(exitCode, signal);
  });

  // The 'error' event is not officially documented in node-pty's types,
  // but it can be emitted in case of underlying system errors.
  (ptyProcess as any).onError?.((error: Error) => {
    options.onError(error);
  });

  return {
    pid: ptyProcess.pid,
    write: (data: string) => ptyProcess.write(data),
    resize: (cols: number, rows: number) => ptyProcess.resize(cols, rows),
    kill: () => ptyProcess.kill(),
  };
}
