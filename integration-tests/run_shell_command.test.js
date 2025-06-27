/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('run_shell_command', () => {
  it('should be able to run a shell command', async (t) => {
    const rig = new TestRig();
    rig.setup(t.name);
    rig.createFile('blah.txt', 'some content');

    const prompt = `Can you use ls to list the contexts of the current folder`;
    const result = await rig.run(prompt);

    expect(result.includes('blah.txt')).toBe(true);
  });
});
