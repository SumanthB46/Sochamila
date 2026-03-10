import { TextLayer } from "@/types/editor";

export function getTextStyle(layer: TextLayer): React.CSSProperties {
  switch (layer.textStyle) {
    case "shadow":
      return {
        textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
      };

    case "outline":
      return {
        WebkitTextStroke: "1px black",
        color: layer.color,
      };

    case "3d":
      return {
        textShadow: `
          1px 1px 0 #000,
          2px 2px 0 #000,
          3px 3px 0 #000,
          4px 4px 0 #000
        `,
      };

    case "normal":
    default:
      return {};
  }
}
