import type { Metadata } from "next";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, type ThemeConfig } from "antd";
import Link from "next/link";

// System font stack: Segoe UI / San Francisco / Roboto, all cover Vietnamese template names
const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const ink = '#1A1F2B';       // black ink
const blueInk = '#1F3A93';   // blue signature ink
const sealRed = '#B4232A';   // seal red, only for the active tab
const graphite = '#5B6475';
const rule = '#D5D9E0';

const theme: ThemeConfig = {
  token: {
    colorPrimary: blueInk,
    colorLink: blueInk,
    colorText: ink,
    colorTextSecondary: graphite,
    colorBorder: rule,
    colorBgLayout: '#ECEEF2',
    borderRadius: 4,
    fontSize: 15,
    fontFamily: systemFont,
  },
  components: {
    Tabs: {
      inkBarColor: sealRed,
      itemColor: graphite,
      itemSelectedColor: ink,
      itemHoverColor: blueInk,
      titleFontSize: 15,
    },
    Button: { fontWeight: 500 },
  },
};

export const metadata: Metadata = {
  title: "Template Library",
  description: "Find an administrative document template and start writing from it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={theme}>
            <nav className="site-nav">
              <Link href="/" className="site-brand">Template Library</Link>
              <Link href="/">Templates</Link>
              <Link href="/documents">My documents</Link>
            </nav>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
