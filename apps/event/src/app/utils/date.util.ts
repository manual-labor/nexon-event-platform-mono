/**
 * 날짜 및 시간 관련 유틸리티 함수
 */

import moment from 'moment-timezone';

const KST_TIMEZONE = 'Asia/Seoul';

/**
 * 애플리케이션의 기본 타임존을 반환합니다. (환경 변수 TZ 또는 기본값 KST_TIMEZONE)
 * @returns {string} 타임존 문자열
 */
export function getApplicationTimezone(): string {
  return process.env.TZ || KST_TIMEZONE;
}

// --- UTC Core Functions ---

/**
 * 현재 시간을 UTC moment 객체로 반환합니다.
 * @returns {moment.Moment} 현재 UTC 시간의 moment 객체
 */
export function getNowUtcMoment(): moment.Moment {
  return moment.utc();
}

/**
 * 현재 시간을 UTC Date 객체로 반환합니다.
 * @returns {Date} 현재 UTC 시간의 Date 객체
 */
export function getNowUtcDate(): Date {
  return getNowUtcMoment().toDate();
}

/**
 * 입력값을 UTC moment 객체로 파싱합니다.
 * - ISO 문자열에 'Z'가 있으면 UTC로 해석합니다.
 * - 숫자형 입력은 UTC milliseconds로 간주합니다.
 * - Date 객체는 내부 UTC milliseconds 값을 사용합니다.
 * - 타임존 정보가 없는 문자열은 UTC로 해석합니다.
 * @param {moment.MomentInput} input 파싱할 날짜/시간 값
 * @returns {moment.Moment} UTC moment 객체
 */
export function parseToUtcMoment(input: moment.MomentInput): moment.Moment {
  return moment.utc(input);
}

/**
 * 입력값을 UTC Date 객체로 파싱합니다.
 * @param {moment.MomentInput} input 파싱할 날짜/시간 값
 * @returns {Date} UTC Date 객체
 */
export function parseToUTCDate(input: moment.MomentInput): Date {
  return parseToUtcMoment(input).toDate();
}

// --- KST Specific Functions ---

/**
 * UTC moment 객체를 KST moment 객체로 변환합니다.
 * @param {moment.Moment} utcMoment 변환할 UTC moment 객체
 * @returns {moment.Moment} KST moment 객체
 */
export function convertUtcMomentToKst(utcMoment: moment.Moment): moment.Moment {
  return utcMoment.clone().tz(getApplicationTimezone());
}

/**
 * 현재 시간을 KST moment 객체로 반환합니다.
 * @returns {moment.Moment} 현재 KST 시간의 moment 객체
 */
export function getNowKstMoment(): moment.Moment {
  return moment().tz(getApplicationTimezone());
}

/**
 * 현재 시간을 KST Date 객체로 반환합니다.
 * @returns {Date} 현재 KST 시간의 Date 객체
 */
export function getNowKstDate(): Date {
  return getNowKstMoment().toDate();
}

/**
 * 입력된 날짜/시간 값의 KST 기준 하루 시작 시간(00:00:00)을 Date 객체로 반환합니다.
 * @param {moment.MomentInput} input 기준 날짜/시간 값 (기본값: 현재 시간)
 * @returns {Date} KST 기준 하루 시작 시간 Date 객체
 */
export function getStartOfDayKst(input: moment.MomentInput = getNowKstMoment()): Date {
  return moment(input).tz(getApplicationTimezone()).startOf('day').toDate();
}

/**
 * 입력된 날짜/시간 값의 KST 기준 하루 종료 시간(23:59:59.999)을 Date 객체로 반환합니다.
 * @param {moment.MomentInput} input 기준 날짜/시간 값 (기본값: 현재 시간)
 * @returns {Date} KST 기준 하루 종료 시간 Date 객체
 */
export function getEndOfDayKst(input: moment.MomentInput = getNowKstMoment()): Date {
  return moment(input).tz(getApplicationTimezone()).endOf('day').toDate();
}

/**
 * 애플리케이션 타임존을 설정합니다. (Node.js 환경변수 TZ 및 moment 기본 타임존)
 * @param {string} timezone 설정할 타임존 (기본값: KST_TIMEZONE)
 */
export function setTimezone(timezone = getApplicationTimezone()): void {
  process.env.TZ = timezone;
  moment.tz.setDefault(timezone);
  console.log(`Application timezone set to: ${timezone}`);
}

/**
 * 입력된 날짜/시간 값을 KST 기준으로 지정된 포맷의 문자열로 변환합니다.
 * @param {moment.MomentInput} input 변환할 날짜/시간 값
 * @param {string} format 변환할 문자열 포맷 (기본값: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} KST 기준 포맷된 날짜/시간 문자열
 */
export function formatDateKst(input: moment.MomentInput, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return moment(input).tz(getApplicationTimezone()).format(format);
}

/**
 * 두 날짜가 KST 기준으로 같은 날인지 비교합니다.
 * @param date1 비교할 첫 번째 날짜
 * @param date2 비교할 두 번째 날짜
 * @returns {boolean} 같은 날이면 true, 아니면 false
 */
export function isSameDayKst(date1: moment.MomentInput, date2: moment.MomentInput): boolean {
  return moment(date1).tz(getApplicationTimezone()).isSame(moment(date2).tz(getApplicationTimezone()), 'day');
}

/**
 * 첫 번째 날짜가 두 번째 날짜보다 KST 기준으로 이전인지 비교합니다.
 * @param date1 비교할 첫 번째 날짜
 * @param date2 비교할 두 번째 날짜
 * @returns {boolean} 이전이면 true, 아니면 false
 */
export function isBeforeKst(date1: moment.MomentInput, date2: moment.MomentInput): boolean {
  return moment(date1).tz(getApplicationTimezone()).isBefore(moment(date2).tz(getApplicationTimezone()));
}

/**
 * 첫 번째 날짜가 두 번째 날짜보다 KST 기준으로 이후인지 비교합니다.
 * @param date1 비교할 첫 번째 날짜
 * @param date2 비교할 두 번째 날짜
 * @returns {boolean} 이후이면 true, 아니면 false
 */
export function isAfterKst(date1: moment.MomentInput, date2: moment.MomentInput): boolean {
  return moment(date1).tz(getApplicationTimezone()).isAfter(moment(date2).tz(getApplicationTimezone()));
}

// 기존 normalizeDate, getNowInTimezone 등은 위의 UTC 또는 KST 명시적 함수들로 대체됩니다.
// parseToDate는 parseToUTCDate 또는 parseToUtcMoment로 대체됩니다. 