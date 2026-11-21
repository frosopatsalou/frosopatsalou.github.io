# Portfolio analytics

The shared cookie banner and click tracking run on all portfolio pages.

GA4 destination: G-KW0S5X0X0M.
The destination was verified in the public container GTM-5TNH42D8 supplied by Froso.
The site loads the Google tag directly after consent. Do not also add the GTM script, which could duplicate page views.

## Consent behaviour

The Google tag is blocked until a visitor accepts optional analytics. Rejection produces no Google Analytics requests. The choice is saved in localStorage for 180 days. Cookie settings is always available after the page introduction. Withdrawing consent disables tracking, removes analytics cookies at the configured host and path, and reloads the page to unload Google's runtime. Other tabs receive the preference change.

Advertising storage, advertising user data and advertising personalisation remain denied. Google Signals and advertising personalisation are disabled. Analytics cookies are configured for 30 days.

The site sends known interface labels only. It strips query strings and fragments from its page URL and referrer fields, and does not send copied email addresses, visitor names, arbitrary button text or input values as custom event parameters.

## Events

| Event | Meaning | Parameters |
| --- | --- | --- |
| page_view | Consented page visit | page_title, page_location, page_referrer |
| navigation_click | Home, Work, About or Contact navigation | destination, page_name |
| case_study_open | Opening a pinned project card | project, page_name |
| contact_click | Email, Instagram or LinkedIn action | method, page_name |
| file_download | Download link activation | content_type, page_name |
| photo_toggle | Full contact photo or replay | action, page_name |
| video_start | The Way Home film starts | video_title, page_name |

These do not identify individual visitors. LinkedIn and CV events will become relevant when their links are supplied.

## Reports

Open Google Analytics and select the property containing measurement ID G-KW0S5X0X0M. Realtime and DebugView can be used for verification. Custom event parameters such as project and method can be registered as event scoped custom dimensions in Admin for use in standard explorations.

## Files

analytics-config.js holds the public measurement ID. cookie-consent.js controls consent and event collection. styles/cookie-consent.css supplies the banner styling.

Official references:
https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic
https://developers.google.com/analytics/devguides/collection/ga4/events
