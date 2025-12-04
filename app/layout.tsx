export const metadata = {
  title: 'MMC MCP Bridge',
  description: 'Enterprise MCP Orchestration Platform - 24+ MCP Servers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}





