import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-secondary py-12 px-6 md:px-12">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-display text-xl mb-3 text-foreground">Bellara</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Timeless luxury bags crafted with passion and precision. Elevate your everyday.
        </p>
      </div>
      <div>
        <h4 className="font-body font-semibold text-sm mb-3 text-foreground">Quick Links</h4>
        <div className="space-y-2">
          <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/store" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Store</Link>
        </div>
      </div>
      <div>
        <h4 className="font-body font-semibold text-sm mb-3 text-foreground">Contact</h4>
        <p className="text-sm text-muted-foreground">hello@bellara.com</p>
        <p className="text-sm text-muted-foreground">+1 (555) 234-5678</p>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border text-center">
      <p className="text-xs text-muted-foreground">© 2026 Bellara. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
