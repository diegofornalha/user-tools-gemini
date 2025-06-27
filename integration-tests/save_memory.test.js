/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('save_memory', () => {
  it('should be able to save to memory', async (t) => {
    const rig = new TestRig();
    rig.setup(t.name);

    const prompt = `remember that my favorite color is  blue.\n\n  what is my favorite color? tell me that and surround it with $ symbol`;
    const result = await rig.run(prompt);

    expect(result.toLowerCase().includes('$blue$')).toBe(true);
  });
});
