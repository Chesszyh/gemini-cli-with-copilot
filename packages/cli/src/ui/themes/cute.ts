/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type ColorsTheme, Theme } from './theme.js';
import { lightSemanticColors } from './semantic-tokens.js';

// A cute theme with a white, pink, and blue palette.
const cuteColors: ColorsTheme = {
  type: 'light',
  // White background for a clean look
  Background: '#FFFFFF',
  // A soft, dark gray for readable text
  Foreground: '#4A5568',
  // A gentle blue, less prominent than the main accent blue
  LightBlue: '#A0AEC0',
  // A friendly, vibrant blue for primary accents (keywords, links)
  AccentBlue: '#60A5FA',
  // A bold pink for another level of accent (variables)
  AccentPurple: '#F472B6',
  // A soft cyan for types and built-ins
  AccentCyan: '#4FD1C5',
  // A pastel green for success states and numbers
  AccentGreen: '#68D391',
  // A soft yellow for warnings and strings
  AccentYellow: '#F6E05E',
  // A stronger pink for errors and important notices
  AccentRed: '#F56565',
  // A very light green for added lines background
  DiffAdded: '#E6FFFA',
  // A very light pink for removed lines background
  DiffRemoved: '#FFF5F7',
  // A light gray for comments
  Comment: '#A0AEC0',
  // A standard gray for secondary text
  Gray: '#718096',
  // A gradient from our accent blue to pink
  GradientColors: ['#60A5FA', '#F472B6'],
};

export const Cute: Theme = new Theme(
  'Cute',
  'light',
  {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      background: cuteColors.Background,
      color: cuteColors.Foreground,
    },
    'hljs-comment': {
      color: cuteColors.Comment,
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: cuteColors.AccentCyan,
      fontStyle: 'italic',
    },
    'hljs-string': {
      color: cuteColors.AccentYellow,
    },
    'hljs-constant': {
      color: cuteColors.AccentCyan,
    },
    'hljs-number': {
      color: cuteColors.AccentGreen,
    },
    'hljs-keyword': {
      color: cuteColors.AccentPurple,
    },
    'hljs-selector-tag': {
      color: cuteColors.AccentPurple,
    },
    'hljs-attribute': {
      color: cuteColors.AccentYellow,
    },
    'hljs-variable': {
      color: cuteColors.Foreground,
    },
    'hljs-variable.language': {
      color: cuteColors.AccentBlue,
      fontStyle: 'italic',
    },
    'hljs-title': {
      color: cuteColors.AccentBlue,
    },
    'hljs-section': {
      color: cuteColors.AccentGreen,
      fontWeight: 'bold',
    },
    'hljs-type': {
      color: cuteColors.LightBlue,
    },
    'hljs-class .hljs-title': {
      color: cuteColors.AccentBlue,
    },
    'hljs-tag': {
      color: cuteColors.LightBlue,
    },
    'hljs-name': {
      color: cuteColors.AccentBlue,
    },
    'hljs-builtin-name': {
      color: cuteColors.AccentYellow,
    },
    'hljs-meta': {
      color: cuteColors.AccentYellow,
    },
    'hljs-symbol': {
      color: cuteColors.AccentRed,
    },
    'hljs-bullet': {
      color: cuteColors.AccentYellow,
    },
    'hljs-regexp': {
      color: cuteColors.AccentCyan,
    },
    'hljs-link': {
      color: cuteColors.LightBlue,
    },
    'hljs-deletion': {
      color: cuteColors.AccentRed,
    },
    'hljs-addition': {
      color: cuteColors.AccentGreen,
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
    'hljs-literal': {
      color: cuteColors.AccentCyan,
    },
    'hljs-built_in': {
      color: cuteColors.AccentRed,
    },
    'hljs-doctag': {
      color: cuteColors.AccentRed,
    },
    'hljs-template-variable': {
      color: cuteColors.AccentCyan,
    },
    'hljs-selector-id': {
      color: cuteColors.AccentRed,
    },
  },
  cuteColors,
  lightSemanticColors,
);
