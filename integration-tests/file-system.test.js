/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('file-system', () => {
  it('reads a file', (t) => {
    const rig = new TestRig();
    rig.setup(t.name);
    rig.createFile('test.txt', 'hello world');

    const output = rig.run(`read the file name test.txt`);

    expect(output.toLowerCase().includes('hello')).toBe(true);
  });

  it('writes a file', (t) => {
    const rig = new TestRig();
    rig.setup(t.name);
    rig.createFile('test.txt', '');

    rig.run(`edit test.txt to have a hello world message`);

    const fileContent = rig.readFile('test.txt');
    expect(fileContent.toLowerCase().includes('hello')).toBe(true);
  });
});
