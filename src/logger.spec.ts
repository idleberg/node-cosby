import { describe, expect, it } from 'vitest';
import logger from './logger.ts';

describe('logger', () => {
	it('has level set to 4', () => {
		expect(logger.level).toBe(4);
	});
});
