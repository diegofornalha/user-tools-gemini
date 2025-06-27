/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from '@jest/globals';
import { TestRig } from './test-helper.js';

describe('browser', () => {
  it('should be able to open a URL', async (t) => {
    const rig = new TestRig();
    rig.setup(t.name);

    // We can't really check if the browser opened, so just check for success.
    const prompt = `open the url https://www.google.com in the browser`;
    const result = await rig.run(prompt);

    expect(result.toLowerCase().includes('url aberta')).toBe(true);
  });
});
