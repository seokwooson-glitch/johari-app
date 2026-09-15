import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "조하리의 창",
  description: "인사실 조하리의 창 활동",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <div className="mx-auto max-w-2xl px-5 pb-16">{children}</div>
      </body>
    </html>
  );
}
