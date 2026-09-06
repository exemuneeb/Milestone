---
name: Groq model access
description: Groq model availability can vary by API key even when a model appears in public docs.
---

Verify the configured Groq key against a live model before relying on a model ID; a documented model may still return `model_not_found` for that key.

**Why:** BenchBoard's initial documented Llama IDs returned provider-side 404 responses, while a current production-listed model worked with the same key.

**How to apply:** Keep the model choice easy to update and treat provider model errors as configuration/runtime concerns rather than silently falling back.