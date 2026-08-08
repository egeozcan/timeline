import { expect } from '@open-wc/testing';
import * as packageRoot from '../../dist/index.js';
import { createDate, formatDate, isValidDate, parseDate } from '../../dist/utils/date-utils.js';

describe('date-utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      expect(formatDate('2024-03-15')).to.equal('March 15, 2024');
    });

    it('formats date with different month', () => {
      expect(formatDate('2024-12-25')).to.equal('December 25, 2024');
    });

    it('returns empty string for empty input', () => {
      expect(formatDate('')).to.equal('');
    });

    it('handles edge dates correctly', () => {
      expect(formatDate('2024-01-01')).to.equal('January 1, 2024');
      expect(formatDate('2024-12-31')).to.equal('December 31, 2024');
    });

    it('passes UTC to locale formatting and restores the patched method', () => {
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      let receivedLocales: Intl.LocalesArgument | undefined;
      let receivedOptions: Intl.DateTimeFormatOptions | undefined;

      try {
        Date.prototype.toLocaleDateString = (locales, options) => {
          receivedLocales = locales;
          receivedOptions = options;
          return 'UTC-formatted date';
        };

        expect(formatDate('2024-03-15')).to.equal('UTC-formatted date');
        expect(receivedLocales).to.equal('en-US');
        expect(receivedOptions).to.deep.include({
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        });
      } finally {
        Date.prototype.toLocaleDateString = originalToLocaleDateString;
      }

      expect(Date.prototype.toLocaleDateString).to.equal(originalToLocaleDateString);
    });
  });

  describe('isValidDate', () => {
    it('is exported from the package root', () => {
      expect(packageRoot.isValidDate).to.equal(isValidDate);
      expect(packageRoot.isValidDate('2024-02-29')).to.be.true;
    });

    it('accepts only canonical calendar dates', () => {
      expect(isValidDate('2024-02-29')).to.be.true;
      expect(isValidDate('2023-02-29')).to.be.false;
      expect(isValidDate('2024-02-30')).to.be.false;
      expect(isValidDate('2024-2-09')).to.be.false;
      expect(isValidDate('')).to.be.false;
    });

    it('returns stable invalid values instead of normalized dates', () => {
      expect(formatDate('2024-02-30')).to.equal('');
      expect(Number.isNaN(parseDate('2024-02-30'))).to.be.true;
      expect(Number.isNaN(createDate('2024-02-30').getTime())).to.be.true;
    });
  });

  describe('parseDate', () => {
    it('parses date to timestamp', () => {
      const timestamp = parseDate('2024-03-15');
      const date = new Date(timestamp);
      expect(date.getUTCFullYear()).to.equal(2024);
      expect(date.getUTCMonth()).to.equal(2); // March is 2 (0-indexed)
      expect(date.getUTCDate()).to.equal(15);
    });

    it('parses different dates correctly', () => {
      const timestamp = parseDate('2020-06-01');
      const date = new Date(timestamp);
      expect(date.getUTCFullYear()).to.equal(2020);
      expect(date.getUTCMonth()).to.equal(5); // June is 5
      expect(date.getUTCDate()).to.equal(1);
    });
  });

  describe('createDate', () => {
    it('creates Date object from string', () => {
      const date = createDate('2024-03-15');
      expect(date.getUTCFullYear()).to.equal(2024);
      expect(date.getUTCMonth()).to.equal(2);
      expect(date.getUTCDate()).to.equal(15);
    });

    it('handles timezone consistently', () => {
      const date = createDate('2024-03-15');
      expect(date.getUTCHours()).to.equal(12);
    });
  });
});
