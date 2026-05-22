export function isAncestorPath(parent: number[], child: number[]) {
  return (
    parent.length < child.length &&
    parent.every((segment, index) => segment === child[index])
  )
}

export function samePath(a: number[], b: number[]) {
  return a.length === b.length && a.every((segment, index) => segment === b[index])
}
