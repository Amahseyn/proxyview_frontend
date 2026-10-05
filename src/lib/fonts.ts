import { Poppins } from 'next/font/google';

export const fontSans = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

/** Apply on <html>: loads Poppins and exposes --font-sans site-wide. */
export const fontVariables = `${fontSans.variable} ${fontSans.className}`;
