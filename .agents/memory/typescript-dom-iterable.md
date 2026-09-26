---
name: TypeScript DOM iterable support
description: Generated API clients may rely on iterable Headers methods in the shared TypeScript build.
---

The shared TypeScript configuration must include the DOM iterable library when generated client code calls `Headers.entries()`.

**Why:** Orval's generated fetch helpers use iterable `Headers` APIs, while the default DOM library does not expose those methods to the compiler.

**How to apply:** Keep `DOM.Iterable` in the generated-client package's `lib` list when regenerating API clients or changing the workspace TypeScript setup.