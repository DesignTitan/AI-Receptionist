import { VoiceExample } from "./voice-example";

export function BusySection() {
  return <section id="cost" className="rc-chapter rc-busy" data-sc-act="flow" aria-labelledby="busy-title">
    <div className="sc-wrap">
      <div className="rc-busy__story">
        <div data-sc-in>
          <p className="rc-benefit-eyebrow">When your hands are full</p>
          <h2 id="busy-title">You can’t be in two conversations at once.</h2>
          <p className="rc-busy__body">You’re with a customer. The phone rings. Give the next person a way to book while you stay focused on the person in front of you.</p>
        </div>
        <figure className="rc-busy__photo" data-sc-in>
          <img src="/marketing/customer-conversation.png" width={1536} height={1024} alt="A business owner listening to a customer across a table, with her phone set aside." />
          <div className="rc-busy__call" aria-hidden="true"><span>☎</span><div><strong>Incoming call</strong><p>A customer wants to book</p></div></div>
        </figure>
      </div>
      <div className="rc-busy__options" data-sc-in>
        <div>
          <div className="rc-busy__times" aria-hidden="true"><p>Select a time <span>Available appointments</span></p><div><span>9:00</span><span>10:00</span><span className="is-selected">11:30</span><span>1:00</span></div></div>
          <h3>A way to book online.</h3>
          <p>Customers choose from your available times.</p>
        </div>
        <div className="rc-busy__voice">
          <img src="/marketing/happy-pillow-listening.png" width={150} height={150} alt="" />
          <div><span className="rc-busy__pilot">Pilot</span><h3>A voice when you’re busy.</h3><p>AI phone booking, with a route to your team.</p><VoiceExample /></div>
        </div>
      </div>
      <div className="rc-overview__footer" data-sc-in><a href="/features">Explore booking options ↗</a><p>Incoming AI calls require a tested phone connection. Illustrative scene.</p></div>
    </div>
  </section>;
}
