import test from "node:test";
import assert from "node:assert/strict";
import { formatAddressSuggestion, uniqueSuggestions } from "../src/lib/platform/address-suggestions.ts";

test("formats a US street address without repeating the country", () => {
  const s = formatAddressSuggestion({ housenumber: "5751", street: "28th Street", city: "Detroit", state: "Michigan", postcode: "48210", country: "United States" });
  assert.deepEqual(s, { primary: "5751 28th Street", secondary: "Detroit, Michigan, 48210", value: "5751 28th Street, Detroit, Michigan, 48210" });
});

test("keeps the country for addresses outside the US and ignores a place name once there is a street", () => {
  const s = formatAddressSuggestion({ name: "Willow Studio", housenumber: "12", street: "King St", city: "Toronto", state: "Ontario", country: "Canada" });
  assert.equal(s?.primary, "12 King St");
  assert.equal(s?.secondary, "Toronto, Ontario · Canada");
  assert.equal(s?.value, "12 King St, Toronto, Ontario, Canada");
});

test("skips transit stops that only borrow a street name", () => {
  assert.equal(formatAddressSuggestion({ name: "Warren / 28th NS (EB)", street: "West Warren Avenue", city: "Detroit", osm_key: "highway", osm_value: "bus_stop" }), undefined);
  assert.equal(formatAddressSuggestion({ name: "Detroit Station", osm_key: "public_transport", osm_value: "station" }), undefined);
});

test("falls back to the place name and drops empty or duplicate results", () => {
  const list = uniqueSuggestions([
    { properties: { name: "28th Street", city: "Detroit", state: "Michigan" } },
    { properties: { name: "28th Street", city: "Detroit", state: "Michigan" } },
    { properties: {} },
  ]);
  assert.equal(list.length, 1);
  assert.equal(list[0].primary, "28th Street");
});
