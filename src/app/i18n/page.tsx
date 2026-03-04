import { readI18nConsistencyData } from './consistency.server';
import I18nConsistencyClient from './i18nConsistencyClient';

export default async function I18nConsistencyPage() {
  const initialData = await readI18nConsistencyData();

  return <I18nConsistencyClient initialData={initialData} />;
}
