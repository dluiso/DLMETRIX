import { Global, Module } from '@nestjs/common';

// The API itself doesn't need heavy i18n — it returns data keys
// Frontend handles display translation. But error messages can be localized.
// This module acts as a placeholder for future API-side i18n if needed.

@Global()
@Module({})
export class I18nModule {}
