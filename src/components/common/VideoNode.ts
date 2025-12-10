import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      /**
       * Insert a video
       */
      setVideo: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

interface VideoOptions {
  inline: boolean;
  allowBase64: boolean;
}

/**
 * Video Node Extension for TipTap
 * Handles embedding of video files and external video URLs
 */
export const VideoNode = Node.create<VideoOptions>({
  name: "video",

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
    };
  },

  inline() {
    return this.options.inline;
  },

  group: "block",

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => ({
          src: element.querySelector("video")?.src,
        }),
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
      alt: {
        default: null,
        parseHTML: (element) => ({
          alt: element.querySelector("video")?.getAttribute("alt"),
        }),
        renderHTML: (attributes) => ({
          alt: attributes.alt,
        }),
      },
      title: {
        default: null,
        parseHTML: (element) => ({
          title: element.querySelector("video")?.getAttribute("title"),
        }),
        renderHTML: (attributes) => ({
          title: attributes.title,
        }),
      },
      width: {
        default: "100%",
      },
      height: {
        default: "auto",
      },
      controls: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "video-wrapper" },
      [
        "video",
        mergeAttributes(HTMLAttributes, {
          controls: "controls",
          style: `max-width: 100%; height: auto; width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height};`,
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default VideoNode;
