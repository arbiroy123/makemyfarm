jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

const Localization = require('expo-localization');
const { detectCountry, COUNTRY_INFO } = require('../utils/country');

describe('detectCountry()', () => {
  afterEach(() => Localization.getLocales.mockReset());

  test('returns IN for Indian locale', () => {
    Localization.getLocales.mockReturnValue([{ regionCode: 'IN' }]);
    expect(detectCountry()).toBe('IN');
  });

  test('returns US for US locale', () => {
    Localization.getLocales.mockReturnValue([{ regionCode: 'US' }]);
    expect(detectCountry()).toBe('US');
  });

  test('falls back to IN for unsupported country (e.g. France)', () => {
    Localization.getLocales.mockReturnValue([{ regionCode: 'FR' }]);
    expect(detectCountry()).toBe('IN');
  });

  test('falls back to IN when locale list is empty', () => {
    Localization.getLocales.mockReturnValue([]);
    expect(detectCountry()).toBe('IN');
  });

  test('falls back to IN when getLocales is not available', () => {
    Localization.getLocales.mockReturnValue(null);
    expect(detectCountry()).toBe('IN');
  });

  test('falls back to IN when regionCode is null', () => {
    Localization.getLocales.mockReturnValue([{ regionCode: null }]);
    expect(detectCountry()).toBe('IN');
  });
});

describe('COUNTRY_INFO', () => {
  test('India entry has correct currency and flag', () => {
    expect(COUNTRY_INFO.IN.currency).toBe('INR');
    expect(COUNTRY_INFO.IN.flag).toBe('🇮🇳');
    expect(COUNTRY_INFO.IN.price).toBe('₹99');
  });

  test('USA entry has correct currency and flag', () => {
    expect(COUNTRY_INFO.US.currency).toBe('USD');
    expect(COUNTRY_INFO.US.flag).toBe('🇺🇸');
    expect(COUNTRY_INFO.US.price).toBe('$4.99');
  });

  test('both countries have all required fields', () => {
    ['IN', 'US'].forEach(code => {
      const info = COUNTRY_INFO[code];
      expect(info.flag).toBeTruthy();
      expect(info.label).toBeTruthy();
      expect(info.price).toBeTruthy();
      expect(info.currency).toBeTruthy();
    });
  });
});
