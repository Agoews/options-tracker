import { MutationError } from "@/lib/server/mutation-response";
import { assertTrustedOrigin } from "@/lib/server/request-origin";

describe("request-origin", () => {
  it("allows same-origin mutation requests", () => {
    const request = new Request("https://app.example.com/api/trades", {
      method: "POST",
      headers: {
        origin: "https://app.example.com",
      },
    });

    expect(() => assertTrustedOrigin(request)).not.toThrow();
  });

  it("allows requests without an origin header", () => {
    const request = new Request("https://app.example.com/api/trades", {
      method: "POST",
    });

    expect(() => assertTrustedOrigin(request)).not.toThrow();
  });

  it("rejects cross-origin mutation requests", () => {
    const request = new Request("https://app.example.com/api/trades", {
      method: "POST",
      headers: {
        origin: "https://evil.example.com",
      },
    });

    expect(() => assertTrustedOrigin(request)).toThrow(MutationError);

    try {
      assertTrustedOrigin(request);
    } catch (error) {
      expect(error).toBeInstanceOf(MutationError);
      expect((error as MutationError).status).toBe(403);
      expect((error as MutationError).code).toBe("untrusted_origin");
    }
  });
});
