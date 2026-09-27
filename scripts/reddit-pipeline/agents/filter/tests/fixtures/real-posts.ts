/**
 * Набор реальных постов r/AynThor для интеграционной проверки агента `filter`.
 *
 * Как добавить кейс:
 *   1. Скопируйте ссылку на пост из Reddit.
 *   2. Укажите `expected` — ожидаемый вердикт агента (`true` = релевантный
 *      проект, `false` = нерелевантный пост).
 *   3. (опционально) `note` — короткое пояснение, почему такой вердикт.
 *
 * Тест, который использует этот набор, запускается только при
 * `RUN_MEDIA_INTEGRATION=true` и наличии `OPENROUTER_API_KEY`
 * (см. `../filter.spec.ts`). Пост загружается по id из ссылки через
 * arctic-shift, нормализуется и классифицируется агентом `filter`.
 */
export interface RealPostCase {
  /** Полная ссылка на пост Reddit. */
  url: string;

  /** Ожидаемый вердикт агента `filter`. */
  expected: boolean;

  /** Необязательное пояснение к ожидаемому вердикту. */
  note?: string;
}

/**
 * Кейсы для прогона. Заполняйте своими постами.
 * Примеры ниже можно оставить или заменить.
 */
export const REAL_POST_CASES: RealPostCase[] = [
  {
    url: 'https://www.reddit.com/r/AynThor/comments/1wptab9/zomboidds_dualscreen_mod_for_pz_on_zomdroid/',
    expected: true,
    note: 'Showcase: проект (мод) для Thor',
  },
  {
    url: 'https://www.reddit.com/r/AynThor/comments/1wqu83e/how_do_i_get_my_home_screen_back/',
    expected: false,
    note: 'Support-вопрос без проекта',
  },
];
