import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { setItem } from 'next-basics';
import { LOCALE_CONFIG } from 'lib/constants';
import { getDateLocale, getTextDirection } from 'lib/lang';
import useStore, { setLocale } from 'store/app';
import useForceUpdate from 'hooks/useForceUpdate';
import useApi from 'hooks/useApi';
import enUS from 'public/intl/messages/en-US.json';

const messages = {
  'en-US': enUS,
};

const selector = state => state.locale;

export default function useLocale() {
  const locale = useStore(selector);
  const { basePath } = useRouter();
  const forceUpdate = useForceUpdate();
  const dir = getTextDirection(locale);
  const dateLocale = getDateLocale(locale);
  const { get } = useApi();

  async function loadMessages(locale) {
    const data = await get(`${basePath}/intl/messages/${locale}.json`);

    if (data) {
      messages[locale] = data;
    }
  }

  async function saveLocale(value) {
    if (!messages[value]) {
      await loadMessages(value);
    }

    setItem(LOCALE_CONFIG, value);

    if (locale !== value) {
      setLocale(value);
    } else {
      forceUpdate();
    }
  }

  useEffect(() => {
    if (!messages[locale]) {
      saveLocale(locale);
    }
  }, [locale]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const locale = url.searchParams.get('locale');

    if (locale) {
      saveLocale(locale);
    }
  }, []);

  return { locale, saveLocale, messages, dir, dateLocale };
}
