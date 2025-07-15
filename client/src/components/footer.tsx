export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-muted-foreground">
          © {currentYear} Web Performance Analyzer. All rights reserved. Created by Luis Mena.
        </div>
      </div>
    </footer>
  );
}