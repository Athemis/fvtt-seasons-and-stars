import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarDate } from '../src/core/calendar-date';
import type { SeasonsStarsCalendar, CalendarDateData } from '../src/types/calendar';

// Mock CalendarTimeUtils to test dependency failure
vi.mock('../src/core/calendar-time-utils', () => ({
  CalendarTimeUtils: {
    formatTimeComponent: vi.fn((value: number) => value.toString().padStart(2, '0')),
    addOrdinalSuffix: vi.fn((num: number) => `${num}th`),
  },
}));

describe('CalendarDate timeOnly Edge Cases', () => {
  let mockCalendar: SeasonsStarsCalendar;
  let baseDateData: CalendarDateData;

  beforeEach(() => {
    mockCalendar = {
      id: 'test-calendar',
      name: 'Test Calendar',
      months: [{ name: 'June', abbreviation: 'Jun', days: 30 }],
      weekdays: [{ name: 'Wednesday', abbreviation: 'Wed' }],
      year: { prefix: '', suffix: '' },
      intercalary: [],
      leapYear: { enabled: false },
    };

    baseDateData = {
      year: 2024,
      month: 1,
      day: 15,
      weekday: 0,
    };
  });

  describe('timeOnly functionality', () => {
    it('should return HH:MM:SS format when timeOnly is true', () => {
      const dateWithTime: CalendarDateData = {
        ...baseDateData,
        time: { hour: 14, minute: 30, second: 45 },
      };

      const calendarDate = new CalendarDate(dateWithTime, mockCalendar);
      const result = calendarDate.format({ timeOnly: true });

      expect(result).toBe('14:30:45');
    });

    it('should return empty string when timeOnly is true but no time is set', () => {
      const calendarDate = new CalendarDate(baseDateData, mockCalendar);
      const result = calendarDate.format({ timeOnly: true });

      expect(result).toBe('');
    });

    it('should handle edge case time values', () => {
      const testCases = [
        { time: { hour: 0, minute: 0, second: 0 }, expected: '00:00:00' },
        { time: { hour: 23, minute: 59, second: 59 }, expected: '23:59:59' },
        { time: { hour: 12, minute: 30, second: 0 }, expected: '12:30:00' },
      ];

      testCases.forEach(({ time, expected }) => {
        const dateWithTime: CalendarDateData = { ...baseDateData, time };
        const calendarDate = new CalendarDate(dateWithTime, mockCalendar);
        const result = calendarDate.format({ timeOnly: true });
        expect(result).toBe(expected);
      });
    });

    it('should ignore all other formatting options when timeOnly is true', () => {
      const dateWithTime: CalendarDateData = {
        ...baseDateData,
        time: { hour: 12, minute: 0, second: 0 },
      };

      const calendarDate = new CalendarDate(dateWithTime, mockCalendar);
      const result = calendarDate.format({
        timeOnly: true,
        includeWeekday: true,
        includeYear: true,
        includeTime: false, // This should be ignored
        format: 'long',
      });

      expect(result).toBe('12:00:00');
      expect(result).not.toContain('Wednesday');
      expect(result).not.toContain('2024');
    });
  });

  describe('special cases', () => {
    it('should work with intercalary dates', () => {
      const intercalaryDate: CalendarDateData = {
        ...baseDateData,
        intercalary: 'Midsummer',
        time: { hour: 18, minute: 0, second: 0 },
      };

      const calendarDate = new CalendarDate(intercalaryDate, mockCalendar);
      const result = calendarDate.format({ timeOnly: true });

      expect(result).toBe('18:00:00');
    });

    it('should return empty string for intercalary dates without time', () => {
      const intercalaryDate: CalendarDateData = {
        ...baseDateData,
        intercalary: 'Midsummer',
      };

      const calendarDate = new CalendarDate(intercalaryDate, mockCalendar);
      const result = calendarDate.format({ timeOnly: true });

      expect(result).toBe('');
    });
  });
});
