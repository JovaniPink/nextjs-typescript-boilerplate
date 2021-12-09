/// <reference types="next" />
/// <reference types="next/image-types/global" />

// twin.d.ts
import 'twin.macro';
import styledImport from '@emotion/styled';
import { css as cssImport } from '@emotion/react';

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

// see https://nextjs.org/docs/basic-features/typescript for more information.
