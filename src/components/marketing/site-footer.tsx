import { LEGAL_GROUPS, SOCIAL_NAMES } from "./legal-topics";
import { NavMascot } from "./nav-mascot";
import { PRODUCT_NAME } from "./product-chrome";

export function SiteFooter() {
  return (
        <footer id="colophon" className="rc-footer">
          <div className="rc-footer__top">
            <div><p className="rc-footer__eyebrow">A little less busy. A little more you.</p><h2>Good things start<br />with a conversation.</h2></div>
            <a className="rc-footer__hello" href="/#hear">Let’s talk <span aria-hidden="true">↗</span></a>
          </div>
          <div className="rc-footer__middle">
            <div className="rc-footer__brand"><NavMascot /><span>A booking page and an AI front desk.<br />More time for the work you love.</span></div>
            <nav aria-label="Footer explore"><h3>Explore</h3><a href="/features">Features</a><a href="/#industries">Industries</a><a href="/#terms">Pricing</a><a href="/demos">Try a demo</a></nav>
            <nav aria-label="Footer account"><h3>Your next step</h3><a href="/#hear">Ask for a call</a><a href="/#terms">View plans</a><a href="/account/login">Log in</a><a href="/features#coming-soon">What’s coming</a></nav>
          </div>
          <div className="rc-footer__trust">
            <div className="rc-footer__trust-heading"><h3>Legal, privacy &amp; trust</h3><span>Temporary placeholders · pending legal review</span></div>
            <div className="rc-footer__trust-links">
              {LEGAL_GROUPS.map(group => <nav aria-label={`Footer ${group.title}`} key={group.title}><h3>{group.title}</h3>{group.items.map(item => <a href={item.id === "do-not-sell" ? "/do-not-sell-or-share-my-personal-information" : `/legal#${item.id}`} key={item.id}>{item.title}</a>)}</nav>)}
              <nav aria-label="Footer social placeholders"><h3>Stay connected</h3>{SOCIAL_NAMES.map(name => <a key={name} href={`/legal#social-${name.toLowerCase()}`}>{name} <small>Coming soon</small></a>)}</nav>
            </div>
            <p className="rc-footer__draft">Legal documents and security information are drafts. No certification or compliance status is claimed.</p>
          </div>
          <div className="rc-footer__bottom"><span>© {new Date().getFullYear()} {PRODUCT_NAME}</span><span>The three demo businesses are fictional.</span><a href="#marketing-top">Back to top ↑</a></div>
        </footer>
  );
}
