# json-document causal dogfood artifacts

These tarballs were packed from
`developer-1px/json-document@218aa475970c922af976b0a66f45539bbe9e5f15`
for the canonical Canvas causal integration tracer.

They are test-only development dependencies. Production Canvas source must not
import them, and the published `@interactive-os/canvas` build and tarball must
not include their package contents or add them as runtime dependencies.

Verify the artifacts from this directory with:

```sh
shasum -a 256 -c SHA256SUMS
```
