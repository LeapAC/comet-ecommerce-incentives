import { describe, it, expect } from "vitest"

import { renderLeapTemplate, renderConfirmationPreview } from "./leap-template"

describe("renderLeapTemplate escaping (XSS guard)", () => {
  it("escapes HTML in substituted values as literal text, not live markup", () => {
    const out = renderLeapTemplate("Hi {{{customerName}}},", {
      customerName: `<img src=x onerror=alert(document.domain)>`,
    })
    // Escaped literal — NOT live markup.
    expect(out).toContain("&lt;img src=x onerror=alert(document.domain)&gt;")
    expect(out).not.toContain("<img src=x onerror=")
  })

  it("escapes <script> payloads", () => {
    const out = renderLeapTemplate("{{{customerName}}}", {
      customerName: `<script>alert(1)</script>`,
    })
    expect(out).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(out).not.toContain("<script>")
  })

  it("escapes quotes and ampersands (attribute-breakout defense)", () => {
    const out = renderLeapTemplate("{{{v}}}", {
      v: `"><img src=x> & 'quote'`,
    })
    expect(out).toContain("&quot;&gt;&lt;img src=x&gt; &amp; &#39;quote&#39;")
    expect(out).not.toContain('"><img src=x>')
  })

  it("escapes user data flowing through the real confirmation preview", () => {
    const { html } = renderConfirmationPreview({
      customerName: `<img src=x onerror=alert(document.domain)>`,
      oneTimeBack: 500,
      utilityName: `<b>PG&E</b>`,
      orderId: `comet-order-<script>`,
    })
    // Injected name renders escaped in the greeting.
    expect(html).toContain("&lt;img src=x onerror=alert(document.domain)&gt;")
    expect(html).not.toContain("<img src=x onerror=")
    // Utility + refId (API/derived) are escaped too.
    expect(html).toContain("&lt;b&gt;PG&amp;E&lt;/b&gt;")
    expect(html).toContain("comet-order-&lt;script&gt;")
    expect(html).not.toContain("<script>")
    // Trusted template markup is preserved (real tags still present).
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("We've Received Your Information")
  })
})
