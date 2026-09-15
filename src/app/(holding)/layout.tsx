import "../(marketing)/brand-fonts.css";
import "./holding.css";

/**
 * The holding site: the homepage hero and nothing else. No navigation, no
 * actions, one logo. Served at /coming-soon, and at / when COMING_SOON=true.
 * The wordmark is inlined so this page looks the same on every branch.
 */
export default function HoldingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rc hold">
      <header className="hold-nav">
        <div className="rc-nav__brand rc-nav-mascot">
          <a href="/" className="rc-nav-mascot__wordmark" aria-label="bubs home">
            <span className="rc-nav-mascot__character">
              <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true" focusable="false">
                <path fill="currentColor" fillRule="evenodd" d="M32 7C15 7 8 12 8 28v8c0 7 1 11 5 15L9 59l14-6c3 1 6 1 9 1 17 0 24-5 24-20v-6C56 12 49 7 32 7Z M23 36q9 4 18 0c-1 13-17 13-18 0Z" />
              </svg>
            </span>
            <span className="rc-nav-mascot__name">bubs™</span>
          </a>
        </div>
      </header>
      {children}
    </div>
  );
}
