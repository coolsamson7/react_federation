import { DeclareProperty } from "../decorators";

export enum GridSizeMode {
  auto = "auto",
  fr = "fr",
  px = "px",
  percent = "%",
  minmax = "minmax",
}

export enum GridAlignment {
  start = "start",
  center = "center",
  end = "end",
  stretch = "stretch",
}

/**
 * Represents a single row or column in a grid
 */
export class GridItem {
  @DeclareProperty({
    label: "Size Mode",
    type: "select",
    options: ["auto", "fr", "px", "%", "minmax"],
    defaultValue: "fr",
  })
  sizeMode: GridSizeMode = GridSizeMode.fr;

  @DeclareProperty({
    label: "Size",
    type: "number",
    defaultValue: 1,
  })
  size: number = 1;

  @DeclareProperty({
    label: "Alignment",
    type: "select",
    options: ["start", "center", "end", "stretch"],
    defaultValue: "start",
  })
  alignment: GridAlignment = GridAlignment.start;

  constructor(
    sizeMode: GridSizeMode = GridSizeMode.fr,
    size: number = 1,
    alignment: GridAlignment = GridAlignment.start
  ) {
    this.sizeMode = sizeMode;
    this.size = size;
    this.alignment = alignment;
  }

  /**
   * Convert to CSS grid track value
   */
  toCSSValue(): string {
    switch (this.sizeMode) {
      case GridSizeMode.auto:
        return "auto";
      case GridSizeMode.fr:
        return `${this.size}fr`;
      case GridSizeMode.px:
        return `${this.size}px`;
      case GridSizeMode.percent:
        return `${this.size}%`;
      case GridSizeMode.minmax:
        return `minmax(${this.size}px, 1fr)`;
      default:
        return "1fr";
    }
  }

  /**
   * Parse from CSS grid track value
   */
  static fromCSSValue(value: string): GridItem {
    const item = new GridItem();

    if (value === "auto") {
      item.sizeMode = GridSizeMode.auto;
      item.size = 0;
    } else if (value.endsWith("fr")) {
      item.sizeMode = GridSizeMode.fr;
      item.size = parseFloat(value);
    } else if (value.endsWith("px")) {
      item.sizeMode = GridSizeMode.px;
      item.size = parseFloat(value);
    } else if (value.endsWith("%")) {
      item.sizeMode = GridSizeMode.percent;
      item.size = parseFloat(value);
    } else if (value.startsWith("minmax")) {
      item.sizeMode = GridSizeMode.minmax;
      const match = value.match(/minmax\((\d+)px/);
      item.size = match ? parseFloat(match[1]) : 100;
    }

    return item;
  }
}
