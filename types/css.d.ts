declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '@mysten/dapp-kit/dist/index.css' {
  const content: Record<string, string>;
  export default content;
}
