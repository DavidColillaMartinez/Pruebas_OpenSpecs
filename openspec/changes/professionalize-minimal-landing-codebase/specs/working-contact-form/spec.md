## ADDED Requirements

### Requirement: Contact form is a real submit form
The mobile Contacto section MUST render a real `<form>` element with a `submit` button. The submit button MUST be a `<button type="submit">`, not an anchor. The form's `onSubmit` handler MUST call `e.preventDefault()` to stop the default form submission, validate the three required fields, and open WhatsApp with the encoded form data.

#### Scenario: User submits a valid form
- **WHEN** a user fills in Nombre, Teléfono, and Mensaje and submits the form
- **THEN** the page does not navigate; instead, WhatsApp opens in a new tab with the encoded form data as the message body

#### Scenario: User submits an empty form
- **WHEN** a user submits the form with one or more required fields empty
- **THEN** the browser blocks the submission and announces the missing field to assistive technology

### Requirement: Every contact form field has a label
Each input in the contact form MUST have a visible `<label>` with a `<span>` text and a matching `for`/`id` pair. The input MUST also keep its `aria-label` for assistive technology as a backup. Required fields MUST be marked with `aria-required="true"` and `required`.

#### Scenario: Screen reader reads the form
- **WHEN** assistive technology traverses the contact form
- **THEN** each field is announced with a meaningful label and the required state
