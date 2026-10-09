export interface ThemeColors {
  background: {
    base: string;
    surface: string;
    overlay: string;
    elevated: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  accent: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    text: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  editor: {
    background: string;
    cursor: string;
    selection: string;
    lineHighlight: string;
    gutterBackground: string;
    gutterForeground: string;
  };
  grid: {
    headerBackground: string;
    headerText: string;
    rowEven: string;
    rowOdd: string;
    rowHover: string;
    rowSelected: string;
    cellBorder: string;
    nullValue: string;
  };
}

export interface SqlXTheme {
  name: string;
  type: 'dark' | 'light';
  colors: ThemeColors;
}
