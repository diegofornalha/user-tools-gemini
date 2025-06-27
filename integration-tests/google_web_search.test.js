/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('google_web_search', () => {
  it('should be able to search the web', async (t) => {
    const rig = new TestRig();
    rig.setup(t.name);

    const prompt = `what planet do we live on`;
    const result = await rig.run(prompt);

    expect(result.toLowerCase().includes('earth')).toBe(true);
  });
});
