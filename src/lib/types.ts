export type PortEntry = {
  pid: number;
  port: number;
  process_name: string;
  exe_path: string | null;
  icon_b64: string | null;
};

export type WindowMode = "menu" | "popped";
