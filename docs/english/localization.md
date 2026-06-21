# Localization Engineering Guide

## Purpose

Win12 is a multilingual desktop-style web application. Every visible UI string must be designed to work in both English and Chinese contexts from the start.

This guide exists because hardcoded Chinese strings previously leaked into the English UI, especially inside Settings. The root cause was not the user's operating system language. The application was loading English, but many UI sections contained raw Chinese text with no translation key, so the runtime translator had nothing to replace.

Going forward, all contributors must treat translation support as part of feature development, not as cleanup work after a feature ships.

## Required Rule

Do not add user-facing text directly into HTML or JavaScript without a translation path.

Acceptable approaches:

- Static HTML text: add `data-i18n="translation.key"` and add that key to every supported language file.
- Attribute text: add `data-i18n-attr="placeholder"` or the relevant attribute plus `data-i18n-key="translation.key"`.
- JavaScript-generated text: use `lang("English fallback", "translation.key")`.
- Dynamic text assembled from values: translate the sentence template, then insert variables.

Not acceptable:

- Adding raw Chinese or English text to a visible control with no `data-i18n` key.
- Adding a key to `lang_en.properties` but not `lang_en-US.properties`.
- Using English fallback text that is actually Chinese.
- Building menus, notices, or app content before translations can be resolved.
- Relying on a later cleanup pass to translate permanent feature UI.

## Why This Matters

When translation files are not used properly, the impact is immediate:

- English users see Chinese inside Settings, menus, dialogs, app titles, and notices.
- `en` and `en-US` drift apart, so the same UI behaves differently depending on browser or system locale.
- Runtime language switching becomes unreliable because hardcoded strings bypass the translator.
- Tauri and web builds can diverge if one path inserts strings directly.
- Contributors waste time fixing repeated text leaks instead of improving the product.
- Automated checks cannot catch missing translations if text is never represented as a key.

## Supported Language Files

The current language catalog lives in the nested locale repository:

- `lang/lang/lang_zh_CN.properties`
- `lang/lang/lang_zh_TW.properties`
- `lang/lang/lang_en.properties`
- `lang/lang/lang_en-US.properties`

For English, `lang_en.properties` and `lang_en-US.properties` must remain aligned unless there is a deliberate regional wording difference.

## Key Naming

Use stable, scoped keys.

Examples:

```properties
setting.system=System
setting.network=Network & internet
setting.update=Windows Update
taskmgr.processes.reset-filter=Reset Filter
camera.notice.agree=Agree and continue
```

Recommended key structure:

- `app.section.item`
- `setting.page.control`
- `notice.reason.action`
- `taskmgr.tab.metric`

Avoid one-letter keys, temporary text as key names, and reusing one key for different meanings.

## Static HTML Pattern

Use `data-i18n` for visible text:

```html
<span data-i18n="setting.network">Network & internet</span>
```

Use `data-i18n-attr` for placeholders, tooltips, titles, and similar attributes:

```html
<input
  placeholder="Find a setting"
  data-i18n-attr="placeholder"
  data-i18n-key="setting.sch"
>
```

## JavaScript Pattern

Use `lang()` for JavaScript-generated UI:

```js
const label = lang('Check for updates', 'setting.update.check');
```

For dynamic values, translate the template and replace placeholders:

```js
const template = lang('Line %line, Column %column', 'code-editor.status');
status.textContent = template
  .replace('%line', line)
  .replace('%column', column);
```

Do not concatenate translated sentence fragments unless the result is grammatically safe in every supported language.

## Startup and Async Loading

Some UI is built during early script evaluation. If translations load asynchronously after that UI is created, fallback text can become permanent.

Rules:

- Startup menus and notices must use translation data that is already available.
- If a feature creates UI before async fetch completes, it must use the synchronous preload path or rebuild after translations apply.
- Dynamically inserted nodes should still use `lang()` or keyed HTML.

## Settings App Requirements

Settings is especially sensitive because it contains many static rows, descriptions, and section pages.

For every Settings row:

- The title must be translated.
- The description must be translated.
- The page title must be translated.
- Disabled or placeholder rows still need translations.
- Home page cards must use the same translation quality as the destination page.

Do not leave Settings body text as raw Chinese or raw English.

## Tauri and Web Parity

The Tauri-facing JavaScript bridge should not introduce localized UI strings unless those strings go through the same translation path.

If Tauri returns errors or statuses that are displayed to users:

- Return codes or structured states where possible.
- Translate those states in the frontend.
- Keep browser and desktop behavior aligned.

## Verification Checklist

Before opening a PR or commit:

```powershell
node --check desktop.js
node --check module/apps.js
```

Also verify:

- All `data-i18n` and `data-i18n-key` values exist in English.
- `lang_en.properties` and `lang_en-US.properties` have key parity.
- `https://win12.test/desktop.html` works through Laravel Herd.
- English mode shows English in Settings, Start, Search, notices, and app windows.
- Chinese mode still shows Chinese correctly.

## Review Standard

A PR that adds user-facing UI but does not update translation files should be treated as incomplete.

Reviewers should ask:

- Where is this string translated?
- Does this work in `en`, `en-US`, `zh_CN`, and `zh_TW`?
- Is this static HTML, an attribute, or JavaScript-generated text?
- Does the UI still translate after dynamic rendering?

## Current Compatibility Layer

The app contains an English cleanup layer for legacy hardcoded strings. That layer exists to protect users while older UI is migrated.

Do not use it as the default development pattern. New work should use translation keys directly.
