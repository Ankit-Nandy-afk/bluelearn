import { visit } from "unist-util-visit";

export function remarkCallout() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (
        node.type === "containerDirective" ||
        node.type === "leafDirective" ||
        node.type === "textDirective"
      ) {
        if (
          ["info", "caution", "warning", "tip", "danger", "note"].includes(
            node.name
          )
        ) {
          const data = node.data || (node.data = {});
          data.hName = "callout";
          data.hProperties = { type: node.name };
        }
      }
    });
  };
}
