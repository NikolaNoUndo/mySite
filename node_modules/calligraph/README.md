# Calligraph

[![npm version](https://img.shields.io/npm/v/calligraph)](https://www.npmjs.com/package/calligraph)
[![npm downloads](https://img.shields.io/npm/dm/calligraph)](https://www.npmjs.com/package/calligraph)

Fluid text transitions powered by [Motion](https://motion.dev). Shared characters slide to their new positions while entering characters fade in and exiting ones fade out.

## Install

```bash
npm install calligraph
```

## Usage

```tsx
import { Calligraph } from "calligraph";
import { useState } from "react";

function App() {
  const [text, setText] = useState("Hello");

  return (
    <>
      <Calligraph>{text}</Calligraph>
      <button onClick={() => setText("World")}>Change</button>
    </>
  );
}
```

When `children` changes, characters common to both strings slide into their new positions. New characters fade in, removed characters fade out.

## Custom transitions

```tsx
<Calligraph transition={{ type: "spring", stiffness: 200, damping: 20 }}>
  {text}
</Calligraph>
```

## Requirements

- React 18+
- Motion 11+

## Sponsors

If Calligraph is useful to you or your team, consider [sponsoring the project](https://github.com/sponsors/raphaelsalaja).

## Acknowledgments

- [Jace](https://github.com/jacethings) for pushing me to build this
- Inspired by [Family](https://family.co/)
