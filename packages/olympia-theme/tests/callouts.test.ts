import { describe, expect, test } from 'bun:test';
import { extractCallouts } from '../src/loader/callouts.ts';

describe('extractCallouts', () => {
  test('removes markers and records their line numbers', () => {
    const { code, callouts } = extractCallouts(
      'const a = 1; // <1>\nconst b = 2; // <2> <3>\nplain',
    );
    expect(code).toBe('const a = 1;\nconst b = 2;\nplain');
    expect(callouts.get(1)).toEqual([1]);
    expect(callouts.get(2)).toEqual([2, 3]);
    expect(callouts.has(3)).toBe(false);
  });

  test('numbers `<.>` markers with a counter across the block', () => {
    const { callouts } = extractCallouts('a # <.>\nb # <.>\nc # <.>');
    expect([...callouts.values()]).toEqual([[1], [2], [3]]);
  });

  test('supports XML-style markers', () => {
    const { code, callouts } = extractCallouts('<item/> <!--1-->');
    expect(code).toBe('<item/>');
    expect(callouts.get(1)).toEqual([1]);
  });

  test('keeps escaped markers as literal text', () => {
    const { code, callouts } = extractCallouts('x \\<1>');
    expect(code).toBe('x <1>');
    expect(callouts.size).toBe(0);
  });
});
