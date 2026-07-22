import Link from "next/link";

const footerLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Community", href: "/community" },
  { label: "Mentor", href: "/mentor" },
  { label: "Resources", href: "/resources" },
];

const socialLinks = [
  { label: "YouTube", href: "https://youtube.com/@lynxdev" },
  { label: "GitHub", href: "https://github.com/lynxdev" },
  { label: "Twitter", href: "https://twitter.com/lynxdev" },
];

function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold">LynxDev HUB</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Learn. Build. Grow. For Free.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <h4 className="text-sm font-medium mb-3">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Connect</h4>
              <ul className="space-y-2">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LynxDev HUB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
