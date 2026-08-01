import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createDirectiveNode, lexical } from "@mdxeditor/editor";
import { COMMAND_PRIORITY_LOW, KEY_DOWN_COMMAND } from "lexical";

export default function CalloutShortcutListener() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const { $getSelection, $isRangeSelection, $getNodeByKey, $isTextNode } =
      lexical;

    const removeKeyboardListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key !== " " && event.key !== "Enter") {
          return false;
        }

        const match = editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return null;
          }

          const anchorNode = $getNodeByKey(selection.anchor.key);
          if (!$isTextNode(anchorNode)) {
            return null;
          }

          const textContent = anchorNode.getTextContent();
          if (selection.anchor.offset !== textContent.length) {
            return null;
          }

          const parentNode = anchorNode.getParent();
          if (!parentNode || parentNode.getType() !== "paragraph") {
            return null;
          }

          const directiveMatch = textContent.match(/^:::([a-z]+)?$/);
          if (!directiveMatch) {
            return null;
          }

          const name = directiveMatch[1] || "info";
          if (
            !["note", "tip", "danger", "info", "caution", "warning"].includes(
              name
            )
          ) {
            return null;
          }

          return { name, paragraphKey: parentNode.getKey() };
        });

        if (!match) {
          return false;
        }

        editor.update(() => {
          const parentNode = $getNodeByKey(match.paragraphKey);
          if (!parentNode) {
            return;
          }

          const directiveNode = $createDirectiveNode({
            type: "containerDirective",
            name: match.name,
            attributes: {},
            children: [{ type: "paragraph", children: [] }],
          });

          parentNode.insertAfter(directiveNode);
          directiveNode.select();
          parentNode.remove();
        });

        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeKeyboardListener();
    };
  }, [editor]);

  return null;
}
