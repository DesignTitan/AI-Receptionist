import { serviceClient } from "@/lib/supabase";
import { formatDateTime } from "@/lib/time";
export async function InboundCallHistory({ customerId, timezone }: { customerId: string; timezone: string }) {
  const { data, error } = await serviceClient().from("customer_calls")
    .select("id,caller_phone,started_at,status,result,booking_id,summary,transcript,duration_seconds")
    .eq("customer_id", customerId).order("started_at", { ascending: false }).limit(50);
  return <section className="platform-panel mb-6" aria-labelledby="incoming-history-title">
    <h2 id="incoming-history-title">Incoming calls</h2>
    <p>See bookings, messages and calls that need a person. Times shown in {timezone}.</p>
    {error ? <p role="status">Incoming call history is not available yet. Your other bookings are shown below.</p>
      : !data?.length ? <p>No incoming calls recorded. Once your phone connection is tested, calls will appear here even when no appointment is booked.</p>
      : <div className="platform-table"><table><thead><tr><th scope="col">Caller</th><th scope="col">Received</th><th scope="col">Result</th><th scope="col">AI time</th><th scope="col">Details</th></tr></thead>
        <tbody>{data.map(call => <tr key={call.id}>
          <td>{call.caller_phone ?? "Number withheld"}</td>
          <td>{formatDateTime(call.started_at, timezone)}</td>
          <td>{String(call.result ?? call.status).replaceAll("_", " ")}{call.booking_id && <small>Appointment saved</small>}</td>
          <td>{call.duration_seconds == null ? "Awaiting report" : `${call.duration_seconds}s`}</td>
          <td>{call.summary ?? "No summary yet."}{call.transcript && <details><summary>Read conversation</summary><p style={{ whiteSpace: "pre-wrap", maxWidth: 560 }}>{call.transcript}</p></details>}</td>
        </tr>)}</tbody></table></div>}
  </section>;
}
