import assert from 'assert'

import analyze from '../lib/analyze.js'

describe('analyze', () => {
  it('get dependencies', async () => {
    const result = analyze(
      'index.js',
      `
      import 'global'
      import "otherGlobal"
      import './one.js';
      import './real/../weird/./..//////two.js'
      import "./two.js";
      import third from './some/third.js'
      import {fourth} from './some/third.js'
      import fifth from './fifth.weirdExtension';
      /* smartes(./sixth.html) */
    `
    )

    assert.deepEqual(
      [...result],
      [
        {path: 'one.js'},
        {path: 'two.js'},
        {path: 'some/third.js'},
        {path: 'fifth.weirdExtension'},
        {path: 'sixth.html'},
      ]
    )
  })
})