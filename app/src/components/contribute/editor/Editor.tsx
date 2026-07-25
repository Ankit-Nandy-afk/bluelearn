import { useCallback, useMemo, useRef, useState } from "react";
import {
  MDXEditor,
  NestedLexicalEditor,
  codeBlockPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  headingsPlugin,
  imagePlugin,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  useMdastNodeUpdater,
  useNestedEditorContext,
} from "@mdxeditor/editor";
import { toast } from "sonner";
import { Callout } from "../../Callout";

import {
  MathLiveComponent,
  getIsInlineFromAttributes,
  mathShortcutsPlugin,
} from "./MathLivePlugin";
import EditorToolbar from "./EditorToolbar";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./Editor.css";

type EditorProps = {
  id?: string;
  // Markdown to open with, e.g. when resuming a draft.
  value?: string;
  onChange?: (markdown: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
};

export default function Editor({
  id = "default-draft",
  value,
  onChange,
  onUploadImage,
}: EditorProps) {
  const autosaveKey = `bluelearn-editor-autosave-${id}`;

  const [initialMarkdown] = useState<string>(() => {
    if (value) return value;
    try {
      const saved = localStorage.getItem(autosaveKey);
      if (saved) return saved;
    } catch {}
    return "";
  });

  const editorRef = useRef<MDXEditorMethods>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onUploadImageRef = useRef(onUploadImage);
  onUploadImageRef.current = onUploadImage;
  const latestRef = useRef<string | null>(null);

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      latestRef.current = newMarkdown;

      // Save locally immediately to guarantee no keystrokes are lost
      try {
        localStorage.setItem(autosaveKey, newMarkdown);
      } catch {}

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        onChangeRef.current?.(newMarkdown);
        saveTimeoutRef.current = null;
      }, 1000);
    },
    [autosaveKey]
  );

  const handleBlur = useCallback(() => {
    // If the user clicks away (e.g., clicking "Save Draft" or "Next"),
    // immediately flush any pending debounced state to the parent
    // so that the button click handlers see the freshest data.
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
      if (latestRef.current !== null) {
        setTimeout(() => {
          onChangeRef.current?.(latestRef.current!);
        }, 0);
      }
    }
  }, []);

  const CalloutDirectiveDescriptor = useMemo(
    () => ({
      name: "callout",
      testNode(node: any) {
        return ["note", "tip", "danger", "info", "caution"].includes(node.name);
      },
      attributes: [],
      hasChildren: true,
      Editor: (props: any) => {
        return (
          <Callout type={props.mdastNode.name}>
            <NestedLexicalEditor
              block
              getContent={(node) => (node as any).children}
              getUpdatedMdastNode={(mdastNode, children) => ({
                ...mdastNode,
                children: children as any,
              })}
            />
          </Callout>
        );
      },
    }),
    []
  );

  // Stable plugins configuration to avoid rebuilding Lexical instance during state re-renders
  const plugins = useMemo(
    () => [
      headingsPlugin({
        allowedHeadingLevels: [2, 3, 4, 5, 6],
      }),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      tablePlugin(),
      imagePlugin({
        EditImageToolbar: () => null,
        imageUploadHandler: (file) =>
          onUploadImageRef.current
            ? onUploadImageRef.current(file)
            : Promise.reject(new Error("Image upload is not available")),
      }),
      codeBlockPlugin({
        defaultCodeBlockLanguage: "javascript",
      }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          text: "Plain Text",
          javascript: "JavaScript",
          typescript: "TypeScript",
          html: "HTML",
          css: "CSS",
          c: "C",
          cpp: "C++",
          java: "Java",
          python: "Python",
          markdown: "Markdown",
        },
      }),
      directivesPlugin({ directiveDescriptors: [CalloutDirectiveDescriptor] }),
      mathShortcutsPlugin(),
      jsxPlugin({
        jsxComponentDescriptors: [
          {
            name: "Math",
            kind: "text",
            props: [
              { name: "latex", type: "string" },
              { name: "inline", type: "expression" },
            ],
            hasChildren: false,
            Editor: (props) => {
              const updateMdastNode = useMdastNodeUpdater();
              const { lexicalNode } = useNestedEditorContext();
              const handleChange = (newLatex: string) => {
                const isInline = getIsInlineFromAttributes(
                  props.mdastNode.attributes
                );

                updateMdastNode({
                  attributes: [
                    { type: "mdxJsxAttribute", name: "latex", value: newLatex },
                    {
                      type: "mdxJsxAttribute",
                      name: "inline",
                      value: {
                        type: "mdxJsxAttributeValueExpression",
                        value: isInline ? "true" : "false",
                      },
                    },
                  ],
                });
              };
              const latexAttr = props.mdastNode.attributes.find(
                (a: any) => a.name === "latex"
              );
              const isInline = getIsInlineFromAttributes(
                props.mdastNode.attributes
              );

              return (
                <MathLiveComponent
                  latex={
                    latexAttr &&
                    typeof latexAttr === "object" &&
                    typeof latexAttr.value === "string"
                      ? latexAttr.value
                      : ""
                  }
                  inline={isInline}
                  onChange={handleChange}
                  nodeKey={lexicalNode.getKey()}
                />
              );
            },
          },
        ],
      }),
      toolbarPlugin({
        toolbarContents: () => (
          <EditorToolbar
            editorRef={editorRef}
            onH1Attempted={() => {
              toast.warning("Heading 1 is Reserved for the Guide's Title", {
                description:
                  "We have automatically converted it to Heading 2 (##) to keep your formatting clean.",
                duration: 8000,
              });
            }}
          />
        ),
      }),
    ],
    []
  );

  return (
    <div
      id="bluelearn-editor-container"
      className="editor-only-container transition-all"
    >
      <div className="editor-only-paper flex flex-col">
        <MDXEditor
          ref={editorRef}
          markdown={initialMarkdown}
          onChange={handleMarkdownChange}
          onBlur={handleBlur}
          contentEditableClassName="mdxeditor-content"
          placeholder="What will you teach the world today? Start typing here..."
          plugins={plugins}
        />
      </div>
    </div>
  );
}
