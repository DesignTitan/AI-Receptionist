# Onboarding concepts

Design images, not implemented screens. Based on the existing BusinessSetupForm and authenticated /account/setup route.

## Hours & team
- Existing data: timezone, selected weekdays, one opening/closing range shared by all selected days and all team members.
- Team: name, service, appointment length; enforce the purchased plan's team limit. These are bookable people, not invited user accounts.
- Proposed interaction: compact editable rows; Add person opens an inline editor; preview updates immediately as hours/team change.
- Use full weekday accessible labels even if visual toggles are short. Use existing appointment-duration choices. Preserve inputs when moving Back or reviewing.
- The weekly visual is illustrative availability, not a promised live calendar integration. Actual booking rules still apply.

## Review & setup
- No separate review screen exists today; the current form submits all details directly.
- Proposed step groups business identity, schedule/team and phone/appointment-book details. Edit links return to the correct step and retain entered data.
- CTA: Send for setup. Keep current authenticated payment guards and business-validation endpoint. Failed submissions retain data and present retryable errors.
- A successful submission moves to the existing setup-pending operational state; it does not activate a phone line or launch a business automatically.
- Explain concierge preparation, test call, and live notification without promising a timeline or supported integration.

## Visual system
Use real Apfel Grotezk / Open Runde fonts in implementation, forest text, white background, mint accents, 24px card corners and pill buttons. Shared full-width plain sticky header: mascot left, hamburger and avatar right. Match the app's pointed mascot asset; generated concept details are illustrative. Stack columns on mobile and retain natural scrolling when needed.

All example names, business information and hours in these images are fictional. No application behavior changed as part of this design task.
