---
name: Clerk demo account provisioning
description: Constraints for development users created through the Clerk backend API
---

Clerk development users created through the backend API must use conventionally valid public email domains; placeholder TLDs such as `.demo` can be rejected as invalid email addresses.

**Why:** Clerk rejected the initial demo addresses before account creation, even though they looked valid to a browser form.

**How to apply:** Use a valid reserved or project-owned domain for development demo identities, and keep the credentials visible only as intentional demo content.