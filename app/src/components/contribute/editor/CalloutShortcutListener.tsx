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
        if (event.key === " " || event.key === "Enter") {
          const state = { handled: false };

          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
              return;
            }

            const anchorKey = selection.anchor.key;
            const offset = selection.anchor.offset;
            const anchorNode = $getNodeByKey(anchorKey);

            if (!$isTextNode(anchorNode)) {
              return;
            }

            const textContent = anchorNode.getTextContent();
            if (offset !== textContent.length) {
              return;
            }

            const parentNode = anchorNode.getParent();
            if (parentNode && parentNode.getType() === "paragraph") {
              const match = textContent.match(/^:::([a-z]+)?$/);
              if (match) {
                const name = match[1] || "info";
                if (
                  [
                    "note",
                    "tip",
                    "danger",
                    "info",
                    "caution",
                    "warning",
                  ].includes(name)
                ) {
                  const directiveNode = $createDirectiveNode({
                    type: "containerDirective",
                    name,
                    attributes: {},
                    children: [{ type: "paragraph", children: [] }],
                  });

                  parentNode.insertAfter(directiveNode);
                  directiveNode.select();
                  parentNode.remove();

                  state.handled = true;
                }
              }
            }
          });

          if (state.handled) {
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeKeyboardListener();
    };
  }, [editor]);

  return null;
}
