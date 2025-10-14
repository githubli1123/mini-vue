import pkg from "./package.json" assert { type: 'json' };
import typescript from "@rollup/plugin-typescript";
import path from "path";

export default {
  input: "./src/index.ts",
  output: [
    // 1. cjs - CommonJS
    // 2. esm
    {
      format: "cjs",
      dir: `${path.dirname(pkg.main)}`, // "./lib", // 使用 dir 选项代替 file（推荐 ✅）
      entryFileNames: `${path.basename(pkg.main)}`, // 可选：自定义入口文件名
    },
    {
      format: "es",
      dir: `${path.dirname(pkg.module)}`,
      entryFileNames: `${path.basename(pkg.module)}`,
    },
  ],

  plugins: [
    // 使用 Rollup 打包 TypeScript 项目，您需要安装并配置专门的 TypeScript 插件
    typescript(),
  ],
};
