// Local-only browser fixture; never imported by the application or deployed as a route.
import http from "node:http";
const config = {
  trade: "salon",
  timezone: "America/New_York",
  days: [1, 2, 3, 4, 5],
  opens: "09:00",
  closes: "17:00",
  color: "#234d59",
  areaCode: "212",
  address: "24 Spring Street, New York",
  phone: "+12125550100",
  team: [
    {
      id: "member-1",
      name: "Jordan Ellis",
      service: "Cut & finish",
      minutes: 45,
    },
    {
      id: "member-2",
      name: "Alex Morgan",
      service: "Colour consultation",
      minutes: 30,
    },
  ],
};
const business = {
  id: "aaaaaaaa-1111-4111-8111-111111111111",
  owner_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  owner_email: "owner@example.test",
  business_name: "Sunday Studio",
  slug: "sunday-studio-test",
  plan: "busy",
  status: "draft",
  billing_status: null,
  config,
  created_at: new Date().toISOString(),
};
let state = "draft";
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost");
  res.setHeader("Content-Type", "application/json");
  if (u.pathname === "/fixture/state") {
    state = u.searchParams.get("value") ?? "draft";
    res.end("{}");
    return;
  }
  if (u.pathname === "/auth/v1/user") {
    if (req.headers.authorization !== "Bearer fixture-owner") {
      res.statusCode = 401;
      res.end("{}");
      return;
    }
    res.end(
      JSON.stringify({
        id: business.owner_id,
        email: business.owner_email,
        email_confirmed_at: new Date().toISOString(),
        aud: "authenticated",
        role: "authenticated",
      }),
    );
    return;
  }
  if (u.pathname === "/rest/v1/customers") {
    const isPublic = u.searchParams.has("slug");
    const c = {
      ...business,
      ...(isPublic || state === "live"
        ? {
            status: "live",
            billing_status: "active",
            agent_id: "123",
            number_id: "456",
            phone_number: "+12125550101",
          }
        : {}),
    };
    res.end(JSON.stringify(req.headers.accept?.includes("object") ? c : [c]));
    return;
  }
  if (u.pathname === "/rest/v1/customer_bookings") {
    res.setHeader("Content-Range", "0-0/0");
    res.end("[]");
    return;
  }
  if (u.pathname === "/rest/v1/customer_jobs") {
    res.end("[]");
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Fixture route not implemented" }));
});
server.listen(55440, "127.0.0.1", () =>
  console.log("Local fixture server: 127.0.0.1:55440"),
);
