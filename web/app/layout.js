import "./globals.css";

export const metadata = {
  title: "BookIt - Your Visual Memory",
  description: "Organize everything, beautifully",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/auth.css" />
        <link rel="stylesheet" href="/css/cookies.css" />
        <link rel="stylesheet" href="/css/home.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
