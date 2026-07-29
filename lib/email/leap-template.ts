import { LEAP_CONFIRMATION_TEMPLATE } from "./leap-confirmation-template"

/**
 * Renders the vendored Leap email template with a customer's data — PREVIEW ONLY.
 *
 * Comet is an open-source reference partner: it never sends this email. Leap
 * owns delivery (via Resend, from the incentives-service `applications` edge
 * function). We render the REAL template here purely so the confirmation page
 * can show the customer the actual email they'll receive.
 */

type TemplateVars = Record<string, string | number | null | undefined>

/**
 * Minimal Handlebars subset covering exactly what these templates use:
 * `{{{#if key}}}…{{{else}}}…{{{/if}}}` blocks (nesting supported by resolving
 * innermost-first) and `{{{var}}}` substitution.
 */
export function renderLeapTemplate(template: string, vars: TemplateVars): string {
  const truthy = (k: string) => {
    const v = vars[k]
    return v !== undefined && v !== null && v !== "" && v !== 0 && v !== "0"
  }

  let out = template
  // Innermost {{{#if}}} has no nested if/endif in its body.
  const ifRe =
    /\{\{\{#if\s+(\w+)\}\}\}((?:(?!\{\{\{#if)(?!\{\{\{\/if\}\}\})[\s\S])*?)\{\{\{\/if\}\}\}/
  let guard = 0
  while (ifRe.test(out) && guard++ < 1000) {
    out = out.replace(ifRe, (_m, key: string, body: string) => {
      const [truePart, falsePart = ""] = body.split("{{{else}}}")
      return truthy(key) ? truePart : falsePart
    })
  }

  return out.replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_m, key: string) => {
    const v = vars[key]
    return v === undefined || v === null ? "" : String(v)
  })
}

export interface ConfirmationPreviewData {
  customerName: string
  companyName?: string
  utilityName?: string | null
  /** One-time money back after purchase — shown as "Estimated Total Incentive". */
  oneTimeBack: number
  programName?: string | null
  orderId: string
}

/** Builds the real Leap "information received" email as HTML for on-page preview. */
export function renderConfirmationPreview(
  data: ConfirmationPreviewData,
): { subject: string; html: string } {
  const submissionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const vars: TemplateVars = {
    customerName: data.customerName?.trim() || "there",
    companyName: data.companyName || "Comet",
    utilityName: data.utilityName || "your utility",
    submissionDate,
    currentYear: new Date().getFullYear(),
    totalIncentives: data.oneTimeBack > 0 ? Math.round(data.oneTimeBack) : "",
    programName: data.programName || "",
    refId: data.orderId,
    applicationPlural: "",
    applicationCountText: "1 application",
    applicationHasHave: "has",
    applicationCount: 1,
    applications: "", // no per-application cards in the reference preview
    companyLogoUrl: "", // no hosted Comet logo → template shows the Leap logo
  }

  return {
    subject: "We're reviewing your rebate application information",
    html: renderLeapTemplate(LEAP_CONFIRMATION_TEMPLATE, vars),
  }
}
