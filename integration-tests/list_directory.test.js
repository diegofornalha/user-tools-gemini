/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('list_directory', () => {
  it('should be able to list a directory', async (t) => {
    const rig = new TestRig();
    rig.setup(t.name);
    rig.createFile('file1.txt', 'file 1 content');
    rig.mkdir('subdir');

    const prompt = `Can you list the files in the current directory`;
    const result = await rig.run(prompt);

    expect(result.includes('file1.txt')).toBe(true);
    expect(result.includes('subdir')).toBe(true);
  });
});
