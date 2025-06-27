/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('read_many_files', () => {
  it.skip('should be able to read multiple files', async (t) => {
    const rig = new TestRig();
    rig.setup(t.name);
    rig.createFile('file1.txt', 'file 1 content');
    rig.createFile('file2.txt', 'file 2 content');

    const prompt = `Read the files in this directory, list them and print them to the screen`;
    const result = await rig.run(prompt);

    expect(result.includes('file 1 content')).toBe(true);
    expect(result.includes('file 2 content')).toBe(true);
  });
});
