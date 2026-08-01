import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_TAB_COMMAND,
} from "lexical";
import { $isLinkNode } from "@lexical/link";

export default function TabShortcutListener() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        let handled = false;
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchorNode = selection.anchor.getNode();

          // Let Lexical handle Tab if we are in a list item (indenting lists)
          const isInsideList =
            anchorNode.getType() === "listitem" ||
            anchorNode.getType() === "list" ||
            anchorNode.getParents().some((n) => n.getType() === "listitem");

          if (isInsideList) {
            return;
          }

          if (!selection.isCollapsed()) return;

          const offset = selection.anchor.offset;

          if ($isTextNode(anchorNode)) {
            const parent = anchorNode.getParent();

            if (
              parent &&
              ($isLinkNode(parent) || parent.getType() === "code")
            ) {
              const textContent = anchorNode.getTextContent();
              if (offset === textContent.length) {
                const nextSibling = parent.getNextSibling();
                event.preventDefault();
                if (nextSibling && $isTextNode(nextSibling)) {
                  nextSibling.select(0, 0);
                } else {
                  parent.selectNext();
                }
                handled = true;
                return;
              }
            }
          }

          event.preventDefault();
          selection.insertText("    ");
          handled = true;
        });
        return handled;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
