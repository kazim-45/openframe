import './globals.css'

export const metadata = {
  title: 'OpenFrame — Pre-Production Suite · OpenSlate',
  description: 'Professional film pre-production. Storyboard, shot list, characters, locations, call sheet.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  )
}
