import Link from "next/link";
import { MAX_CALL_MINUTES, OVERAGE_CENTS } from "@/lib/platform/pricing";

function CampaignImage({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="features-photo">
      <img src={src} alt={alt} width={2048} height={2048} loading="lazy" />
      <figcaption>{caption} <span>Illustrative scene</span></figcaption>
    </figure>
  );
}

/** Benefit stories for the features page. Product controls remain in the owner dashboard. */
export function CoreFeatures() {
  return (
    <div className="features-stories">
      <section className="features-story features-story--opening" id="online-booking" aria-labelledby="online-booking-title">
        <div className="features-story__copy">
          <p className="features-eyebrow">01 / Online booking</p>
          <h2 id="online-booking-title">The next booking shouldn’t interrupt this one.</h2>
          <p className="features-body">Give customers a clear way to book with your business. They choose a person and an available time. You keep your attention on the client in front of you.</p>
          <ul className="features-points">
            <li>Your business name, brand colour, team and appointment details.</li>
            <li>Available times based on your saved hours, service durations and existing bookings.</li>
            <li>Online booking stays open after you close, for appointments during your working hours.</li>
          </ul>
          <Link className="features-text-link" href="/demos">Try the online booking demo <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="features-booking-flow">
          <p className="features-eyebrow">A simple path to an appointment</p>
          <ol>
            <li><span>01</span><div><strong>Choose a person.</strong><p>See the team and the service they offer.</p></div></li>
            <li><span>02</span><div><strong>Find a time.</strong><p>Pick from available appointments.</p></div></li>
            <li><span>03</span><div><strong>Make the booking.</strong><p>Leave contact details and receive a booking reference.</p></div></li>
          </ol>
          <p className="features-small">The booking is saved in your appointment book, ready for confirmation and follow-up.</p>
        </div>
      </section>

      <section className="features-story features-story--image-first" id="confirmation-calls" aria-labelledby="confirmation-calls-title">
        <div className="features-story__copy">
          <p className="features-eyebrow">02 / AI confirmation calls</p>
          <h2 id="confirmation-calls-title">Let the confirmation call happen while you work.</h2>
          <p className="features-body">After an online booking, your AI receptionist can call the customer to confirm their appointment details. One less routine call for you or your team to make.</p>
          <ul className="features-points">
            <li>Confirms the appointment with the customer in a conversation.</li>
            <li>Records the outcome and flags requests that need your team.</li>
            <li>Turn confirmation calls on or off independently of incoming calls.</li>
          </ul>
          <p className="features-small">Calls start after voice setup and activation, within your available minutes. A request to reschedule goes to your team to arrange a new time.</p>
        </div>
        <CampaignImage src="/marketing/full-attention.webp" alt="A stylist giving a seated client her full attention in a calm salon." caption="Be present for the work that needs you." />
      </section>

      <section className="features-story" id="incoming-calls" aria-labelledby="incoming-calls-title">
        <div className="features-story__copy">
          <p className="features-eyebrow">03 / Incoming phone booking <span className="features-pilot">Pilot</span></p>
          <h2 id="incoming-calls-title">A booking can start with a conversation.</h2>
          <p className="features-body">Some customers would rather call. The incoming-call pilot is designed to let them ask for an appointment, hear available times and agree to a booking, while you choose when your team gets involved.</p>
          <ul className="features-points">
            <li>New phone bookings use the same appointment book as online bookings.</li>
            <li>The assistant checks availability and reads the details back before saving.</li>
            <li>Callers who ask for a person follow your staff or voicemail route.</li>
          </ul>
          <p className="features-status-note"><strong>Incoming-call pilot.</strong> Your phone connection must be reviewed and tested before we activate incoming AI calls.</p>
        </div>
        <div className="features-choices">
          <p className="features-eyebrow">You choose who answers</p>
          <dl>
            <div><dt>Let callers choose.</dt><dd>A menu offers AI booking or a member of your team.</dd></div>
            <div><dt>Give your team the first ring.</dt><dd>Use AI for booking help if staff cannot answer.</dd></div>
            <div><dt>Let AI answer first.</dt><dd>Start with the appointment conversation and keep a human route available.</dd></div>
            <div><dt>Keep it with your team.</dt><dd>Staff-only mode uses voicemail if no one answers.</dd></div>
          </dl>
          <p className="features-small">A staff transfer needs a separate reachable number. We check the route with you during phone setup.</p>
        </div>
      </section>

      <section className="features-story features-story--image-first" id="coverage" aria-labelledby="coverage-title">
        <div className="features-story__copy">
          <p className="features-eyebrow">04 / Your answering schedule <span className="features-pilot">Pilot</span></p>
          <h2 id="coverage-title">Make room for a proper break.</h2>
          <p className="features-body">A busy afternoon, a day away, a week on vacation. Prepare how incoming calls should be answered around your life, with a schedule you can change when plans change.</p>
          <ul className="features-points">
            <li>Choose different answering options during and outside business hours.</li>
            <li>Add holiday and vacation dates in your business timezone.</li>
            <li>Set a temporary choice that returns to your regular schedule automatically.</li>
          </ul>
          <p className="features-status-note"><strong>Part of the incoming-call pilot.</strong> Coverage starts after your phone connection is tested. Answering hours and appointment availability are managed separately.</p>
        </div>
        <CampaignImage src="/marketing/proper-break.webp" alt="A business owner taking a quiet coffee break away from the reception desk." caption="A little more room in your day." />
      </section>

      <section className="features-story" id="call-records" aria-labelledby="call-records-title">
        <div className="features-story__copy">
          <p className="features-eyebrow">05 / Bookings and follow-up</p>
          <h2 id="call-records-title">Know what happened. See what needs you.</h2>
          <p className="features-body">Open your dashboard to review appointments and call outcomes. See who confirmed, who could not be reached and who needs a conversation with your team.</p>
          <ul className="features-points">
            <li>Review available call summaries and transcripts alongside the booking.</li>
            <li>Play confirmation-call recordings when the voice provider supplies them.</li>
            <li>Confirm pending appointments or cancel bookings from your dashboard.</li>
          </ul>
          <p className="features-small">An incoming-call history is also prepared for the pilot, including calls that do not result in a booking. Reschedule requests remain a team follow-up.</p>
        </div>
        <CampaignImage src="/marketing/owner-review.webp" alt="A salon owner using her laptop at the reception desk." caption="Check in, with the details in one place." />
      </section>

      <section className="features-story" id="usage-controls" aria-labelledby="usage-controls-title">
        <div className="features-story__copy">
          <p className="features-eyebrow">06 / Usage and spending</p>
          <h2 id="usage-controls-title">Keep control of what you spend.</h2>
          <p className="features-body">See your included minutes, call usage, renewal date and estimated bill. Additional spending starts at zero. You decide whether to allow more, and set the monthly limit.</p>
          <ul className="features-points">
            <li>Dashboard notices at 80% and 100% of your included allowance.</li>
            <li>Notices near your extra-spend limit and when AI calling pauses.</li>
            <li>Online booking stays available if your call budget runs out.</li>
          </ul>
          <Link className="features-text-link" href="/#terms">Compare plans and pricing <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="features-budget">
          <p className="features-eyebrow">Additional minutes</p>
          <p className="features-budget__rate">{OVERAGE_CENTS}<span>¢ / minute</span></p>
          <p className="features-body">Only within a spending limit you choose.</p>
          <hr />
          <p className="features-small">Each AI call rounds up to a started minute and can last up to {MAX_CALL_MINUTES} minutes. We reserve that full call allowance before starting, so calls can pause with a few minutes remaining.</p>
          <p className="features-small">Email alerts require connected delivery. Your dashboard keeps the usage notices available to review.</p>
        </div>
      </section>
    </div>
  );
}
