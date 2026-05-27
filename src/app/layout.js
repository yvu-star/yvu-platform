// src/app/layout.js
import './globals.css';

export const metadata = {
  title: 'YouthVerse Union',
  description: 'Inspiring South Asian Youth',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}