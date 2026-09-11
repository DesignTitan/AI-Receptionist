/** Illustrative product previews, not interactive booking or account controls. */
export function OverviewBenefits() {
  return (
    <div className="rc-overview__benefits" data-sc-in>
      <article>
        <div className="rc-benefit-art rc-benefit-art--booking" aria-hidden="true">
          <div className="rc-mini-panel rc-mini-booking">
            <span>Choose a time</span>
            <div className="rc-mini-date"><span>Available appointments</span><span>‹ &nbsp; ›</span></div>
            <div className="rc-mini-times"><span>10:00</span><span className="is-selected">11:30 <svg className="rc-mini-cursor" viewBox="0 0 24 28"><path d="M3 2v22l6-6 5 8 4-2-5-8 8-2Z" /></svg></span><span>14:00</span></div>
          </div>
          <img className="rc-mini-mascot" src="/marketing/happy-pillow-mascot.png" width={1024} height={1024} alt="" />
        </div>
        <p className="rc-benefit-eyebrow">Online booking</p>
        <h3>Make room for more bookings.</h3>
        <p className="rc-benefit-copy">Let customers choose an available time online.</p>
      </article>
      <article>
        <div className="rc-benefit-art rc-benefit-art--routing" aria-hidden="true">
          <div className="rc-mini-phone"><svg viewBox="0 0 24 24"><path d="M6 3 3 5c-1 7 9 17 16 16l2-3-5-4-2 2c-3-1-5-3-6-6l2-2Z" /></svg></div>
          <svg className="rc-mini-wave" viewBox="0 0 100 100"><path d="M0 50h8q4-30 8 0t8 0q4-65 8 0t8 0q4-42 8 0t8 0h7"/><path className="rc-mini-branches" d="M64 50C82 50 70 17 100 17M64 50C82 50 70 83 100 83"/></svg>
          <div className="rc-mini-routes">
            <div className="rc-mini-panel"><img src="/marketing/happy-pillow-mascot.png" width={1024} height={1024} alt="" /><span>AI</span><i /></div>
            <div className="rc-mini-panel"><svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3M17 4a3 3 0 0 1 0 6m2 4c3 1 3 4 3 7"/></svg><span>Your team</span><i /></div>
          </div>
        </div>
        <p className="rc-benefit-eyebrow">Pilot</p>
        <h3>Your calls.<br />Your rules.</h3>
        <p className="rc-benefit-copy">Choose who answers and when AI steps in.</p>
      </article>
      <article>
        <div className="rc-benefit-art" aria-hidden="true">
          <div className="rc-mini-panel rc-mini-activity">
            <strong>Your activity</strong>
            <div><span>Appointments</span><i>✓</i></div>
            <div><span>Call summaries</span><i>✓</i></div>
            <div><span>Spending limit</span><b className="rc-mini-meter" /></div>
          </div>
        </div>
        <p className="rc-benefit-eyebrow">Stay in control</p>
        <h3>Stay a step ahead.</h3>
        <p className="rc-benefit-copy">Keep bookings, follow-up, and call spending in view.</p>
      </article>
    </div>
  );
}
