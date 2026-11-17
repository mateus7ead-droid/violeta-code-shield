import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { profileSchema } from "./profile-schema";

describe("profile data", () => {
  it("stores the user's name and editable trusted contacts", () => {
    assert.deepEqual(profileSchema.parse({ name: "Mateus", contacts: [{ name: "Pessoa de confiança", phone: "(79) 99999-1234" }] }), { name: "Mateus", contacts: [{ name: "Pessoa de confiança", phone: "(79) 99999-1234" }] });
  });
  it("rejects a missing name", () => {
    assert.equal(profileSchema.safeParse({ name: " ", contacts: [] }).success, false);
  });
});