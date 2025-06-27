/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('write_file', () => {
  it('should be able to write a file', async (t) => {
    const rig = new TestRig();
    rig.setup(t.name);
    const prompt = `show me an example of using the write tool. put a dad joke in dad.txt`;

    await rig.run(prompt);
    const newFilePath = 'dad.txt';

    const newFileContent = rig.readFile(newFilePath);
    expect(newFileContent).not.toBe('');
  });
});
