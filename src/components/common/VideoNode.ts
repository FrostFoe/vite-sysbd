import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
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
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
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
        getAttrs: (dom) => {
          const video = dom as HTMLVideoElement;
          return {
            src: video.getAttribute("src"),
            alt: video.getAttribute("alt"),
            title: video.getAttribute("title"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "controls",
        crossorigin: "anonymous",
        style: "width: 100%; height: auto;",
      }),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
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
