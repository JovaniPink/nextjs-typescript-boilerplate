import type { PropsWithChildren, ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
// import { ThemeProvider } from "my-ui-lib"
// import { TranslationProvider } from "my-i18n-lib"
// import defaultStrings from "i18n/en-x-default"

const Providers = ({ children }: PropsWithChildren) => {
  return children;
  // return (
  //   <ThemeProvider theme="light">
  //     <TranslationProvider messages={defaultStrings}>
  //       {children}
  //     </TranslationProvider>
  //   </ThemeProvider>
  // )
};

const customRender = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) => render(ui, { wrapper: Providers, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
