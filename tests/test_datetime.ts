import { getTimeStamp } from "@/lib/utils";

function assertEqual(actual: string, expected: string, message: string) {
  if (actual === expected) {
    console.log(`✅ ${message}`);
  } else {
    console.log(`❌ ${message}\n   Expected: ${expected}\n   Actual:   ${actual}`);
  }
}

function runTests() {
  // 固定当前时间为 2023-01-01T12:00:00Z
  const now = new Date("2023-01-01T12:00:00Z");
  const _Date = Date;
  global.Date = class extends Date {
    constructor(date?: string | number | Date) {
      if (date) {
        super(date);
      } else {
        super(now);
      }
    }
    static now() {
      return now.getTime();
    }
  } as unknown as DateConstructor;

  assertEqual(getTimeStamp(new Date("2023-01-01T12:00:00Z")), "just now", "just now");
  assertEqual(getTimeStamp(new Date("2023-01-01T11:59:59Z")), "1 second ago", "1 second ago");
  assertEqual(getTimeStamp(new Date("2023-01-01T11:59:30Z")), "30 seconds ago", "30 seconds ago");
  assertEqual(getTimeStamp(new Date("2023-01-01T11:59:00Z")), "1 minute ago", "1 minute ago");
  assertEqual(getTimeStamp(new Date("2023-01-01T11:30:00Z")), "30 minutes ago", "30 minutes ago");
  assertEqual(getTimeStamp(new Date("2023-01-01T11:00:00Z")), "1 hour ago", "1 hour ago");
  assertEqual(getTimeStamp(new Date("2023-01-01T09:00:00Z")), "3 hours ago", "3 hours ago");
  assertEqual(getTimeStamp(new Date("2022-12-31T12:00:00Z")), "1 day ago", "1 day ago");
  assertEqual(getTimeStamp(new Date("2022-12-28T12:00:00Z")), "4 days ago", "4 days ago");
  assertEqual(getTimeStamp(new Date("2022-12-25T12:00:00Z")), "1 week ago", "1 week ago");
  assertEqual(getTimeStamp(new Date("2022-12-11T12:00:00Z")), "3 weeks ago", "3 weeks ago");
  assertEqual(getTimeStamp(new Date("2022-12-01T12:00:00Z")), "1 month ago", "1 month ago");
  assertEqual(getTimeStamp(new Date("2022-10-01T12:00:00Z")), "3 months ago", "3 months ago");
  assertEqual(getTimeStamp(new Date("2022-01-01T12:00:00Z")), "1 year ago", "1 year ago");
  assertEqual(getTimeStamp(new Date("2020-01-01T12:00:00Z")), "3 years ago", "3 years ago");

  // 恢复原始 Date
  global.Date = _Date;
}

runTests();
