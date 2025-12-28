"use client";

import {
  forwardRef,
  type CSSProperties,
  type MouseEvent,
  type ChangeEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useId,
} from "react";
import { EditorContent, ReactRenderer, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Extension, Node as TiptapNode } from "@tiptap/core";
import type { Editor as TiptapEditor, Range } from "@tiptap/core";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import DragHandle from "@tiptap/extension-drag-handle-react";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { NodeSelection, Plugin, TextSelection } from "@tiptap/pm/state";
// BubbleMenu in TipTap v3 uses Floating UI internally.
// The `options` prop accepts a constrained set of positioning options (e.g. `offset`, `flip`, `shift`).
import type { LucideIcon } from "lucide-react";
import {
  AlignCenter as MdFormatAlignCenter,
  AlignJustify as MdFormatAlignJustify,
  AlignLeft as MdFormatAlignLeft,
  AlignRight as MdFormatAlignRight,
  Bold as MdFormatBold,
  Code as MdCode,
  FileCode as BiCodeBlock,
  CloudUpload as MdCloudUpload,
  GripVertical as MdDragIndicator,
  Eraser as MdFormatClear,
  IndentDecrease as MdFormatIndentDecrease,
  IndentIncrease as MdFormatIndentIncrease,
  Italic as MdFormatItalic,
  List as MdFormatListBulleted,
  ListOrdered as MdFormatListNumbered,
  Quote as MdFormatQuote,
  Strikethrough as MdFormatStrikethrough,
  Underline as MdFormatUnderlined,
  SeparatorHorizontal as MdHorizontalRule,
  Link2 as MdLink,
  Image as MdImage,
  Heading3 as MdLooks3,
  Heading1 as MdLooksOne,
  Heading2 as MdLooksTwo,
  Image as MdOutlineImage,
  Pilcrow as MdOutlineSegment,
  Palette as MdPalette,
  Subscript as MdSubscript,
  Superscript as MdSuperscript,
  Heading as MdTitle,
  Table as MdTableChart,
  ArrowUp as MdBorderTop,
  ArrowDown as MdBorderBottom,
  ArrowLeft as MdBorderLeft,
  ArrowRight as MdBorderRight,
  Trash2 as MdDeleteForever,
  ListChecks as MdChecklist,
  TextCursorInput as MdAltText,
} from "lucide-react";

import "./textEditor.css";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import * as Slider from "@radix-ui/react-slider";

type IconType = LucideIcon;

type SlashCommandAction = (props: { editor: TiptapEditor; range: Range }) => void;

type SlashCommandItem = {
  title: string;
  description: string;
  icon: IconType;
  action: SlashCommandAction;
};

type SlashCommandListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type SlashCommandListProps = SuggestionProps & {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
};

type ImageEventDetail = {
  position?: number;
  editorId?: string | null;
};

const getEditorInstanceId = (editor: TiptapEditor | null) => {
  const element = (editor?.view.dom as HTMLElement | null) ?? null;
  return element?.getAttribute("data-editor-id") ?? undefined;
};

const isNodeSelection = (selection: unknown): selection is NodeSelection => {
  const maybeSelection = selection as NodeSelection | null | undefined;
  return Boolean(maybeSelection?.node);
};

const isImageNodeSelection = (selection: unknown): selection is NodeSelection => {
  return isNodeSelection(selection) && selection.node.type?.name === "imageBlock";
};

const promptLink = (editor: TiptapEditor, range?: Range) => {
  if (!editor) {
    return;
  }

  if (range) {
    editor.chain().focus().deleteRange(range).run();
  }

  const previousUrl = editor.getAttributes("link")?.href ?? "https://";
  const inputUrl = window.prompt("Masukkan URL", previousUrl);
  if (inputUrl === null) {
    return;
  }

  const trimmed = inputUrl.trim();
  if (trimmed === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  const href = /^(?:https?|mailto|tel):/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  if (editor.state.selection.empty) {
    const textPrompt = window.prompt("Masukkan teks yang ingin diberi tautan", href);
    if (textPrompt === null) {
      return;
    }

    const label = textPrompt.trim();
    if (label === "") {
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: label,
        marks: [
          {
            type: "link",
            attrs: { href, target: "_blank", rel: "noopener noreferrer" },
          },
        ],
      })
      .run();
    return;
  }

  editor.chain().focus().extendMarkRange("link").setLink({ href, target: "_blank", rel: "noopener noreferrer" }).run();
};

const normalizeImageUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^(?:https?|data|blob|ftp):/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const promptImageUrlAndInsert = (editor: TiptapEditor) => {
  const urlInput = window.prompt("Masukkan URL gambar");
  if (urlInput === null) {
    return;
  }

  const normalizedUrl = normalizeImageUrl(urlInput);
  if (!normalizedUrl) {
    window.alert("URL gambar tidak valid.");
    return;
  }

  const altInput = window.prompt("Masukkan teks alt (opsional)", "");
  const alt = altInput ? altInput.trim() || undefined : undefined;

  const captionInput = window.prompt("Masukkan caption (opsional)", "");
  const caption = captionInput ? captionInput.trim() : "";

  editor
    .chain()
    .focus()
    .insertContent({
      type: "imageBlock",
      attrs: { src: normalizedUrl, alt, caption, width: 100 },
    })
    .run();
};

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(({ items, command }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) {
        return;
      }
      command(item);
    },
    [items, command]
  );

  useEffect(() => {
    setSelectedIndex(0);
    itemRefs.current = [];
  }, [items]);

  useEffect(() => {
    const selected = itemRefs.current[selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) {
        return false;
      }

      if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
        event.preventDefault();
        setSelectedIndex((index) => (index + 1) % items.length);
        return true;
      }

      if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
        event.preventDefault();
        setSelectedIndex((index) => (index + items.length - 1) % items.length);
        return true;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  if (!items.length) {
    return (
      <div className="slash-command">
        <div className="slash-command__empty">Tidak ada hasil</div>
      </div>
    );
  }

  return (
    <div className="slash-command" ref={containerRef}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = index === selectedIndex;
        return (
          <button
            type="button"
            key={item.title}
            className={`slash-command__item${isActive ? " is-active" : ""}`}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              selectItem(index);
            }}
          >
            <span className="slash-command__item-icon">
              <Icon size={18} />
            </span>
            <span className="slash-command__item-meta">
              <span className="slash-command__item-title">{item.title}</span>
              <span className="slash-command__item-description">{item.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
});

SlashCommandList.displayName = "SlashCommandList";

const createSlashCommandItems = (): SlashCommandItem[] => [
  {
    title: "Paragraph",
    description: "Gunakan teks paragraf biasa",
    icon: MdOutlineSegment,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).clearNodes().setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Judul besar",
    icon: MdLooksOne,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Subjudul",
    icon: MdLooksTwo,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Judul bagian",
    icon: MdLooks3,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet list",
    description: "Daftar tak berurut",
    icon: MdFormatListBulleted,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Ordered list",
    description: "Daftar bernomor",
    icon: MdFormatListNumbered,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Todo list",
    description: "Daftar tugas dengan checkbox",
    icon: MdChecklist,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Table",
    description: "Sisipkan tabel 3x4 dengan header",
    icon: MdTableChart,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      insertDefaultTable(editor);
    },
  },
  {
    title: "Align left",
    description: "Ratakan teks ke kiri",
    icon: MdFormatAlignLeft,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setTextAlign("left").run();
    },
  },
  {
    title: "Align center",
    description: "Ratakan teks ke tengah",
    icon: MdFormatAlignCenter,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setTextAlign("center").run();
    },
  },
  {
    title: "Align right",
    description: "Ratakan teks ke kanan",
    icon: MdFormatAlignRight,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setTextAlign("right").run();
    },
  },
  {
    title: "Justify",
    description: "Ratakan teks ke kedua sisi",
    icon: MdFormatAlignJustify,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setTextAlign("justify").run();
    },
  },
  {
    title: "Quote",
    description: "Soroti teks sebagai kutipan",
    icon: MdFormatQuote,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Divider",
    description: "Tambahkan garis pemisah",
    icon: MdHorizontalRule,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Image",
    description: "Unggah atau tempel gambar",
    icon: MdImage,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.command(({ tr }) => {
        const event = new CustomEvent<ImageEventDetail>("tiptap-trigger-image-upload", {
          detail: { position: tr.selection.from, editorId: getEditorInstanceId(editor) ?? null },
        });
        document.dispatchEvent(event);
        return true;
      });
    },
  },
  {
    title: "Image dari URL",
    description: "Sisipkan gambar menggunakan URL",
    icon: MdOutlineImage,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      promptImageUrlAndInsert(editor);
    },
  },
  {
    title: "Code block",
    description: "Format kode multi-baris",
    icon: BiCodeBlock,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Inline code",
    description: "Sorot potongan kode",
    icon: MdCode,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCode().run();
    },
  },
  {
    title: "Bold",
    description: "Tebalkan teks",
    icon: MdFormatBold,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBold().run();
    },
  },
  {
    title: "Italic",
    description: "Miringkan teks",
    icon: MdFormatItalic,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleItalic().run();
    },
  },
  {
    title: "Underline",
    description: "Garis-bawahi teks",
    icon: MdFormatUnderlined,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleUnderline().run();
    },
  },
  {
    title: "Strikethrough",
    description: "Coret teks",
    icon: MdFormatStrikethrough,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleStrike().run();
    },
  },
  {
    title: "Subscript",
    description: "Turunkan teks",
    icon: MdSubscript,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleSubscript().run();
    },
  },
  {
    title: "Superscript",
    description: "Naikkan teks",
    icon: MdSuperscript,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleSuperscript().run();
    },
  },
  {
    title: "Link",
    description: "Sisipkan tautan",
    icon: MdLink,
    action: ({ editor, range }) => {
      promptLink(editor, range);
    },
  },
];

const SlashCommandExtension = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: { editor: TiptapEditor; range: Range; props: SlashCommandItem }) => {
          const item = props;
          if (!item) {
            return;
          }

          item.action({ editor, range });

          window.setTimeout(() => {
            editor.chain().focus(range.to).run();
          }, 0);
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});

const createSlashCommandExtension = () =>
  SlashCommandExtension.configure({
    suggestion: {
      char: "/",
      allowSpaces: false,
      startOfLine: false,
      items: ({ query }: { query: string; editor: TiptapEditor }) => {
        const normalized = query.toLowerCase().trim();
        const items = createSlashCommandItems();
        if (!normalized.length) {
          return items.slice(0, 10);
        }

        return items
          .filter((item) => item.title.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized))
          .slice(0, 10);
      },
      render: () => {
        let component: ReactRenderer<SlashCommandListRef, SlashCommandListProps> | null = null;
        let popup: TippyInstance | null = null;

        return {
          onStart: (props: SuggestionProps) => {
            component = new ReactRenderer<SlashCommandListRef, SlashCommandListProps>(SlashCommandList, {
              props,
              editor: props.editor,
            });

            if (!props.clientRect) {
              return;
            }

            const instances = tippy(document.body, {
              getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
              offset: [0, 8],
              maxWidth: "calc(100vw - 32px)",
              popperOptions: {
                modifiers: [
                  { name: "preventOverflow", options: { padding: 8 } },
                  { name: "flip", options: { padding: 8 } },
                ],
              },
            });
            popup = (Array.isArray(instances) ? instances[0] : instances) ?? null;
          },
          onUpdate(props: SuggestionProps) {
            component?.updateProps(props);

            if (!props.clientRect) {
              return;
            }

            popup?.setProps({
              getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
            });
          },
          onKeyDown(props: SuggestionKeyDownProps) {
            if (props.event.key === "Escape") {
              popup?.hide();
              return true;
            }

            return component?.ref?.onKeyDown({ event: props.event }) ?? false;
          },
          onExit() {
            popup?.destroy();
            popup = null;
            component?.destroy();
            component = null;
          },
        };
      },
    },
  });

const slashCommandExtension = createSlashCommandExtension();

const performIndent = (editor: TiptapEditor | null) => {
  if (!editor) {
    return false;
  }

  if (editor.can().sinkListItem("taskItem")) {
    editor.chain().focus().sinkListItem("taskItem").run();
    return true;
  }

  if (editor.can().sinkListItem("listItem")) {
    editor.chain().focus().sinkListItem("listItem").run();
    return true;
  }

  return false;
};

const performOutdent = (editor: TiptapEditor | null) => {
  if (!editor) {
    return false;
  }

  if (editor.can().liftListItem("taskItem")) {
    editor.chain().focus().liftListItem("taskItem").run();
    return true;
  }

  if (editor.can().liftListItem("listItem")) {
    editor.chain().focus().liftListItem("listItem").run();
    return true;
  }

  return false;
};

const TEXT_COLOR_OPTIONS = [
  { name: "Slate", value: "#1f2937" },
  { name: "Gray", value: "#374151" },
  { name: "Zinc", value: "#3f3f46" },
  { name: "Neutral", value: "#3f3f3f" },
  { name: "Stone", value: "#44403c" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Amber", value: "#d97706" },
  { name: "Yellow", value: "#ca8a04" },
  { name: "Lime", value: "#65a30d" },
  { name: "Green", value: "#16a34a" },
  { name: "Emerald", value: "#059669" },
  { name: "Teal", value: "#0d9488" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Sky", value: "#0284c7" },
  { name: "Blue", value: "#2563eb" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Purple", value: "#9333ea" },
  { name: "Fuchsia", value: "#c026d3" },
  { name: "Pink", value: "#db2777" },
  { name: "Rose", value: "#e11d48" },
] as const;

const HIGHLIGHT_OPTIONS = [
  { name: "Lemon", value: "#fef9c3" },
  { name: "Daffodil", value: "#fde68a" },
  { name: "Sunset", value: "#fcd34d" },
  { name: "Mint", value: "#bbf7d0" },
  { name: "Aqua", value: "#99f6e4" },
  { name: "Sky", value: "#bae6fd" },
  { name: "Lavender", value: "#ddd6fe" },
  { name: "Blush", value: "#fecdd3" },
] as const;

const DEFAULT_TABLE_CONFIG = {
  rows: 3,
  cols: 4,
  withHeaderRow: true,
};

const insertDefaultTable = (editor: TiptapEditor | null) => {
  if (!editor) return false;
  return editor.chain().focus().insertTable(DEFAULT_TABLE_CONFIG).run();
};

const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const insertImagesFromFiles = async (editor: TiptapEditor, files: Iterable<File>, position?: number) => {
  const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
  if (!imageFiles.length) {
    return;
  }

  if (position !== undefined) {
    editor.chain().focus(position).run();
  } else {
    editor.chain().focus().run();
  }

  for (const file of imageFiles) {
    try {
      const src = await readFileAsDataURL(file);
      if (!src) continue;
      const alt = file.name?.replace(/\.[^/.]+$/, "") ?? "Image";
      editor
        .chain()
        .focus()
        .insertContent({ type: "imageBlock", attrs: { src, alt, caption: "", width: 100 } })
        .run();
    } catch (error) {
      console.error("Failed to read image file", error);
    }
  }
};

const tableCommands = {
  addRowAbove: (editor: TiptapEditor | null) => editor?.chain().focus().addRowBefore().run() ?? false,
  addRowBelow: (editor: TiptapEditor | null) => editor?.chain().focus().addRowAfter().run() ?? false,
  addColumnLeft: (editor: TiptapEditor | null) => editor?.chain().focus().addColumnBefore().run() ?? false,
  addColumnRight: (editor: TiptapEditor | null) => editor?.chain().focus().addColumnAfter().run() ?? false,
  deleteRow: (editor: TiptapEditor | null) => editor?.chain().focus().deleteRow().run() ?? false,
  deleteColumn: (editor: TiptapEditor | null) => editor?.chain().focus().deleteColumn().run() ?? false,
  deleteTable: (editor: TiptapEditor | null) => editor?.chain().focus().deleteTable().run() ?? false,
  toggleHeader: (editor: TiptapEditor | null) => editor?.chain().focus().toggleHeaderRow().run() ?? false,
};

const clampPercent = (value: unknown, fallback = 100) => {
  if (typeof value === "number" && Number.isFinite(value)) return Math.min(100, Math.max(10, Math.round(value)));
  if (typeof value === "string" && value) {
    const parsed = parseFloat(value.replace(/[^\d.]/g, ""));
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(10, Math.round(parsed)));
  }
  return fallback;
};

/**
 * ImageBlock: renders semantic <figure><img/><figcaption/></figure>
 * - caption stored as a string attribute (simple + SEO-friendly).
 * - parseHTML accepts both <figure data-type="image-block"> and plain <img>.
 */
const ImageBlock = TiptapNode.create({
  name: "imageBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      title: { default: null },
      caption: { default: "" },
      width: {
        default: 100,
        parseHTML: (element: HTMLElement) => {
          const fromData = element.getAttribute("data-width");
          if (fromData) return clampPercent(fromData, 100);

          const img =
            element.tagName.toLowerCase() === "img"
              ? (element as HTMLImageElement)
              : (element.querySelector?.("img") as HTMLImageElement | null) ?? null;

          if (img) {
            const w = img.getAttribute("data-width") ?? img.style.width ?? img.getAttribute("width");
            if (w) return clampPercent(w, 100);
          }

          const w2 = (element as HTMLElement).style?.width;
          if (w2) return clampPercent(w2, 100);
          return 100;
        },
        renderHTML: (attributes: { width?: number }) => {
          const width = clampPercent(attributes?.width, 100);
          return { "data-width": width };
        },
      },
    } satisfies Record<string, unknown>;
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="image-block"]',
        getAttrs: (el) => {
          const element = el as HTMLElement;
          const img = element.querySelector("img") as HTMLImageElement | null;
          const captionEl = element.querySelector("figcaption") as HTMLElement | null;
          const width = element.getAttribute("data-width") ?? img?.getAttribute("data-width") ?? img?.style?.width ?? img?.getAttribute("width");
          return {
            src: img?.getAttribute("src") ?? null,
            alt: img?.getAttribute("alt") ?? "",
            title: img?.getAttribute("title") ?? null,
            caption: captionEl?.textContent ?? "",
            width: clampPercent(width, 100),
          };
        },
      },
      {
        tag: "img[src]",
        getAttrs: (el) => {
          const img = el as HTMLImageElement;
          const width = img.getAttribute("data-width") ?? img.style.width ?? img.getAttribute("width");
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") ?? "",
            title: img.getAttribute("title") ?? null,
            caption: "",
            width: clampPercent(width, 100),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = (HTMLAttributes.src as string | null) ?? null;
    const alt = (HTMLAttributes.alt as string | null) ?? "";
    const title = (HTMLAttributes.title as string | null) ?? null;
    const caption = (HTMLAttributes.caption as string | null) ?? "";
    const width = clampPercent(HTMLAttributes.width, 100);

    const figureAttrs: Record<string, string> = {
      "data-type": "image-block",
      "data-width": String(width),
      class: "editor-image-block",
    };

    const imgAttrs: Record<string, string> = {
      src: src ?? "",
      alt,
      style: `width: ${width}%; height: auto;`,
      "data-width": String(width),
      class: "editor-image",
    };
    if (title) imgAttrs.title = title;

    if (caption && caption.trim().length > 0) {
      return ["figure", figureAttrs, ["img", imgAttrs], ["figcaption", { class: "editor-image-caption" }, caption]];
    }
    return ["figure", figureAttrs, ["img", imgAttrs]];
  },
});

const ImageFileHandlerExtension = Extension.create({
  name: "imageFileHandler",
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const files = event.clipboardData?.files;
            if (!files?.length) return false;
            const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
            if (!imageFiles.length) return false;
            event.preventDefault();
            void insertImagesFromFiles(editor, imageFiles, view.state.selection.from);
            return true;
          },
          handleDrop(view, event) {
            const files = event.dataTransfer?.files;
            if (!files?.length) return false;
            const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
            if (!imageFiles.length) return false;
            event.preventDefault();
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const position = coordinates?.pos ?? view.state.selection.from;
            void insertImagesFromFiles(editor, imageFiles, position);
            return true;
          },
        },
      }),
    ];
  },
});

type TextEditorProps = {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
};

const TextEditor = ({ value = "", onChange, placeholder = "Mulai mengetik...", className, contentClassName }: TextEditorProps) => {
  const editorInstanceId = useId();

  // Match shadcn/ui Input focus treatment (focus ring + border) using focus-within,
  // because TipTap focuses the inner ProseMirror element instead of the wrapper.
  const wrapperClassName = [
    "text-editor",
    // Match shadcn/ui Input styling
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none",
    // Use focus-within because TipTap focuses the inner ProseMirror element
    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Add a left gutter so the DragHandle stays inside the editor container.
  const editorContentClassName = [
    "text-editor__content tiptap min-h-[180px]",
    // Match shadcn Input typography: mobile text-base, desktop text-sm
    "text-base md:text-sm leading-5",
    // Match shadcn selection colors
    "selection:bg-primary selection:text-primary-foreground",
    // Symmetric padding; a bit wider on desktop to fit the drag handle INSIDE without overlapping text
    "px-3 py-2 md:px-6 focus:outline-none",
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        heading: false,
        link: false,
        underline: false,
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "editor-heading",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "editor-table" },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: { class: "editor-table__header" },
      }),
      TableCell.configure({
        HTMLAttributes: { class: "editor-table__cell" },
      }),
      ImageBlock,
      ImageFileHandlerExtension,
      Link.configure({
        openOnClick: false,
        linkOnPaste: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "task-item" },
      }),
      slashCommandExtension,
      Highlight.configure({ multicolor: true }),
      Underline,
      Subscript,
      Superscript,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: editorContentClassName,
        "data-editor-id": editorInstanceId,
      },
      handleDOMEvents: {
        keydown: (_view, event) => {
          if (event.key === "Tab") {
            if (event.shiftKey) {
              const handled = performOutdent(editor);
              if (handled) {
                event.preventDefault();
                return true;
              }
            } else {
              const handled = performIndent(editor);
              if (handled) {
                event.preventDefault();
                return true;
              }
            }
          }

          return false;
        },
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    if (value !== undefined && value !== currentContent) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);

    update();

    // Safari < 14 fallback
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const handleBubbleButtonMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const headingTriggerIsActive = editor ? editor.isActive("heading") : false;
  const headingLevel = editor?.getAttributes("heading")?.level ?? null;
  const listTriggerIsActive = editor ? ["bulletList", "orderedList", "taskList"].some((name) => editor.isActive(name)) : false;
  const [bubbleMenuContent, setBubbleMenuContent] = useState<HTMLDivElement | null>(null);
  const currentTextColor = editor?.getAttributes("textStyle")?.color ?? null;
  const highlightActive = editor?.isActive("highlight") ?? false;
  const highlightColor = highlightActive ? editor?.getAttributes("highlight")?.color ?? null : null;
  const colorButtonStyle =
    currentTextColor || highlightColor
      ? ({
          ...(currentTextColor ? { "--text-color-chip": currentTextColor } : {}),
          ...(highlightColor ? { "--highlight-color-chip": highlightColor } : {}),
        } as CSSProperties)
      : undefined;
  const currentAlignment = editor?.isActive({ textAlign: "center" })
    ? "center"
    : editor?.isActive({ textAlign: "right" })
    ? "right"
    : editor?.isActive({ textAlign: "justify" })
    ? "justify"
    : "left";
  const alignmentIcons: Record<"left" | "center" | "right" | "justify", IconType> = {
    left: MdFormatAlignLeft,
    center: MdFormatAlignCenter,
    right: MdFormatAlignRight,
    justify: MdFormatAlignJustify,
  };
  const AlignmentIcon = alignmentIcons[currentAlignment];
  const canIndent = editor ? editor.can().sinkListItem("taskItem") || editor.can().sinkListItem("listItem") : false;
  const canOutdent = editor ? editor.can().liftListItem("taskItem") || editor.can().liftListItem("listItem") : false;
  const tableActive = editor?.isActive("table") ?? false;
  const canAddRowAbove = editor ? editor.can().addRowBefore() : false;
  const canAddRowBelow = editor ? editor.can().addRowAfter() : false;
  const canAddColumnLeft = editor ? editor.can().addColumnBefore() : false;
  const canAddColumnRight = editor ? editor.can().addColumnAfter() : false;
  const canDeleteRow = editor ? editor.can().deleteRow() : false;
  const canDeleteColumn = editor ? editor.can().deleteColumn() : false;
  const canDeleteTable = editor ? editor.can().deleteTable() : false;
  const canToggleHeader = editor ? editor.can().toggleHeaderRow() : false;
  const headerRowActive = editor?.isActive("tableHeader") ?? false;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileDialogOpenRef = useRef(false);
  const clampImageWidth = useCallback((raw: unknown) => {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return Math.min(100, Math.max(10, Math.round(raw)));
    }
    if (typeof raw === "string" && raw) {
      const parsed = parseFloat(raw.replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed)) {
        return Math.min(100, Math.max(10, Math.round(parsed)));
      }
    }
    return 100;
  }, []);

  // Radix Slider is a controlled component. TipTap editor state updates do not automatically
  // re-render React, so we keep an explicit state for the active image width.
  const [activeImageWidth, setActiveImageWidth] = useState<number>(100);
  const [activeImageAlt, setActiveImageAlt] = useState<string>("");
  const [activeImageCaption, setActiveImageCaption] = useState<string>("");
  const rafRef = useRef<number | null>(null);
  const pendingWidthRef = useRef<number>(100);
  const activeImagePosRef = useRef<number | null>(null);
  const altPreview = activeImageAlt.trim();
  const captionPreview = activeImageCaption.trim();
  const hasActiveAlt = altPreview.length > 0;
  const hasActiveCaption = captionPreview.length > 0;

  const syncActiveImageAttrs = useCallback(() => {
    if (!editor) {
      activeImagePosRef.current = null;
      return;
    }
    const { selection } = editor.state;
    if (!isImageNodeSelection(selection)) {
      activeImagePosRef.current = null;
      return;
    }
    const attrs = selection.node.attrs as { width?: unknown; alt?: unknown; caption?: unknown };
    const width = clampImageWidth(attrs?.width);
    setActiveImageWidth(width);
    setActiveImageAlt(typeof attrs?.alt === "string" ? attrs.alt : "");
    setActiveImageCaption(typeof attrs?.caption === "string" ? attrs.caption : "");
    pendingWidthRef.current = width;
    activeImagePosRef.current = selection.from;
  }, [editor, clampImageWidth]);

  useEffect(() => {
    if (!editor) return;
    syncActiveImageAttrs();
    editor.on("selectionUpdate", syncActiveImageAttrs);
    editor.on("transaction", syncActiveImageAttrs);
    return () => {
      editor.off("selectionUpdate", syncActiveImageAttrs);
      editor.off("transaction", syncActiveImageAttrs);
    };
  }, [editor, syncActiveImageAttrs]);

  const applyImageWidthToEditor = useCallback(
    (width: number) => {
      if (!editor) return;
      pendingWidthRef.current = width;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const pos = activeImagePosRef.current;
        if (pos === null) {
          return;
        }
        const widthToApply = pendingWidthRef.current;
        editor
          .chain()
          .focus()
          .command(({ tr, dispatch }) => {
            const node = tr.doc.nodeAt(pos);
            if (!node || node.type.name !== "imageBlock") {
              return false;
            }
            const nextAttrs = { ...node.attrs, width: widthToApply };
            tr.setNodeMarkup(pos, undefined, nextAttrs);
            if (dispatch) {
              dispatch(tr);
            }
            return true;
          })
          .run();
      });
    },
    [editor]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleImageInsertion = useCallback(
    async (files: Iterable<File>, position?: number) => {
      if (!editor) return;
      await insertImagesFromFiles(editor, files, position);
    },
    [editor]
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) {
        fileDialogOpenRef.current = false;
        return;
      }
      const insertion = handleImageInsertion(files);
      insertion?.finally(() => {
        fileDialogOpenRef.current = false;
      });
      event.target.value = "";
    },
    [handleImageInsertion]
  );

  const handleImageButtonClick = useCallback(() => {
    if (fileDialogOpenRef.current) return;
    fileDialogOpenRef.current = true;
    // Delay to avoid double-trigger when invoked from dropdown/select handlers.
    window.setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      fileDialogOpenRef.current = false;
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleImageWidthChange = useCallback(
    (value: number) => {
      const width = Math.min(100, Math.max(10, Math.round(value)));
      setActiveImageWidth(width);
      applyImageWidthToEditor(width);
    },
    [applyImageWidthToEditor]
  );

  const handleEditImageAlt = useCallback(() => {
    if (!editor) return;
    const currentAlt = (editor.getAttributes("imageBlock")?.alt as string | undefined) ?? "";
    const input = window.prompt("Alt text untuk gambar (SEO)", currentAlt);
    if (input === null) return;
    const alt = input.trim();
    setActiveImageAlt(alt);
    editor.chain().focus().updateAttributes("imageBlock", { alt }).run();
  }, [editor]);

  const handleEditImageCaption = useCallback(() => {
    if (!editor) return;
    const currentCaption = (editor.getAttributes("imageBlock")?.caption as string | undefined) ?? "";
    const input = window.prompt("Caption untuk gambar (opsional)", currentCaption);
    if (input === null) return;
    const caption = input.trim();
    setActiveImageCaption(caption);
    editor.chain().focus().updateAttributes("imageBlock", { caption }).run();
  }, [editor]);

  const handleInsertImageFromUrl = useCallback(() => {
    if (!editor) return;
    promptImageUrlAndInsert(editor);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const applyPosition = (position?: number) => {
      if (position === undefined) {
        return;
      }
      const doc = editor.state.doc;
      const resolved = doc.resolve(Math.min(Math.max(position, 0), doc.content.size));
      const tr = editor.state.tr.setSelection(TextSelection.near(resolved));
      editor.view.dispatch(tr);
    };

    const uploadListener = (event: Event) => {
      const customEvent = event as CustomEvent<ImageEventDetail>;
      const targetId = customEvent.detail?.editorId ?? null;
      if (targetId && targetId !== editorInstanceId) {
        return;
      }
      applyPosition(customEvent.detail?.position);
      editor.view.focus();
      handleImageButtonClick();
    };

    const urlListener = (event: Event) => {
      const customEvent = event as CustomEvent<ImageEventDetail>;
      const targetId = customEvent.detail?.editorId ?? null;
      if (targetId && targetId !== editorInstanceId) {
        return;
      }
      applyPosition(customEvent.detail?.position);
      editor.view.focus();
      handleInsertImageFromUrl();
    };

    document.addEventListener("tiptap-trigger-image-upload", uploadListener);
    document.addEventListener("tiptap-insert-image-url", urlListener);
    return () => {
      document.removeEventListener("tiptap-trigger-image-upload", uploadListener);
      document.removeEventListener("tiptap-insert-image-url", urlListener);
    };
  }, [editor, editorInstanceId, handleImageButtonClick, handleInsertImageFromUrl]);

  const handleLinkButtonClick = useCallback(() => {
    if (!editor) return;
    promptLink(editor);
  }, [editor]);

  const handleDragEnd = useCallback(() => {
    if (!editor) return;

    requestAnimationFrame(() => {
      const { state } = editor;
      const { selection } = state;
      const docSize = state.doc.content.size;
      const rawPos = isNodeSelection(selection) ? Math.max(selection.to - 1, 0) : selection.to;
      const clampedPos = Math.max(0, Math.min(rawPos, docSize));

      editor.chain().focus().setTextSelection(clampedPos).run();
    });
  }, [editor]);

  return (
    <div className={wrapperClassName}>
      {editor && isDesktop && (
        <>
          <BubbleMenu
            editor={editor}
            options={{
              placement: "top",
              offset: 8,
              flip: { padding: 8 },
              shift: { padding: 8 },
            }}
            className="bubble-menu"
            shouldShow={({ editor }) => {
              if (!isDesktop) {
                return false;
              }
              if (editor.isActive("imageBlock")) {
                return false;
              }
              const { selection } = editor.state;
              return selection instanceof TextSelection && !selection.empty;
            }}
          >
            <div ref={setBubbleMenuContent} className="bubble-menu__content">
              <button
                type="button"
                title="Bold"
                aria-label="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("bold") ? "is-active" : ""}
              >
                <MdFormatBold size={18} />
              </button>
              <button
                type="button"
                title="Italic"
                aria-label="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("italic") ? "is-active" : ""}
              >
                <MdFormatItalic size={18} />
              </button>
              <button
                type="button"
                title="Underline"
                aria-label="Underline"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("underline") ? "is-active" : ""}
              >
                <MdFormatUnderlined size={18} />
              </button>
              <button
                type="button"
                title="Strikethrough"
                aria-label="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("strike") ? "is-active" : ""}
              >
                <MdFormatStrikethrough size={18} />
              </button>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    title="Alignment"
                    aria-label="Alignment"
                    onMouseDown={handleBubbleButtonMouseDown}
                    className={currentAlignment !== "left" ? "is-active" : ""}
                  >
                    <AlignmentIcon size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={bubbleMenuContent ?? undefined}>
                  <DropdownMenu.Content
                    className="bubble-menu__dropdown"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={8}
                    avoidCollisions
                  >
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().setTextAlign("left").run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={currentAlignment === "left"}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatAlignLeft size={16} />
                      </span>
                      Align left
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().setTextAlign("center").run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={currentAlignment === "center"}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatAlignCenter size={16} />
                      </span>
                      Align center
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().setTextAlign("right").run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={currentAlignment === "right"}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatAlignRight size={16} />
                      </span>
                      Align right
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().setTextAlign("justify").run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={currentAlignment === "justify"}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatAlignJustify size={16} />
                      </span>
                      Justify
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <button
                type="button"
                title="Indent"
                aria-label="Indent"
                onClick={() => performIndent(editor)}
                onMouseDown={handleBubbleButtonMouseDown}
                disabled={!canIndent}
              >
                <MdFormatIndentIncrease size={18} />
              </button>
              <button
                type="button"
                title="Outdent"
                aria-label="Outdent"
                onClick={() => performOutdent(editor)}
                onMouseDown={handleBubbleButtonMouseDown}
                disabled={!canOutdent}
              >
                <MdFormatIndentDecrease size={18} />
              </button>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    title="Heading"
                    aria-label="Heading"
                    onMouseDown={handleBubbleButtonMouseDown}
                    className={headingTriggerIsActive ? "is-active" : ""}
                    data-heading-level={headingLevel ?? undefined}
                  >
                    <MdTitle size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={bubbleMenuContent ?? undefined}>
                  <DropdownMenu.Content
                    className="bubble-menu__dropdown"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={8}
                    avoidCollisions
                  >
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().setParagraph().run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={!headingTriggerIsActive}
                    >
                      Paragraph
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().toggleHeading({ level: 1 }).run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={headingLevel === 1}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdLooksOne size={16} />
                      </span>
                      Heading 1
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().toggleHeading({ level: 2 }).run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={headingLevel === 2}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdLooksTwo size={16} />
                      </span>
                      Heading 2
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().toggleHeading({ level: 3 }).run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                      data-active={headingLevel === 3}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdLooks3 size={16} />
                      </span>
                      Heading 3
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <button
                type="button"
                title="Link"
                aria-label="Link"
                onClick={handleLinkButtonClick}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("link") ? "is-active" : ""}
              >
                <MdLink size={18} />
              </button>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button type="button" title="Image" aria-label="Image" onMouseDown={handleBubbleButtonMouseDown}>
                    <MdImage size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={bubbleMenuContent ?? undefined}>
                  <DropdownMenu.Content
                    className="bubble-menu__dropdown"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={8}
                    avoidCollisions
                  >
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        handleImageButtonClick();
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdCloudUpload size={16} />
                      </span>
                      Unggah gambar
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        handleInsertImageFromUrl();
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdOutlineImage size={16} />
                      </span>
                      Gambar dari URL
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <button
                type="button"
                title="Quote"
                aria-label="Quote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("blockquote") ? "is-active" : ""}
              >
                <MdFormatQuote size={18} />
              </button>
              <button
                type="button"
                title="Divider"
                aria-label="Divider"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                onMouseDown={handleBubbleButtonMouseDown}
              >
                <MdHorizontalRule size={18} />
              </button>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    title="List Tools"
                    aria-label="List Tools"
                    onMouseDown={handleBubbleButtonMouseDown}
                    className={listTriggerIsActive ? "is-active" : ""}
                  >
                    <MdFormatListBulleted size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={bubbleMenuContent ?? undefined}>
                  <DropdownMenu.Content
                    className="bubble-menu__dropdown"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={8}
                    avoidCollisions
                  >
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().toggleBulletList().run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatListBulleted size={16} />
                      </span>
                      Bullet list
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().toggleOrderedList().run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatListNumbered size={16} />
                      </span>
                      Ordered list
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().toggleTaskList().run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdChecklist size={16} />
                      </span>
                      Todo list
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        if (performIndent(editor)) {
                          window.setTimeout(() => editor.commands.blur(), 0);
                        }
                      }}
                      disabled={!canIndent}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatIndentIncrease size={16} />
                      </span>
                      Indent
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        if (performOutdent(editor)) {
                          window.setTimeout(() => editor.commands.blur(), 0);
                        }
                      }}
                      disabled={!canOutdent}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatIndentDecrease size={16} />
                      </span>
                      Outdent
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="bubble-menu__dropdown-separator" />
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        const lifted = editor.chain().focus().liftListItem("listItem").run();
                        if (!lifted) {
                          editor.chain().focus().setParagraph().run();
                        }
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatClear size={16} />
                      </span>
                      Clear list
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    title="Table Tools"
                    aria-label="Table Tools"
                    onMouseDown={handleBubbleButtonMouseDown}
                    className={tableActive ? "is-active" : ""}
                  >
                    <MdTableChart size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={bubbleMenuContent ?? undefined}>
                  <DropdownMenu.Content
                    className="bubble-menu__dropdown"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={8}
                    avoidCollisions
                  >
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        insertDefaultTable(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdTableChart size={16} />
                      </span>
                      Insert table
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="bubble-menu__dropdown-separator" />
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.addRowAbove(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canAddRowAbove}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdBorderTop size={16} />
                      </span>
                      Add row above
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.addRowBelow(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canAddRowBelow}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdBorderBottom size={16} />
                      </span>
                      Add row below
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.addColumnLeft(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canAddColumnLeft}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdBorderLeft size={16} />
                      </span>
                      Add column left
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.addColumnRight(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canAddColumnRight}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdBorderRight size={16} />
                      </span>
                      Add column right
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="bubble-menu__dropdown-separator" />
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.toggleHeader(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canToggleHeader}
                      data-active={headerRowActive}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdOutlineSegment size={16} />
                      </span>
                      Toggle header row
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.deleteRow(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canDeleteRow}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdDeleteForever size={16} />
                      </span>
                      Delete row
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.deleteColumn(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canDeleteColumn}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdDeleteForever size={16} />
                      </span>
                      Delete column
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        tableCommands.deleteTable(editor);
                        window.setTimeout(() => editor?.commands.blur(), 0);
                      }}
                      disabled={!canDeleteTable}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdDeleteForever size={16} />
                      </span>
                      Delete table
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    title="Color & Highlight"
                    aria-label="Color & Highlight"
                    onMouseDown={handleBubbleButtonMouseDown}
                    className={currentTextColor || highlightActive ? "is-active" : ""}
                    data-text-color-active={currentTextColor ? "true" : undefined}
                    data-highlight-active={highlightActive ? "true" : undefined}
                    style={colorButtonStyle}
                  >
                    <MdPalette size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={bubbleMenuContent ?? undefined}>
                  <DropdownMenu.Content
                    className="bubble-menu__dropdown bubble-menu__dropdown--colors"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={8}
                    avoidCollisions
                  >
                    <DropdownMenu.Label className="bubble-menu__dropdown-label">Text color</DropdownMenu.Label>
                    <div className="bubble-menu__color-grid" role="none">
                      {TEXT_COLOR_OPTIONS.map((color) => (
                        <DropdownMenu.Item
                          key={color.value}
                          className="bubble-menu__dropdown-color"
                          onSelect={() => {
                            editor.chain().focus().setColor(color.value).run();
                            window.setTimeout(() => editor.commands.blur(), 0);
                          }}
                          data-active={editor.isActive("textStyle", { color: color.value })}
                          style={{ "--color-chip": color.value } as CSSProperties}
                        >
                          <span aria-hidden />
                          {color.name}
                        </DropdownMenu.Item>
                      ))}
                    </div>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().unsetColor().run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatClear size={16} />
                      </span>
                      Reset text color
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="bubble-menu__dropdown-separator" />
                    <DropdownMenu.Label className="bubble-menu__dropdown-label">Highlight</DropdownMenu.Label>
                    <div className="bubble-menu__color-grid" role="none">
                      {HIGHLIGHT_OPTIONS.map((color) => (
                        <DropdownMenu.Item
                          key={color.value}
                          className="bubble-menu__dropdown-color bubble-menu__dropdown-color--highlight"
                          onSelect={() => {
                            editor.chain().focus().setHighlight({ color: color.value }).run();
                            window.setTimeout(() => editor.commands.blur(), 0);
                          }}
                          data-active={editor.isActive("highlight", { color: color.value })}
                          style={{ "--color-chip": color.value } as CSSProperties}
                        >
                          <span aria-hidden />
                          {color.name}
                        </DropdownMenu.Item>
                      ))}
                    </div>
                    <DropdownMenu.Item
                      className="bubble-menu__dropdown-item"
                      onSelect={() => {
                        editor.chain().focus().unsetHighlight().run();
                        window.setTimeout(() => editor.commands.blur(), 0);
                      }}
                    >
                      <span className="bubble-menu__dropdown-icon" aria-hidden>
                        <MdFormatClear size={16} />
                      </span>
                      Reset highlight
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <button
                type="button"
                title="Subscript"
                aria-label="Subscript"
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("subscript") ? "is-active" : ""}
              >
                <MdSubscript size={18} />
              </button>
              <button
                type="button"
                title="Superscript"
                aria-label="Superscript"
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("superscript") ? "is-active" : ""}
              >
                <MdSuperscript size={18} />
              </button>
              <button
                type="button"
                title="Code"
                aria-label="Code"
                onClick={() => editor.chain().focus().toggleCode().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("code") ? "is-active" : ""}
              >
                <MdCode size={18} />
              </button>
              <button
                type="button"
                title="Code Block"
                aria-label="Code Block"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                onMouseDown={handleBubbleButtonMouseDown}
                className={editor.isActive("codeBlock") ? "is-active" : ""}
              >
                <BiCodeBlock size={18} />
              </button>
            </div>
          </BubbleMenu>
          <BubbleMenu
            editor={editor}
            options={{
              placement: "bottom",
              offset: 16,
              flip: { padding: 8 },
              shift: { padding: 8 },
            }}
            className="bubble-menu bubble-menu--image"
            shouldShow={({ editor }) => isDesktop && editor.isActive("imageBlock")}
            pluginKey="imageControls"
          >
            <div className="image-resizer-menu" onMouseDown={(event) => event.preventDefault()} onPointerDown={(event) => event.preventDefault()}>
              <span className="image-resizer-menu__label">Lebar {activeImageWidth}%</span>
              <Slider.Root
                className="image-resizer-menu__slider"
                min={10}
                max={100}
                step={1}
                value={[activeImageWidth]}
                onValueChange={([value]) => handleImageWidthChange(value ?? activeImageWidth)}
                onValueCommit={([value]) => handleImageWidthChange(value ?? activeImageWidth)}
              >
                <Slider.Track className="image-resizer-menu__track">
                  <Slider.Range className="image-resizer-menu__range" />
                </Slider.Track>
                <Slider.Thumb className="image-resizer-menu__thumb" aria-label="Image width" />
              </Slider.Root>
              <button
                type="button"
                className="image-resizer-menu__alt"
                data-active={hasActiveAlt ? "true" : "false"}
                aria-pressed={hasActiveAlt}
                onMouseDown={handleBubbleButtonMouseDown}
                onClick={handleEditImageAlt}
                title={hasActiveAlt ? `Alt: ${altPreview}` : "Tambahkan ALT (SEO)"}
                aria-label="Edit alt text"
              >
                <MdAltText size={16} aria-hidden />
                <span className="image-resizer-menu__alt-label">Alt</span>
              </button>
              <button
                type="button"
                className="image-resizer-menu__alt"
                data-active={hasActiveCaption ? "true" : "false"}
                aria-pressed={hasActiveCaption}
                onMouseDown={handleBubbleButtonMouseDown}
                onClick={handleEditImageCaption}
                title={hasActiveCaption ? `Caption: ${captionPreview}` : "Tambahkan caption (opsional)"}
                aria-label="Edit caption"
              >
                <MdOutlineSegment size={16} aria-hidden />
                <span className="image-resizer-menu__alt-label">Caption</span>
              </button>
            </div>
          </BubbleMenu>
          <DragHandle editor={editor} className="drag-handle hidden md:flex" onElementDragEnd={handleDragEnd}>
            <button type="button" className="drag-handle__button" aria-label="Pindahkan blok">
              <MdDragIndicator size={18} aria-hidden />
            </button>
          </DragHandle>
        </>
      )}
      <EditorContent editor={editor} />
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="text-editor__file-input" onChange={handleFileInputChange} />
    </div>
  );
};

export default TextEditor;
