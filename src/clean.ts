function clean(node: any): any {
  if (Array.isArray(node)) {
    return node.map(clean).filter(Boolean);
  }

  if (node.type === "comment") {
    return null;
  }

  if (node.type === "text" && /^\s*$/.test(node.data)) {
    return null;
  }

  if (node.children) {
    node.children = node.children.map(clean).filter(Boolean);
  }

  return node;
}

export default clean
