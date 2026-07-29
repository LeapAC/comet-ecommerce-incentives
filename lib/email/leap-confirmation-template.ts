/**
 * REAL Leap transactional email template — the "We've Received Your Information"
 * ("were-reviewing-your-submission") email a customer receives after a partner
 * submits their incentive info.
 *
 * SOURCE OF TRUTH: connect-incentives/email-templates/email-template-resend.html
 * (deployed to Resend by connect-incentives/scripts/deploy-resend-templates.ts and
 * sent by the incentives-service `applications` edge function). Vendored here
 * VERBATIM so the reference site can render the exact email as a PREVIEW.
 *
 * This is preview-only. Comet (an open-source reference partner) never sends it —
 * Leap manages and sends these emails on the partner's behalf. Do not edit the
 * markup here; update the source template in connect-incentives and re-copy.
 *
 * Uses Handlebars-style {{{var}}} / {{{#if x}}}…{{{else}}}…{{{/if}}} tokens,
 * rendered by renderLeapTemplate() in ./leap-template.ts.
 */
export const LEAP_CONFIRMATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Information Received - Next Steps</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <!-- Preview text (hidden preheader) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    We've received your information for {{{utilityName}}}{{{#if programName}}} - {{{programName}}}{{{/if}}}. Here's what happens next.
  </div>
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; background-color: #ffffff;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="text-align: left; vertical-align: middle;">
                    {{{#if companyLogoUrl}}}
                    <img src="{{{companyLogoUrl}}}" alt="{{{companyName}}}" style="max-width: 150px; max-height: 50px; height: auto; display: inline-block;" />
                    {{{else}}}
                    <img src="https://connect.incentives.leap.energy/images/leap-light.png?v=2" alt="Powered by Leap" width="87" height="47" style="display: inline-block; opacity: 0.7;" />
                    {{{/if}}}
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    {{{#if companyLogoUrl}}}
                    <img src="https://connect.incentives.leap.energy/images/leap-light.png?v=2" alt="Powered by Leap" width="87" height="47" style="display: inline-block; opacity: 0.7;" />
                    {{{/if}}}
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.3; text-align: center;">
                We've Received Your Information
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi {{{customerName}}},
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Thank you for submitting your information for your rebate application. There's nothing else you need to do right now. We've received your details and will now review them before submitting your rebate application{{{applicationPlural}}} to {{{utilityName}}}.
              </p>

              <!-- Important Notice -->
              <div style="margin: 25px 0; padding: 20px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #1e40af;">
                  What Happens Next
                </h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e40af;">
                  Our team will review your information and verify details with {{{companyName}}} before submitting your {{{applicationCountText}}} to {{{utilityName}}}. We'll email you once your application{{{applicationPlural}}} {{{applicationHasHave}}} been officially submitted.
                </p>
              </div>

              {{{#if totalIncentives}}}
              <div style="background-color: #fafafa; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">
                  Estimated Total Incentive
                </p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #16a34a;">
                  \${{{totalIncentives}}}
                </p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #737373;">
                  {{{utilityName}}}{{{#if programName}}} - {{{programName}}}{{{/if}}}
                </p>
              </div>
              {{{/if}}}

              <!-- Application Details -->
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                  Submission Details
                </h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #737373; width: 140px;">
                      Date Received:
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a; font-weight: 500;">
                      {{{submissionDate}}}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #737373;">
                      Status:
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #f59e0b; font-weight: 500;">
                      Pending Review
                    </td>
                  </tr>
                </table>
                <!-- Application Cards -->
                {{{#if applications}}}
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                  Application{{{applicationPlural}}} ({{{applicationCount}}})
                </p>
                {{{applications}}}
                {{{/if}}}
              </div>

              <!-- Timeline -->
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                  The Process
                </h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <!-- Step 1: Information Received -->
                  <tr>
                    <td style="width: 32px; vertical-align: top; padding-bottom: 20px;">
                      <table role="presentation" style="width: 24px; height: 24px; border-collapse: collapse; background-color: #16a34a; border-radius: 50%;">
                        <tr>
                          <td style="text-align: center; vertical-align: middle; color: #ffffff; font-size: 12px; font-weight: 600;">✓</td>
                        </tr>
                      </table>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px; padding-left: 12px;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Information Received</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #737373;">We've received your details and documentation.</p>
                    </td>
                  </tr>
                  <!-- Step 2: Review & Verification -->
                  <tr>
                    <td style="width: 32px; vertical-align: top; padding-bottom: 20px;">
                      <table role="presentation" style="width: 24px; height: 24px; border-collapse: collapse; background-color: #f59e0b; border-radius: 50%;">
                        <tr>
                          <td style="text-align: center; vertical-align: middle; color: #ffffff; font-size: 12px; font-weight: 600;">2</td>
                        </tr>
                      </table>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px; padding-left: 12px;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Review & Verification</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #737373;">Our team reviews your information and verifies details with {{{companyName}}}.</p>
                    </td>
                  </tr>
                  <!-- Step 3: Application Submitted -->
                  <tr>
                    <td style="width: 32px; vertical-align: top; padding-bottom: 20px;">
                      <table role="presentation" style="width: 24px; height: 24px; border-collapse: collapse; background-color: #e5e5e5; border-radius: 50%;">
                        <tr>
                          <td style="text-align: center; vertical-align: middle; color: #737373; font-size: 12px; font-weight: 600;">3</td>
                        </tr>
                      </table>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px; padding-left: 12px;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Application Submitted</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #737373;">Once verified, we'll submit your application to {{{utilityName}}}. You'll receive a confirmation email.</p>
                    </td>
                  </tr>
                  <!-- Step 4: Utility Review -->
                  <tr>
                    <td style="width: 32px; vertical-align: top; padding-bottom: 20px;">
                      <table role="presentation" style="width: 24px; height: 24px; border-collapse: collapse; background-color: #e5e5e5; border-radius: 50%;">
                        <tr>
                          <td style="text-align: center; vertical-align: middle; color: #737373; font-size: 12px; font-weight: 600;">4</td>
                        </tr>
                      </table>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px; padding-left: 12px;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Utility Review</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #737373;">{{{utilityName}}} reviews and processes your application.</p>
                    </td>
                  </tr>
                  <!-- Step 5: Approved & Paid -->
                  <tr>
                    <td style="width: 32px; vertical-align: top;">
                      <table role="presentation" style="width: 24px; height: 24px; border-collapse: collapse; background-color: #e5e5e5; border-radius: 50%;">
                        <tr>
                          <td style="text-align: center; vertical-align: middle; color: #737373; font-size: 12px; font-weight: 600;">5</td>
                        </tr>
                      </table>
                    </td>
                    <td style="vertical-align: top; padding-left: 12px;">
                      <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #1a1a1a;">Approved & Paid</p>
                      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #737373;">
                        {{{#if totalIncentives}}}
                        {{{utilityName}}} will send a check for \${{{totalIncentives}}} to your mailing address.
                        {{{else}}}
                        Your utility will send payment to your mailing address.
                        {{{/if}}}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Support Section -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fafafa; border-radius: 8px;">
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                  Questions?
                </h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #737373;">
                  If you have any questions about your submission, please don't hesitate to reach out to us at
                  <a href="mailto:incentives@leap.energy" style="color: #1a1a1a; text-decoration: underline; font-weight: 500;">
                    incentives@leap.energy
                  </a>
                  {{{#if refId}}}
                  <span style="display: block; margin-top: 8px; font-size: 12px; color: #999999;">
                    Reference ID: <span style="font-family: monospace;">{{{refId}}}</span>
                  </span>
                  {{{/if}}}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <tr>
                  <td style="text-align: left; vertical-align: middle;">
                    {{{#if companyLogoUrl}}}
                    <img src="{{{companyLogoUrl}}}" alt="{{{companyName}}}" style="max-width: 100px; max-height: 30px; height: auto; display: inline-block; opacity: 0.7;" />
                    {{{else}}}
                    <img src="https://connect.incentives.leap.energy/images/leap-light.png?v=2" alt="Leap" width="69" height="37" style="display: inline-block; opacity: 0.7;" />
                    {{{/if}}}
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    {{{#if companyLogoUrl}}}
                    <img src="https://connect.incentives.leap.energy/images/leap-light.png?v=2" alt="Leap" width="69" height="37" style="display: inline-block; opacity: 0.7;" />
                    {{{/if}}}
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 10px; font-size: 12px; color: #999999; line-height: 1.5; text-align: center;">
                This is an automated confirmation email. Please do not reply to this message.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5; text-align: center;">
                © {{{currentYear}}} {{{#if companyName}}}{{{companyName}}}{{{else}}}Leap Energy{{{/if}}} and Leap Energy. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
