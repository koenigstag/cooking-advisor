export type Migration = {
  name: string;
  up: (raw: any) => any;
};
